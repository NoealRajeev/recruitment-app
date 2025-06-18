// app/api/agencies/requirements/[id]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditAction, RequirementStatus } from "@/lib/generated/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.agencyProfile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const assignmentId = params.id; // Destructure params.id first

    const assignment = await prisma.requirementAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.agencyId !== user.agencyProfile.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this assignment" },
        { status: 403 }
      );
    }

    const updatedAssignment = await prisma.$transaction(async (tx) => {
      // Update assignment status
      const updated = await tx.requirementAssignment.update({
        where: { id: assignmentId },
        data: { status: status as RequirementStatus },
        include: {
          // Add this include to get the relations
          jobRole: true,
          requirement: true,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_STATUS_CHANGED,
          entityType: "REQUIREMENT_ASSIGNMENT",
          entityId: assignmentId,
          description: `Assignment ${status.toLowerCase()} by agency`,
          performedById: user.id,
          oldData: { status: assignment.status },
          newData: { status },
        },
      });

      // Create notification for admin
      const requirement = await tx.requirement.findUnique({
        where: { id: assignment.requirementId },
        include: { client: true },
      });

      if (requirement) {
        const admins = await tx.user.findMany({
          where: { role: "RECRUITMENT_ADMIN" },
        });

        await Promise.all(
          admins.map(async (admin) => {
            await tx.notification.create({
              data: {
                title: "Assignment Status Updated",
                message: `Agency ${user.agencyProfile?.agencyName} has ${status.toLowerCase()} assignment for ${requirement.client.companyName}`,
                type: "REQUIREMENT",
                actionUrl: `/dashboard/admin/requirements/${assignment.requirementId}`,
                recipientId: admin.id,
              },
            });
          })
        );
      }

      return updated;
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
