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
  // pull the id out of the promised params
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
    // Fetch client + user FIRST (for audit + email context)
    const clientBefore = await prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!clientBefore) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 1) Gather cascade graph
    const requirements = await prisma.requirement.findMany({
      where: { clientId: id },
      select: { id: true, jobRoles: { select: { id: true } } },
    });

    const requirementIds = requirements.map((r) => r.id);
    const jobRoleIds = requirements.flatMap((r) =>
      r.jobRoles.map((jr) => jr.id)
    );

    const assignments = jobRoleIds.length
      ? await prisma.labourAssignment.findMany({
          where: { jobRoleId: { in: jobRoleIds } },
          select: { id: true, labourId: true },
        })
      : [];
    const labourIdsViaAssignments = Array.from(
      new Set(assignments.map((a) => a.labourId))
    );

    const labourViaRequirement = requirementIds.length
      ? await prisma.labourProfile.findMany({
          where: { requirementId: { in: requirementIds } },
          select: { id: true },
        })
      : [];
    const labourIdsViaRequirement = labourViaRequirement.map((lp) => lp.id);

    const labourProfileIds = Array.from(
      new Set([...labourIdsViaAssignments, ...labourIdsViaRequirement])
    );

    const totals = {
      requirements: requirementIds.length,
      jobRoles: jobRoleIds.length,
      assignments: assignments.length,
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

    const userIdToDelete = clientBefore.user?.id ?? null;

    // 2) Cascade delete in correct order
    await prisma.$transaction(async (tx) => {
      if (labourProfileIds.length) {
        await tx.labourStageHistory.deleteMany({
          where: { labourId: { in: labourProfileIds } },
        });
        await tx.document.deleteMany({
          where: { labourProfileId: { in: labourProfileIds } },
        });
        await tx.labourAssignment.deleteMany({
          where: { labourId: { in: labourProfileIds } },
        });
      }

      if (jobRoleIds.length) {
        await tx.labourAssignment.deleteMany({
          where: { jobRoleId: { in: jobRoleIds } },
        });
        await tx.jobRoleForwarding.deleteMany({
          where: { jobRoleId: { in: jobRoleIds } },
        });
      }

      if (requirementIds.length) {
        await tx.labourProfile.deleteMany({
          where: { id: { in: labourProfileIds } },
        });
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
        await tx.jobRole.deleteMany({
          where: { requirementId: { in: requirementIds } },
        });
        await tx.requirement.deleteMany({
          where: { id: { in: requirementIds } },
        });
      }

      // Delete the client row
      await tx.client.delete({ where: { id } });

      // Optionally delete the associated user (use captured id from BEFORE we deleted the client)
      if (deleteUser && userIdToDelete) {
        await tx.user.delete({ where: { id: userIdToDelete } });
      }
    });

    // 3) Create an audit log (post-transaction)
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
        affectedFields: ["Client", "Requirement", "JobRole", "LabourProfile"],
        ipAddress: adminIp,
        userAgent: adminUA,
        performedById: adminUserId,
      },
    });

    // 4) Send an email to the account email (if present)
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
      // Don’t fail the API just because email failed
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
