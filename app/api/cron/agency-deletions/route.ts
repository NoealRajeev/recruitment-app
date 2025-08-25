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
 * Purge one agency (and the user) in a single transaction, cascading through all related data.
 * Adjust relations to match your schema as needed.
 */
async function purgeAgencyAndUser(agencyId: string) {
  // Fetch full context BEFORE delete (for email + deletion by email)
  const before = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!before || !before.user) return { skipped: true };
  const userId = before.user.id;
  const userEmail = before.user.email;

  // Collect FK graph
  const labourProfiles = await prisma.labourProfile.findMany({
    where: { agencyId },
    select: { id: true },
  });
  const labourIds = labourProfiles.map((l) => l.id);

  const assignments = await prisma.labourAssignment.findMany({
    where: { agencyId },
    select: { id: true, labourId: true },
  });
  const assignmentIds = assignments.map((a) => a.id);

  // Delete order (be conservative with deleteMany where needed)
  await prisma.$transaction(async (tx) => {
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

    if (assignmentIds.length) {
      // double‑ensure no stragglers tied to agency
      await tx.labourAssignment.deleteMany({
        where: { id: { in: assignmentIds } },
      });
    }

    // Agency-owned/created documents (ownerId = agency user id)
    await tx.document.deleteMany({ where: { ownerId: userId } });

    // Any job-role forwardings created by this agency
    await tx.jobRoleForwarding.deleteMany({ where: { agencyId } });

    // Notifications (recipient has onDelete: Cascade, but explicit delete is fine)
    await tx.notification.deleteMany({ where: { recipientId: userId } });

    // Password reset tokens (delete by email — model has no userId)
    if (userEmail) {
      await tx.passwordResetToken.deleteMany({ where: { email: userEmail } });
    }

    // Audit logs created by this user (optional)
    await tx.auditLog.deleteMany({ where: { performedById: userId } });

    // Finally delete the agency
    await tx.agency.delete({ where: { id: agencyId } });

    // And the user itself
    await tx.user.delete({ where: { id: userId } });
  });

  // Post‑transaction audit log (performedBy must reference an existing user)
  try {
    const actorId = await resolveCronActorId();
    if (actorId) {
      await prisma.auditLog.create({
        data: {
          action: "AGENCY_DELETE",
          entityType: "Agency",
          entityId: agencyId,
          description: "Agency permanently deleted (cascade)",
          oldData: {
            agency: { id: before.id, name: before.agencyName },
            user: before.user,
            cascadeCounts: {
              labourProfiles: labourIds.length,
              assignments: assignmentIds.length,
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
          ],
          performedById: actorId,
        },
      });
    } else {
      console.warn(
        "[agency-deletions] No CRON_ACTOR_ID or admin found; audit log skipped to avoid FK errors."
      );
    }
  } catch (e) {
    console.error("Post-purge audit failed:", e);
  }

  // Send final "deleted" email
  try {
    if (userEmail) {
      const tpl = getAgencyDeletionEmail(before.agencyName);
      await sendTemplateEmail(tpl, userEmail);
    }
  } catch (e) {
    console.error("Final deletion email failed:", e);
  }

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

  // Find due agencies (IMMEDIATE or SCHEDULED) with expired deleteAt
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
