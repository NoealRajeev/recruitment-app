// app/api/cron/agency-deletions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendTemplateEmail } from "@/lib/utils/email-service";
import { getAgencyDeletionEmail } from "@/lib/utils/email-templates";
import { NotificationType } from "@/lib/generated/prisma";

/** Simple header check; keep in sync with your worker */
function verifyCron(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  return secret && secret === process.env.CRON_SECRET;
}

/** Resolve a stable "actor" user id for audit logs (env → any admin → null) */
async function resolveCronActorId(): Promise<string | null> {
  const envActor = process.env.CRON_ACTOR_ID;
  if (envActor) {
    const exists = await prisma.user.findUnique({
      where: { id: envActor },
      select: { id: true },
    });
    if (exists?.id) return envActor;
  }
  const anyAdmin = await prisma.user.findFirst({
    where: { role: "RECRUITMENT_ADMIN" },
    select: { id: true },
  });
  return anyAdmin?.id ?? null;
}

async function notifyAdminsAccountPurged(
  agencyName: string,
  senderId: string | null,
  agencyId: string
) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "RECRUITMENT_ADMIN" },
      select: { id: true },
    });

    if (!admins.length) return;

    await prisma.notification.createMany({
      data: admins.map((a) => ({
        type: NotificationType.USER_DELETED,
        title: "Agency account permanently deleted",
        message: `The agency "${agencyName}" has been fully purged from the system.`,
        recipientId: a.id,
        senderId: senderId ?? undefined,
        entityType: "Agency",
        entityId: agencyId,
        actionText: "View Audit Logs",
        actionUrl: `${process.env.NEXTAUTH_URL ?? ""}/dashboard/admin/audit-logs?entityType=Agency&entityId=${agencyId}`,
      })),
    });
  } catch (e) {
    console.error("Admin purge notification failed:", e);
  }
}

/**
 * Purge one agency (and its user) in a single transaction, cascading through all related data.
 */
async function purgeAgencyAndUser(agencyId: string) {
  // Fetch context BEFORE delete (for email + audit)
  const before = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!before || !before.user) return { skipped: true };
  const userId = before.user.id;
  const userEmail = before.user.email ?? null;

  // Collect graph
  const [labourProfiles, assignments, assignedJobRoles] = await Promise.all([
    prisma.labourProfile.findMany({
      where: { agencyId: agencyId },
      select: { id: true },
    }),
    prisma.labourAssignment.findMany({
      where: { agencyId: agencyId },
      select: { id: true, labourId: true },
    }),
    prisma.jobRole.findMany({
      where: { assignedAgencyId: agencyId },
      select: { id: true },
    }),
  ]);

  const labourIds = labourProfiles.map((l) => l.id);
  const assignmentIds = assignments.map((a) => a.id);
  const assignedJobRoleIds = assignedJobRoles.map((j) => j.id);

  // Transactional purge
  await prisma.$transaction(async (tx) => {
    // Nullify assigned job roles (do NOT delete job roles)
    if (assignedJobRoleIds.length) {
      await tx.jobRole.updateMany({
        where: { id: { in: assignedJobRoleIds } },
        data: { assignedAgencyId: null, agencyStatus: "UNDER_REVIEW" },
      });
    }

    // LabourProfile graph
    if (labourIds.length) {
      await tx.labourStageHistory.deleteMany({
        where: { labourId: { in: labourIds } },
      });
      await tx.document.deleteMany({
        where: { labourProfileId: { in: labourIds } },
      });
      await tx.labourAssignment.deleteMany({
        where: { labourId: { in: labourIds } },
      });
      await tx.labourProfile.deleteMany({
        where: { id: { in: labourIds } },
      });
    }

    // Clean any remaining assignments & forwardings
    if (assignmentIds.length) {
      await tx.labourAssignment.deleteMany({
        where: { id: { in: assignmentIds } },
      });
    }
    await tx.jobRoleForwarding.deleteMany({ where: { agencyId: agencyId } });

    // Agency-owned documents (ownerId is the user)
    await tx.document.deleteMany({ where: { ownerId: userId } });

    // Notifications (recipient and sender)
    await tx.notification.deleteMany({ where: { recipientId: userId } });
    await tx.notification.deleteMany({ where: { senderId: userId } });

    // Password reset tokens
    if (userEmail) {
      await tx.passwordResetToken.deleteMany({ where: { email: userEmail } });
    }

    // User settings
    await tx.userSettings.deleteMany({ where: { userId } });

    // Audit logs created by this user
    await tx.auditLog.deleteMany({ where: { performedById: userId } });

    // Audit logs referencing this Agency as entity
    await tx.auditLog.deleteMany({
      where: { entityType: "Agency", entityId: agencyId },
    });

    // Finally delete the Agency and the User
    await tx.agency.delete({ where: { id: agencyId } });
    await tx.user.delete({ where: { id: userId } });
  });

  // Post-transaction: write a summarizing audit (must be performed by someone that still exists)
  try {
    const actorId = await resolveCronActorId();
    if (actorId) {
      await prisma.auditLog.create({
        data: {
          action: "AGENCY_DELETE",
          entityType: "Agency",
          entityId: agencyId,
          description: "Agency permanently deleted (cron cascade)",
          oldData: {
            agency: { id: before.id, name: before.agencyName },
            user: before.user,
            cascadeCounts: {
              labourProfiles: labourIds.length,
              assignments: assignmentIds.length,
              assignedJobRoles: assignedJobRoleIds.length,
            },
          },
          affectedFields: [
            "Agency",
            "User",
            "LabourProfile",
            "LabourAssignment",
            "Document",
            "LabourStageHistory",
            "Notification",
            "UserSettings",
            "AuditLog",
            "JobRoleForwarding",
          ],
          performedById: actorId,
        },
      });
    } else {
      console.warn(
        "[agency-deletions] No CRON_ACTOR_ID or admin found; audit log skipped."
      );
    }
  } catch (e) {
    console.error("Post-purge audit failed:", e);
  }

  // Final email
  try {
    if (userEmail) {
      const tpl = getAgencyDeletionEmail(before.agencyName);
      await sendTemplateEmail(tpl, userEmail);
    }
  } catch (e) {
    console.error("Final deletion email failed:", e);
  }

  // Notify admins
  try {
    const actorId = await resolveCronActorId();
    await notifyAdminsAccountPurged(before.agencyName, actorId, before.id);
  } catch (e) {
    console.error("Failed to notify admins of purge:", e);
  }

  return { deleted: true };
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Agencies whose users are marked for deletion and the time has come
  const dueUsers = await prisma.user.findMany({
    where: {
      deleteAt: { lte: now },
      deletionType: { in: ["IMMEDIATE", "SCHEDULED"] },
      role: "RECRUITMENT_AGENCY",
    },
    select: { id: true, agencyProfile: { select: { id: true } } },
  });

  const targets = dueUsers
    .map((u) => u.agencyProfile?.id)
    .filter((x): x is string => Boolean(x));

  const results: Array<{ agencyId: string; ok: boolean; message?: string }> =
    [];

  for (const agencyId of targets) {
    try {
      await purgeAgencyAndUser(agencyId);
      results.push({ agencyId, ok: true });
    } catch (e: any) {
      console.error(`Purge failed for agency ${agencyId}`, e);
      results.push({
        agencyId,
        ok: false,
        message: e?.message || "unknown error",
      });
    }
  }

  return NextResponse.json({
    now: now.toISOString(),
    processed: results.length,
    results,
  });
}
