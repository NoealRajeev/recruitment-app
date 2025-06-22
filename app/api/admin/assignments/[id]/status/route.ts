import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction, RequirementStatus } from "@/lib/generated/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // 2. Validate request body
    const { status, feedback } = await request.json();

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // 3. Get current assignment data for audit log
    const currentAssignment = await prisma.labourAssignment.findUnique({
      where: { id: params.id },
      include: {
        jobRole: {
          select: {
            id: true,
            quantity: true,
            requirement: {
              select: {
                id: true,
                status: true,
              },
            },
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

    // 4. Perform the update in a transaction
    const updatedAssignment = await prisma.$transaction(async (tx) => {
      // Update the assignment status
      const assignment = await tx.labourAssignment.update({
        where: { id: params.id },
        data: {
          adminStatus: status as RequirementStatus,
          adminFeedback: status === "ACCEPTED" ? null : feedback,
          ...(status === "ACCEPTED" && {
            clientStatus: RequirementStatus.CLIENT_REVIEW,
          }),
          ...(status === "REJECTED" && {
            clientStatus: "PENDING",
          }),
        },
        include: {
          jobRole: {
            include: {
              requirement: true,
              LabourAssignment: true,
            },
          },
        },
      });

      // Get all assignments for this job role
      const jobRoleAssignments = await tx.labourAssignment.findMany({
        where: { jobRoleId: assignment.jobRoleId },
      });

      // Count accepted assignments
      const acceptedCount = jobRoleAssignments.filter(
        (a) => a.adminStatus === "ACCEPTED"
      ).length;

      // If we have more accepted assignments than needed, mark extras as backup
      if (acceptedCount > assignment.jobRole.quantity) {
        // Sort assignments by creation date (oldest first)
        const sortedAssignments = [...jobRoleAssignments]
          .filter((a) => a.adminStatus === "ACCEPTED")
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        // Mark extras as backup (not submitted to client)
        for (
          let i = assignment.jobRole.quantity;
          i < sortedAssignments.length;
          i++
        ) {
          await tx.labourAssignment.update({
            where: { id: sortedAssignments[i].id },
            data: {
              clientStatus: "PENDING", // Not submitted to client
              isBackup: true, // Add this field to your Prisma model
            },
          });
        }

        // Ensure exactly the required quantity is submitted to client
        for (
          let i = 0;
          i < Math.min(assignment.jobRole.quantity, sortedAssignments.length);
          i++
        ) {
          await tx.labourAssignment.update({
            where: { id: sortedAssignments[i].id },
            data: {
              clientStatus: "SUBMITTED",
              isBackup: false,
            },
          });
        }
      }

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

      // Update requirement status to CLIENT_REVIEW if all assignments are accepted
      if (status === "ACCEPTED" && allAccepted) {
        await tx.requirement.update({
          where: { id: assignment.jobRole.requirement.id },
          data: {
            status: "CLIENT_REVIEW",
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
            jobRoleId: currentAssignment.jobRole.id,
            requirementId: currentAssignment.jobRole.requirement.id,
            requirementStatus: currentAssignment.jobRole.requirement.status,
          },
          newData: {
            adminStatus: status,
            feedback: status === "ACCEPTED" ? null : feedback,
            ...(status === "ACCEPTED" &&
              allAccepted && {
                requirementStatus: "CLIENT_REVIEW",
              }),
          },
          affectedFields: ["adminStatus", "adminFeedback", "requirementStatus"],
        },
      });

      return assignment;
    });

    // 5. Return successful response
    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment status:", error);
    return NextResponse.json(
      { error: "Failed to update assignment status" },
      { status: 500 }
    );
  }
}
