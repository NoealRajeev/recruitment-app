// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { sendEmail } from "@/lib/utils/email-service";
import { getClientDeletionEmail } from "@/lib/utils/email-templates";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") return null;
  return session;
}

function normalizePlusCodeSpace(raw?: string | null): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const withPlus = s.startsWith("+") ? s : `+${s}`;
  const m = /^\+(\d{1,4})\s*(.*)$/.exec(withPlus);
  if (!m) return null;
  const code = m[1];
  const rest = (m[2] ?? "").replace(/\s+/g, "");
  return `+${code}${rest ? ` ${rest}` : ""}`;
}

/** GET: fetch company + user */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

/** PATCH: edit company fields (email/phone locked server-side) */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ...auth, params, parse body...
  const { id } = await context.params;
  const { user, ...company } = await req.json();

  const userUpdate: Record<string, any> = {};
  if (user) {
    if (user.profilePicture !== undefined)
      userUpdate.profilePicture = user.profilePicture;
    if (user.altContact !== undefined)
      userUpdate.altContact = normalizePlusCodeSpace(user.altContact);
  }

  const updated = await prisma.client.update({
    where: { id },
    data: {
      ...company,
      ...(Object.keys(userUpdate).length
        ? { user: { update: userUpdate } }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          altContact: true,
          profilePicture: true,
          name: true,
        },
      },
    },
  });

  // Optionally normalize for response
  updated.user.phone = normalizePlusCodeSpace(updated.user.phone);
  updated.user.altContact = normalizePlusCodeSpace(updated.user.altContact);

  return NextResponse.json(updated);
}

