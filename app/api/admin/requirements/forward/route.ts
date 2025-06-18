// app/api/admin/requirements/forward/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/middleware/adminCheck";
import { AuditAction, RequirementStatus } from "@/lib/generated/prisma";

interface ForwardedRole {
  id: string;
  title: string;
  quantity: number;
  nationality: string;
  salary: string;
  salaryCurrency: string;
  startDate: string;
  contractDuration: string;
  agencyId: string;
  forwardedQuantity: number;
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const body = await request.json();
    const { requirementId, forwardedRoles } = body;

    if (!requirementId || !forwardedRoles?.length) {
      return NextResponse.json(
        { error: "Requirement ID and forwarded roles are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create assignments
      const assignments = await Promise.all(
        forwardedRoles.map(async (role: ForwardedRole) => {
          return await tx.requirementAssignment.create({
            data: {
              requirementId,
              jobRoleId: role.id,
              agencyId: role.agencyId,
              quantity: role.forwardedQuantity,
              status: RequirementStatus.SUBMITTED,
              metadata: {
                title: role.title,
                originalQuantity: role.quantity,
                nationality: role.nationality,
                salary: role.salary,
                salaryCurrency: role.salaryCurrency,
                startDate: role.startDate,
                contractDuration: role.contractDuration,
              },
            },
          });
        })
      );

      // Update requirement status
      await tx.requirement.update({
        where: { id: requirementId },
        data: { status: RequirementStatus.APPROVED },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_ASSIGNED,
          entityType: "REQUIREMENT",
          entityId: requirementId,
          description: `Requirement forwarded to ${forwardedRoles.length} agencies`,
          performedById: adminCheck.user.id,
          newData: {
            assignments: forwardedRoles.map((r: ForwardedRole) => ({
              jobRole: r.title,
              agencyId: r.agencyId,
              quantity: r.forwardedQuantity,
            })),
          },
        },
      });

      // Create notifications for agencies
      const uniqueAgencyIds: string[] = Array.from(
        new Set(forwardedRoles.map((r: ForwardedRole) => r.agencyId))
      );

      await Promise.all(
        uniqueAgencyIds.map(async (agencyId: string) => {
          const agency = await tx.agency.findUnique({
            where: { id: agencyId },
            include: { user: true },
          });

          if (agency?.user) {
            await tx.notification.create({
              data: {
                title: "New Requirement Assigned",
                message: `You have been assigned a new requirement with ${
                  forwardedRoles.filter(
                    (r: ForwardedRole) => r.agencyId === agencyId
                  ).length
                } job roles`,
                type: "REQUIREMENT",
                actionUrl: `/dashboard/agency/requirements/${requirementId}`,
                recipientId: agency.user.id,
              },
            });
          }
        })
      );

      return assignments;
    });

    return NextResponse.json({ success: true, assignments: result });
  } catch (error) {
    console.error("Error forwarding requirement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
