import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction, RequirementStatus } from "@/lib/generated/prisma";
import { NotificationService } from "@/lib/notifications";
import { sendEmail } from "@/lib/utils/email-service";
import { NotificationType, NotificationPriority } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // according to the Next.js docs, params is a Promise that you must await
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    // 1. Verify authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate request body
    const { status, feedback } = await request.json();

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    if (status === "REJECTED" && (!feedback || feedback.trim() === "")) {
      return NextResponse.json(
        { error: "Feedback is required for rejection" },
        { status: 400 }
      );
    }

    // 3. Get current assignment data for audit log
    const currentAssignment = await prisma.labourAssignment.findUnique({
      where: { id: id },
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
        where: { id: id },
        data: {
          adminStatus: status as RequirementStatus,
          adminFeedback: status === "ACCEPTED" ? null : feedback,
          ...(status === "ACCEPTED" && {
            clientStatus: RequirementStatus.CLIENT_REVIEW,
            agencyStatus: "ACCEPTED", // Set agency status to ACCEPTED
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

      // Get all assignments for this job role, sorted by createdAt
      let jobRoleAssignments = await tx.labourAssignment.findMany({
        where: { jobRoleId: assignment.jobRoleId },
        orderBy: { createdAt: "asc" },
      });

      // Count how many should be primary (client requested quantity)
      const primaryCount = assignment.jobRole.quantity;
      // Get all accepted assignments
      const acceptedAssignments = jobRoleAssignments.filter(
        (a) => a.adminStatus === "ACCEPTED"
      );
      // Get all backup assignments (accepted but not primary)
      const backupAssignments = acceptedAssignments.slice(primaryCount);

      // Update all accepted assignments: first N as primary, rest as backup
      // But preserve existing client status for already approved assignments
      for (let i = 0; i < acceptedAssignments.length; i++) {
        const isPrimary = i < primaryCount;
        const currentAssignment = acceptedAssignments[i];

        // Only update client status if it's not already approved by client
        // This prevents resetting already approved assignments
        const shouldUpdateClientStatus =
          currentAssignment.clientStatus !== "ACCEPTED";

        await tx.labourAssignment.update({
          where: { id: currentAssignment.id },
          data: {
            isBackup: !isPrimary,
            ...(shouldUpdateClientStatus && {
              clientStatus: isPrimary ? "SUBMITTED" : "PENDING",
            }),
          },
        });
      }

      // Handle labour profile status updates based on admin decision
      if (status === "REJECTED") {
        // Update labour profile status to rejected
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: {
            requirementId: null,
            status: "REJECTED",
          },
        });

        // If the rejected assignment was primary, promote a backup
        if (!assignment.isBackup) {
          // Find the oldest backup (if any)
          const oldestBackup = backupAssignments[0];
          if (oldestBackup) {
            await tx.labourAssignment.update({
              where: { id: oldestBackup.id },
              data: {
                isBackup: false,
                clientStatus: "SUBMITTED",
              },
            });
          }
        }
      } else if (status === "ACCEPTED") {
        // Ensure accepted labour profile is SHORTLISTED
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: {
            status: "SHORTLISTED",
            requirementId: assignment.jobRole.requirement.id,
          },
        });
      }

      // Refresh assignments after possible promotion
      jobRoleAssignments = await tx.labourAssignment.findMany({
        where: { jobRoleId: assignment.jobRoleId },
      });

      const allAccepted =
        jobRoleAssignments.filter(
          (a) => a.adminStatus === "ACCEPTED" && !a.isBackup
        ).length === primaryCount;
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

      // Update requirement status to CLIENT_REVIEW if all primary slots are filled
      if (status === "ACCEPTED" && allAccepted) {
        console.log(
          `Updating requirement ${assignment.jobRole.requirement.id} status to CLIENT_REVIEW`
        );
        await tx.requirement.update({
          where: { id: assignment.jobRole.requirement.id },
          data: {
            status: "CLIENT_REVIEW",
          },
        });
      } else {
        console.log(
          `Requirement ${assignment.jobRole.requirement.id} not ready for CLIENT_REVIEW. Status: ${status}, allAccepted: ${allAccepted}`
        );
      }

      // Always recalculate needsMoreLabour after assignment update
      const acceptedPrimaries = jobRoleAssignments.filter(
        (a) => a.adminStatus === "ACCEPTED" && !a.isBackup
      ).length;
      // Fetch previous needsMoreLabour value
      const prevJobRole = await tx.jobRole.findUnique({
        where: { id: assignment.jobRoleId },
        select: {
          needsMoreLabour: true,
          assignedAgency: { include: { user: true } },
          title: true,
          requirement: {
            select: { id: true, client: { select: { companyName: true } } },
          },
        },
      });
      const newNeedsMoreLabour =
        acceptedPrimaries < assignment.jobRole.quantity;
      await tx.jobRole.update({
        where: { id: assignment.jobRoleId },
        data: {
          needsMoreLabour: newNeedsMoreLabour,
        },
      });
      // Notify agency if needsMoreLabour transitioned from false to true
      if (
        prevJobRole &&
        !prevJobRole.needsMoreLabour &&
        newNeedsMoreLabour &&
        prevJobRole.assignedAgency?.user
      ) {
        const agencyUser = prevJobRole.assignedAgency.user;
        const jobRoleTitle = prevJobRole.title;
        const companyName = prevJobRole.requirement?.client?.companyName || "";
        const config = {
          type: NotificationType.REQUIREMENT_NEEDS_REVISION,
          title: `Urgent: More Labour Needed for ${jobRoleTitle}`,
          message: `The requirement for ${companyName} needs more labour profiles for the job role: ${jobRoleTitle}. Please take action immediately.`,
          priority: NotificationPriority.HIGH,
          actionUrl: `/dashboard/agency/requirements`,
          actionText: "View Requirement",
        };
        // In-app notification
        await NotificationService.createNotification({
          ...config,
          recipientId: agencyUser.id,
        });
        // Email
        if (agencyUser.email) {
          await sendEmail({
            to: agencyUser.email,
            subject: config.title,
            text: config.message,
          });
        }
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
