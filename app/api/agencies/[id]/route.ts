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
  const schedule = url.searchParams.get("schedule") === "true" || !force; // default to schedule if not forcing
  const deleteUser = url.searchParams.get("deleteUser") === "true";

  try {
    // Gather relations
    const [
      agency,
      assignmentsCount,
      labourIds,
      forwardingsCount,
      assignedJobRoleIds,
    ] = await prisma.$transaction([
      prisma.agency.findUnique({
        where: { id },
        include: { user: true },
      }),
      prisma.labourAssignment.count({ where: { agencyId: id } }),
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

    const labourProfileIds = labourIds.map((x) => x.id);
    const relatedTotals = {
      assignments: assignmentsCount,
      labourProfiles: labourProfileIds.length,
      forwardings: forwardingsCount,
      assignedJobRoles: assignedJobRoleIds.length,
      total:
        assignmentsCount +
        labourProfileIds.length +
        forwardingsCount +
        assignedJobRoleIds.length,
    };

    // helper: send apology email (do not block flow on failure)
    const sendApologyEmail = async () => {
      try {
        const tpl = getAgencyDeletionEmail(agency.agencyName || "there");
        await sendTemplateEmail(tpl, agency.user.email);
      } catch (e) {
        console.error("Failed to send agency deletion email:", e);
      }
    };

    // BLOCK when there are related rows and not forcing (hard delete)
    if (!force && relatedTotals.total > 0) {
      // Schedule path is "soft delete": just mark the user for deletion
      if (schedule) {
        const deleteAt = new Date();
        deleteAt.setDate(deleteAt.getDate() + 1); // +24h

        const result = await prisma.$transaction(async (tx) => {
          const updated = await tx.agency.update({
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
              entityType: "AGENCY",
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

          return updated;
        });

        // send the email outside the transaction
        await sendApologyEmail();

        return NextResponse.json({
          ok: true,
          scheduled: true,
          relatedTotals,
          agency: result,
        });
      }

      // no schedule + not force => block
      return NextResponse.json(
        {
          error: "Agency has related records. Delete is blocked unless forced.",
          related: relatedTotals,
          hint: "Re-run with ?force=true for hard delete (cascading), or use ?schedule=true to schedule a soft deletion.",
        },
        { status: 409 }
      );
    }

    // FORCE: cascade delete children in a safe order, then delete Agency; option to delete User
    if (force) {
      const result = await prisma.$transaction(async (tx) => {
        // 1) Children of LabourProfile
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
          await tx.labourProfile.deleteMany({
            where: { id: { in: labourProfileIds } },
          });
        }

        // 2) Agency-scoped children
        await tx.labourAssignment.deleteMany({ where: { agencyId: id } });
        await tx.jobRoleForwarding.deleteMany({ where: { agencyId: id } });

        // 3) JobRoles that point to this agency — nullify assignment (do NOT delete job roles)
        const jrIds = assignedJobRoleIds.map((j) => j.id);
        if (jrIds.length) {
          await tx.jobRole.updateMany({
            where: { id: { in: jrIds } },
            data: { assignedAgencyId: null, agencyStatus: "UNDER_REVIEW" },
          });
        }

        // 4) Delete Agency
        await tx.agency.delete({ where: { id } });

        // 5) Optionally delete the User (cascades owner/notifications as per schema)
        if (deleteUser) {
          await tx.user.delete({ where: { id: agency.userId } });
        }

        await tx.auditLog.create({
          data: {
            action: AuditAction.AGENCY_DELETE,
            entityType: "AGENCY",
            entityId: id,
            performedById: session.user.id,
            description: `Agency hard-deleted (force=${force}, deleteUser=${deleteUser})`,
            affectedFields: ["relations", "agency"],
            oldData: {
              assignments: assignmentsCount,
              labourProfiles: labourProfileIds.length,
              forwardings: forwardingsCount,
              assignedJobRoles: jrIds.length,
            },
            newData: {},
          },
        });

        return { ok: true, cascaded: true, deleteUser };
      });

      // email after force-delete
      await sendApologyEmail();

      return NextResponse.json(result);
    }

    // SCHEDULE soft delete (no related rows or we chose schedule explicitly)
    if (schedule) {
      const deleteAt = new Date();
      deleteAt.setDate(deleteAt.getDate() + 1);

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.agency.update({
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
            entityType: "AGENCY",
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

        return updated;
      });

      // email after scheduling
      await sendApologyEmail();

      return NextResponse.json({
        ok: true,
        scheduled: true,
        relatedTotals,
        agency: result,
      });
    }

    // fallback (shouldn’t hit)
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
