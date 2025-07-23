// app/api/admin/assignments/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction } from "@/lib/generated/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status, feedback } = await request.json();

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Get current assignment for audit log
    const currentAssignment = await prisma.labourAssignment.findUnique({
      where: { id: id },
      include: {
        jobRole: {
          select: {
            id: true,
            title: true,
          },
        },
        labour: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!currentAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const updatedAssignment = await prisma.$transaction(async (tx) => {
      // Update the assignment status
      const assignment = await tx.labourAssignment.update({
        where: { id: id },
        data: {
          adminStatus: status,
          adminFeedback: feedback,
          ...(status === "REJECTED" && {
            clientStatus: "REJECTED", // Auto-reject at client level if admin rejects
          }),
        },
        include: {
          labour: true,
          jobRole: true,
        },
      });

      // Update labour profile status if rejected
      if (status === "REJECTED") {
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: {
            status: "UNDER_REVIEW", // Reset status for agency to resubmit
          },
        });
      }

      // Check if all assignments for this job role are now accepted
      const jobRoleAssignments = await tx.labourAssignment.findMany({
        where: { jobRoleId: assignment.jobRoleId },
      });

      const allAccepted = jobRoleAssignments.every(
        (a) => a.adminStatus === "ACCEPTED"
      );
      const anyRejected = jobRoleAssignments.some(
        (a) => a.adminStatus === "REJECTED"
      );

      // Update job role status based on assignments
      let newAdminStatus = assignment.jobRole.adminStatus;
      if (allAccepted) {
        newAdminStatus = "ACCEPTED";
      } else if (anyRejected) {
        newAdminStatus = "NEEDS_REVISION";
      }

      if (newAdminStatus !== assignment.jobRole.adminStatus) {
        await tx.jobRole.update({
          where: { id: assignment.jobRoleId },
          data: {
            adminStatus: newAdminStatus,
          },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
          entityType: "LabourAssignment",
          entityId: id,
          performedById: session.user.id,
          oldData: {
            adminStatus: currentAssignment.adminStatus,
            labourId: currentAssignment.labour.id,
            labourName: currentAssignment.labour.name,
            jobRoleId: currentAssignment.jobRole.id,
            jobRoleTitle: currentAssignment.jobRole.title,
          },
          newData: {
            adminStatus: status,
            feedback: feedback,
          },
          affectedFields: ["adminStatus", "adminFeedback"],
        },
      });

      return assignment;
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment status:", error);
    return NextResponse.json(
      { error: "Failed to update assignment status" },
      { status: 500 }
    );
  }
}