/**
 * DELETE: block when related rows exist; cascade with ?force=true
 * Also supports ?deleteUser=true to remove the associated login (optional).
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await context.params;

  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUserId = session.user.id;
  const adminIp = req.headers.get("x-forwarded-for") ?? undefined;
  const adminUA = req.headers.get("user-agent") ?? undefined;

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";
  const deleteUser = url.searchParams.get("deleteUser") === "true";

  try {
    // 0) Fetch client + user (for audit + email + tokens cleanup)
    const clientBefore = await prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!clientBefore) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const userIdToDelete = clientBefore.user?.id ?? null;
    const userEmailToDelete = clientBefore.user?.email ?? null;

    // 1) Gather the cascade graph up-front (ids only; no heavy payloads)
    const requirements = await prisma.requirement.findMany({
      where: { clientId: id },
      select: { id: true, jobRoles: { select: { id: true } } },
    });

    const requirementIds = requirements.map((r) => r.id);
    const jobRoleIds = requirements.flatMap((r) =>
      r.jobRoles.map((jr) => jr.id)
    );

    // Assignments can connect both ways (jobRoleId & labourId)
    const assignmentsByRole = jobRoleIds.length
      ? await prisma.labourAssignment.findMany({
          where: { jobRoleId: { in: jobRoleIds } },
          select: { id: true, labourId: true },
        })
      : [];

    const labourViaRequirement = requirementIds.length
      ? await prisma.labourProfile.findMany({
          where: { requirementId: { in: requirementIds } },
          select: { id: true },
        })
      : [];

    const labourIdsViaAssignments = Array.from(
      new Set(assignmentsByRole.map((a) => a.labourId))
    );
    const labourIdsViaRequirement = labourViaRequirement.map((lp) => lp.id);
    const labourProfileIds = Array.from(
      new Set([...labourIdsViaAssignments, ...labourIdsViaRequirement])
    );

    // Totals for the “blocked unless forced” response and audit log
    const totals = {
      requirements: requirementIds.length,
      jobRoles: jobRoleIds.length,
      assignments: assignmentsByRole.length,
      labourProfiles: labourProfileIds.length,
    };
    const totalRelated =
      totals.requirements +
      totals.jobRoles +
      totals.assignments +
      totals.labourProfiles;

    if (totalRelated > 0 && !force) {
      return NextResponse.json(
        {
          error: "Client has related records. Delete is blocked unless forced.",
          related: totals,
          hint: "Re-run with ?force=true to cascade delete, or remove related records first.",
        },
        { status: 409 }
      );
    }

    // 2) CASCADE in a transaction with FK-safe order
    await prisma.$transaction(async (tx) => {
      // 2.1) CHILD LEVEL CLEANUP (deepest first)

      // Labour-side cleanup
      if (labourProfileIds.length) {
        // Labour stage history
        await tx.labourStageHistory.deleteMany({
          where: { labourId: { in: labourProfileIds } },
        });

        // Labour assignments by labour
        await tx.labourAssignment.deleteMany({
          where: { labourId: { in: labourProfileIds } },
        });

        // Documents attached to labour profiles (regardless of owner)
        await tx.document.deleteMany({
          where: { labourProfileId: { in: labourProfileIds } },
        });

        // Labour profile audit logs (generic audit table)
        await tx.auditLog.deleteMany({
          where: {
            entityType: "LabourProfile",
            entityId: { in: labourProfileIds },
          },
        });
      }

      // JobRole-level cleanup (forwardings & assignments by role)
      if (jobRoleIds.length) {
        await tx.jobRoleForwarding.deleteMany({
          where: { jobRoleId: { in: jobRoleIds } },
        });
        await tx.labourAssignment.deleteMany({
          where: { jobRoleId: { in: jobRoleIds } },
        });
      }

      // Requirement-level cleanup
      if (requirementIds.length) {
        // Offer letter
        await tx.offerLetterDetails.deleteMany({
          where: { requirementId: { in: requirementIds } },
        });

        // Documents attached to requirements (regardless of owner)
        await tx.document.deleteMany({
          where: { requirementId: { in: requirementIds } },
        });

        // Requirement audit logs (generic audit table)
        await tx.auditLog.deleteMany({
          where: {
            entityType: "Requirement",
            entityId: { in: requirementIds },
          },
        });

        // Labour profiles tied directly to requirements
        await tx.labourProfile.deleteMany({
          where: { id: { in: labourProfileIds } },
        });

        // Job roles
        await tx.jobRole.deleteMany({
          where: { requirementId: { in: requirementIds } },
        });

        // Requirements
        await tx.requirement.deleteMany({
          where: { id: { in: requirementIds } },
        });
      }

      // 2.2) CLIENT ROW
      // Client audit logs (if you logged 'Client' as entity)
      await tx.auditLog.deleteMany({
        where: { entityType: "Client", entityId: id },
      });

      await tx.client.delete({ where: { id } });

      // 2.3) USER-LEVEL CLEANUP (optional and last)
      if (deleteUser && userIdToDelete) {
        // Notifications where the user is recipient or sender
        await tx.notification.deleteMany({
          where: {
            OR: [{ recipientId: userIdToDelete }, { senderId: userIdToDelete }],
          },
        });

        // User-authored audit logs (performedById is RESTRICT → must delete before user)
        await tx.auditLog.deleteMany({
          where: { performedById: userIdToDelete },
        });

        // Documents owned by the user (ownerId has CASCADE, but we remove explicitly)
        await tx.document.deleteMany({ where: { ownerId: userIdToDelete } });

        // Any remaining documents tied to client’s artefacts were already deleted above

        // User settings (RESTRICT → delete before user)
        await tx.userSettings.deleteMany({ where: { userId: userIdToDelete } });

        // Password reset tokens for this user's email (clean nice-to-have)
        if (userEmailToDelete) {
          await tx.passwordResetToken.deleteMany({
            where: { email: userEmailToDelete },
          });
        }

        // If this user created others, null out createdBy to avoid FK issues
        await tx.user.updateMany({
          where: { createdById: userIdToDelete },
          data: { createdById: null },
        });

        // Finally, delete the user
        await tx.user.delete({ where: { id: userIdToDelete } });
      }
    });

    // 3) Audit log (post-transaction)
    await prisma.auditLog.create({
      data: {
        action: "CLIENT_DELETE",
        entityType: "Client",
        entityId: id,
        description: `Client deleted${force ? " (cascade)" : ""}${
          deleteUser ? " and user removed" : ""
        }`,
        oldData: {
          client: {
            id: clientBefore.id,
            companyName: clientBefore.companyName,
            registrationNo: clientBefore.registrationNo,
          },
          user: clientBefore.user,
          cascadeCounts: totals,
        },
        affectedFields: [
          "Client",
          "Requirement",
          "JobRole",
          "LabourProfile",
          "LabourAssignment",
          "JobRoleForwarding",
          "OfferLetterDetails",
          "Document",
          "Notification",
          ...(deleteUser ? ["User", "UserSettings", "PasswordResetToken"] : []),
        ],
        ipAddress: adminIp,
        userAgent: adminUA,
        performedById: adminUserId,
      },
    });

    // 4) Courtesy email (best-effort; non-blocking)
    let emailSent = false;
    try {
      const toEmail = clientBefore.user?.email;
      const recipientName =
        clientBefore.user?.name || clientBefore.companyName || "User";

      if (toEmail) {
        const emailData = getClientDeletionEmail({
          recipientName,
          companyName: clientBefore.companyName,
          loginDeleted: deleteUser,
        });

        await sendEmail({
          to: toEmail,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        });

        emailSent = true;
      }
    } catch (mailErr) {
      console.error("Deletion email send error:", mailErr);
    }

    return NextResponse.json({
      ok: true,
      cascaded: force,
      userDeleted: deleteUser,
      relatedTotals: totals,
      emailSent,
    });
  } catch (error: any) {
    console.error("Delete client error:", error);

    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Delete failed due to foreign key constraints. Remove related records or use ?force=true.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
