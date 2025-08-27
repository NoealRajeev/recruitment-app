// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { sendEmail } from "@/lib/utils/email-service";
import { getClientDeletionEmail } from "@/lib/utils/email-templates";
import { AuditAction } from "@prisma/client";

/** Require an admin session */
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

/** GET: fetch company + user (unchanged) */
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

/** PATCH: edit company fields (email/phone locked server-side; unchanged) */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  updated.user.phone = normalizePlusCodeSpace(updated.user.phone);
  updated.user.altContact = normalizePlusCodeSpace(updated.user.altContact);

  return NextResponse.json(updated);
}

/**
 * DELETE: Full, irreversible purge (no related-count blocker).
 * Defaults: force=true & deleteUser=true unless explicitly set to "false".
 * This matches your frontend call: /api/clients/:id?force=true&deleteUser=true
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUserId = session.user.id;
  const adminIp = req.headers.get("x-forwarded-for") ?? undefined;
  const adminUA = req.headers.get("user-agent") ?? undefined;

  const { id } = await context.params;
  const url = new URL(req.url);

  // Default to hard cascade + delete associated login unless explicitly disabled.
  const force = url.searchParams.get("force") !== "false";
  const deleteUser = url.searchParams.get("deleteUser") !== "false";

  try {
    // Fetch client + user FIRST (for audit + emails + tokens cleanup)
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

    // Gather dependency graph (IDs only)
    const requirements = await prisma.requirement.findMany({
      where: { clientId: id },
      select: { id: true, jobRoles: { select: { id: true } } },
    });

    const requirementIds = requirements.map((r) => r.id);
    const jobRoleIds = requirements.flatMap((r) =>
      r.jobRoles.map((jr) => jr.id)
    );

    // Assignments attached to job roles
    const assignmentsByRole = jobRoleIds.length
      ? await prisma.labourAssignment.findMany({
          where: { jobRoleId: { in: jobRoleIds } },
          select: { id: true, labourId: true },
        })
      : [];

    // Labour profiles attached to requirements
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

    // Totals (for auditing/response only)
    const totals = {
      requirements: requirementIds.length,
      jobRoles: jobRoleIds.length,
      assignments: assignmentsByRole.length,
      labourProfiles: labourProfileIds.length,
    };

    // ALWAYS CASCADE (force default = true)
    await prisma.$transaction(async (tx) => {
      // Deepest first: Labour-related
      if (labourProfileIds.length) {
        await tx.labourStageHistory.deleteMany({
          where: { labourId: { in: labourProfileIds } },
        });

        await tx.labourAssignment.deleteMany({
          where: { labourId: { in: labourProfileIds } },
        });

        await tx.document.deleteMany({
          where: { labourProfileId: { in: labourProfileIds } },
        });

        await tx.auditLog.deleteMany({
          where: {
            entityType: "LabourProfile",
            entityId: { in: labourProfileIds },
          },
        });

        await tx.labourProfile.deleteMany({
          where: { id: { in: labourProfileIds } },
        });
      }

      // JobRole-level dependencies
      if (jobRoleIds.length) {
        await tx.jobRoleForwarding.deleteMany({
          where: { jobRoleId: { in: jobRoleIds } },
        });

        await tx.labourAssignment.deleteMany({
          where: { jobRoleId: { in: jobRoleIds } },
        });
      }

      // Requirement-level dependencies
      if (requirementIds.length) {
        await tx.offerLetterDetails.deleteMany({
          where: { requirementId: { in: requirementIds } },
        });

        await tx.document.deleteMany({
          where: { requirementId: { in: requirementIds } },
        });

        await tx.auditLog.deleteMany({
          where: {
            entityType: "Requirement",
            entityId: { in: requirementIds },
          },
        });

        // Delete job roles then requirements
        await tx.jobRole.deleteMany({
          where: { requirementId: { in: requirementIds } },
        });

        await tx.requirement.deleteMany({
          where: { id: { in: requirementIds } },
        });
      }

      // Client audit logs (entity-type scoped)
      await tx.auditLog.deleteMany({
        where: { entityType: "Client", entityId: id },
      });

      // Delete the client row
      await tx.client.delete({ where: { id } });

      // USER-LEVEL CLEANUP (optional; default = true)
      if (deleteUser && userIdToDelete) {
        // Notifications where user is recipient or sender
        await tx.notification.deleteMany({
          where: {
            OR: [{ recipientId: userIdToDelete }, { senderId: userIdToDelete }],
          },
        });

        // Audit logs authored by this user
        await tx.auditLog.deleteMany({
          where: { performedById: userIdToDelete },
        });

        // Documents owned by this user
        await tx.document.deleteMany({
          where: { ownerId: userIdToDelete },
        });

        // User settings
        await tx.userSettings.deleteMany({
          where: { userId: userIdToDelete },
        });

        // Password reset tokens (by email)
        if (userEmailToDelete) {
          await tx.passwordResetToken.deleteMany({
            where: { email: userEmailToDelete },
          });
        }

        // If this user created other users, null out createdBy to avoid FK issues
        await tx.user.updateMany({
          where: { createdById: userIdToDelete },
          data: { createdById: null },
        });

        // Finally, delete the user
        await tx.user.delete({ where: { id: userIdToDelete } });
      }
    });

    // Post-transaction audit log (performedBy = current admin)
    await prisma.auditLog.create({
      data: {
        action: AuditAction.CLIENT_DELETE,
        entityType: "Client",
        entityId: id,
        description: `Client permanently deleted (cascade)${
          deleteUser ? " and associated user removed" : ""
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

    // Courtesy email (best-effort; non-blocking)
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

    // Prisma FK constraint guard (shouldn’t trigger with the order we use)
    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Delete failed due to foreign key constraints. Please contact support.",
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
