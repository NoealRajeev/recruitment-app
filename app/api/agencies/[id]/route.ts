// app/api/agencies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction, AccountStatus } from "@prisma/client";
import { sendTemplateEmail } from "@/lib/utils/email-service";
import { getAgencyDeletionEmail } from "@/lib/utils/email-templates";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") return null;
  return session;
}

/** GET agency + user (kept as-is style-wise) */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const agency = await prisma.agency.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }
    return NextResponse.json(agency);
  } catch (error) {
    console.error("Error fetching agency:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency" },
      { status: 500 }
    );
  }
}

/**
 * DELETE:
 *  - ?force=true  -> hard cascade (clean related first, then delete agency; keep User unless ?deleteUser=true)
 *  - ?schedule=true (default if neither param set) -> schedule deletion in 24h (status->REJECTED)
 *  - when blocked due to related rows and not forcing -> 409 with counts
 */
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";
  const schedule = url.searchParams.get("schedule") === "true" || !force; // default schedule if not forcing
  const deleteUser = url.searchParams.get("deleteUser") === "true";

  try {
    // Gather relations & basic counts
    const [
      agency,
      assignments,
      labourProfiles,
      forwardingsCount,
      assignedJobRoles,
    ] = await prisma.$transaction([
      prisma.agency.findUnique({
        where: { id },
        include: { user: true },
      }),
      prisma.labourAssignment.findMany({
        where: { agencyId: id },
        select: { id: true, labourId: true },
      }),
      prisma.labourProfile.findMany({
        where: { agencyId: id },
        select: { id: true },
      }),
      prisma.jobRoleForwarding.count({ where: { agencyId: id } }),
      prisma.jobRole.findMany({
        where: { assignedAgencyId: id },
        select: { id: true },
      }),
    ]);

    if (!agency || !agency.user) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const labourIds = labourProfiles.map((l) => l.id);
    const assignmentIds = assignments.map((a) => a.id);
    const assignedJobRoleIds = assignedJobRoles.map((j) => j.id);

    const relatedTotals = {
      assignments: assignmentIds.length,
      labourProfiles: labourIds.length,
      forwardings: forwardingsCount,
      assignedJobRoles: assignedJobRoleIds.length,
      total:
        assignmentIds.length +
        labourIds.length +
        forwardingsCount +
        assignedJobRoleIds.length,
    };

    const sendApologyEmail = async () => {
      try {
        const tpl = getAgencyDeletionEmail(agency.agencyName || "there");
        await sendTemplateEmail(tpl, agency.user.email);
      } catch (e) {
        console.error("Failed to send agency deletion email:", e);
      }
    };

    // If not forcing and there are related rows
    if (!force && relatedTotals.total > 0) {
      if (schedule) {
        const deleteAt = new Date();
        deleteAt.setDate(deleteAt.getDate() + 1); // +24h

        const updated = await prisma.$transaction(async (tx) => {
          const res = await tx.agency.update({
            where: { id },
            data: {
              user: {
                update: {
                  status: AccountStatus.REJECTED,
                  deleteAt,
                  deletionType: "SCHEDULED",
                  deletionRequestedBy: session.user.id,
                },
              },
            },
            include: { user: true },
          });

          await tx.auditLog.create({
            data: {
              action: AuditAction.AGENCY_DELETE,
              entityType: "Agency",
              entityId: id,
              performedById: session.user.id,
              description: `Account scheduled for deletion (${deleteAt.toISOString()})`,
              affectedFields: ["status", "deleteAt", "deletionType"],
              oldData: { status: agency.user.status },
              newData: {
                status: AccountStatus.REJECTED,
                deleteAt,
                deletionType: "SCHEDULED",
              },
            },
          });

          return res;
        });

        await sendApologyEmail();

        return NextResponse.json({
          ok: true,
          scheduled: true,
          relatedTotals,
          agency: updated,
        });
      }

      // No schedule + not force => block
      return NextResponse.json(
        {
          error: "Agency has related records. Delete is blocked unless forced.",
          related: relatedTotals,
          hint: "Re-run with ?force=true for hard delete, or use ?schedule=true to schedule a soft deletion.",
        },
        { status: 409 }
      );
    }

    // FORCE — cascade deletion
    if (force) {
      const result = await prisma.$transaction(async (tx) => {
        // 0) Nullify assigned job roles (never delete job roles)
        if (assignedJobRoleIds.length) {
          await tx.jobRole.updateMany({
            where: { id: { in: assignedJobRoleIds } },
            data: { assignedAgencyId: null, agencyStatus: "UNDER_REVIEW" },
          });
        }

        // 1) LabourProfile graph
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

        // 2) Agency-scoped children (double ensure)
        if (assignmentIds.length) {
          await tx.labourAssignment.deleteMany({
            where: { id: { in: assignmentIds } },
          });
        }
        await tx.jobRoleForwarding.deleteMany({ where: { agencyId: id } });

        // 3) Clean records tied to the agency user
        const userId = agency.userId;
        const userEmail = agency.user.email;

        // Agency-owned docs (owner = user)
        await tx.document.deleteMany({ where: { ownerId: userId } });

        // Notifications (as recipient and as sender)
        await tx.notification.deleteMany({ where: { recipientId: userId } });
        await tx.notification.deleteMany({ where: { senderId: userId } });

        // Password reset tokens (by email)
        if (userEmail) {
          await tx.passwordResetToken.deleteMany({
            where: { email: userEmail },
          });
        }

        // User settings
        await tx.userSettings.deleteMany({ where: { userId } });

        // Audit logs created by this user
        await tx.auditLog.deleteMany({ where: { performedById: userId } });

        // Audit logs where entity is this Agency (optional but matches “delete everything related”)
        await tx.auditLog.deleteMany({
          where: { entityType: "Agency", entityId: id },
        });

        // 4) Delete agency
        await tx.agency.delete({ where: { id } });

        // 5) Optionally delete the user
        if (deleteUser) {
          await tx.user.delete({ where: { id: userId } });
        }

        // Record a summarizing audit under the current admin
        await tx.auditLog.create({
          data: {
            action: AuditAction.AGENCY_DELETE,
            entityType: "Agency",
            entityId: id,
            performedById: session.user.id,
            description: `Agency hard-deleted (force=${force}, deleteUser=${deleteUser})`,
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
            oldData: {
              agency: { id: agency.id, name: agency.agencyName },
              counts: relatedTotals,
            },
            newData: {},
          },
        });

        return { ok: true, cascaded: true, deleteUser };
      });

      await sendApologyEmail();

      return NextResponse.json(result);
    }

    // SCHEDULE (when not blocked or explicitly chosen)
    if (schedule) {
      const deleteAt = new Date();
      deleteAt.setDate(deleteAt.getDate() + 1);

      const updated = await prisma.$transaction(async (tx) => {
        const res = await tx.agency.update({
          where: { id },
          data: {
            user: {
              update: {
                status: AccountStatus.REJECTED,
                deleteAt,
                deletionType: "SCHEDULED",
                deletionRequestedBy: session.user.id,
              },
            },
          },
          include: { user: true },
        });

        await tx.auditLog.create({
          data: {
            action: AuditAction.AGENCY_DELETE,
            entityType: "Agency",
            entityId: id,
            performedById: session.user.id,
            description: `Account scheduled for deletion (${deleteAt.toISOString()})`,
            affectedFields: ["status", "deleteAt", "deletionType"],
            oldData: { status: agency.user.status },
            newData: {
              status: AccountStatus.REJECTED,
              deleteAt,
              deletionType: "SCHEDULED",
            },
          },
        });

        return res;
      });

      await sendApologyEmail();

      return NextResponse.json({
        ok: true,
        scheduled: true,
        relatedTotals,
        agency: updated,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting agency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** PATCH: edit agency fields (email/phone locked server‑side) */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();

  const {
    agencyName,
    registrationNo,
    licenseNumber,
    licenseExpiry, // string | Date
    country,
    address,
    city,
    postalCode,
    // contactPerson, // NOT a column on Agency -> do not send to Prisma
    user, // allow: { name?, profilePicture?, altContact? }
  } = body || {};

  // Helper: normalize to "+<code> <number>"
  const normalizePlusCodeSpace = (raw?: string | null): string | null => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;
    const withPlus = s.startsWith("+") ? s : `+${s}`;
    const m = /^\+(\d{1,4})\s*(.*)$/.exec(withPlus);
    if (!m) {
      const digits = withPlus.replace(/[^\d]/g, "");
      if (!digits) return null;
      // Fallback heuristic: first 3 digits as code if available
      const code = digits.slice(0, 3) || "974";
      const number = digits.slice(3);
      return `+${code}${number ? ` ${number}` : ""}`;
    }
    const code = m[1];
    const rest = (m[2] ?? "").replace(/\s+/g, "");
    return `+${code}${rest ? ` ${rest}` : ""}`;
  };

  // Whitelist Agency fields that actually exist
  const ops: Record<string, any> = {
    agencyName,
    registrationNo,
    licenseNumber,
    country,
    address,
    city,
    postalCode,
  };

  // Convert date if provided
  if (
    licenseExpiry !== undefined &&
    licenseExpiry !== null &&
    licenseExpiry !== ""
  ) {
    ops.licenseExpiry =
      typeof licenseExpiry === "string"
        ? new Date(licenseExpiry)
        : licenseExpiry;
  }

  // Remove undefined so Prisma won't try to null fields
  Object.keys(ops).forEach((k) => ops[k] === undefined && delete ops[k]);

  // User sub-update (only allowed keys)
  const userUpdate: Record<string, any> = {};
  if (user) {
    if (user.name !== undefined) userUpdate.name = user.name;
    if (user.profilePicture !== undefined)
      userUpdate.profilePicture = user.profilePicture;
    if (user.altContact !== undefined)
      userUpdate.altContact = normalizePlusCodeSpace(user.altContact);
    // email/phone intentionally NOT updatable here
  }

  try {
    const updated = await prisma.agency.update({
      where: { id },
      data: {
        ...ops,
        ...(Object.keys(userUpdate).length
          ? { user: { update: userUpdate } }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            altContact: true,
            profilePicture: true,
            status: true,
          },
        },
      },
    });

    // Normalize phone-like fields in the response
    const normalizedUser = {
      ...updated.user,
      phone: normalizePlusCodeSpace(updated.user.phone),
      altContact: normalizePlusCodeSpace(updated.user.altContact),
    };

    // Audit
    const affected = [
      ...Object.keys(ops),
      ...Object.keys(userUpdate).map((k) => `user.${k}`),
    ];
    await prisma.auditLog.create({
      data: {
        action: AuditAction.AGENCY_UPDATE,
        entityType: "AGENCY",
        entityId: id,
        performedById: session.user.id,
        description: "Agency profile updated by admin",
        affectedFields: affected,
        oldData: {},
        newData: { ...ops, user: userUpdate },
      },
    });

    return NextResponse.json({ ...updated, user: normalizedUser });
  } catch (error) {
    console.error("Error updating agency:", error);
    return NextResponse.json(
      { error: "Failed to update agency" },
      { status: 500 }
    );
  }
}
