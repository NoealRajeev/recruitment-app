import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction, RequirementStatus } from "@/lib/generated/prisma";
import { NotificationType, NotificationPriority } from "@prisma/client";
import { NotificationService } from "@/lib/notifications";
import { sendEmail } from "@/lib/utils/email-service";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentIds, status, feedback } = await request.json();

    if (!Array.isArray(assignmentIds)) {
      return NextResponse.json(
        { error: "assignmentIds must be an array" },
        { status: 400 }
      );
    }

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

    // Get current assignments for audit log
    const currentAssignments = await prisma.labourAssignment.findMany({
      where: { id: { in: assignmentIds } },
      include: {
        jobRole: {
          select: {
            id: true,
            title: true,
            adminStatus: true,
            quantity: true,
            requirementId: true,
            requirement: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
        labour: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (currentAssignments.length !== assignmentIds.length) {
      return NextResponse.json(
        { error: "Some assignments not found" },
        { status: 404 }
      );
    }

    const updatedAssignments = await prisma.$transaction(async (tx) => {
      // Filter out assignments that already have the opposite status
      const assignmentsToUpdate = currentAssignments.filter((assignment) => {
        if (status === "ACCEPTED") {
          // For bulk accept, exclude assignments that are already rejected
          return assignment.adminStatus !== "REJECTED";
        } else {
          // For bulk reject, exclude assignments that are already accepted
          return assignment.adminStatus !== "ACCEPTED";
        }
      });

      if (assignmentsToUpdate.length === 0) {
        return [];
      }

      // Update only the filtered assignments
      const updates = assignmentsToUpdate.map((assignment) =>
        tx.labourAssignment.update({
          where: { id: assignment.id },
          data: {
            adminStatus: status as RequirementStatus,
            adminFeedback: status === "ACCEPTED" ? null : feedback, // Clear feedback if accepted
            ...(status === "ACCEPTED" && {
              // Only set client status to SUBMITTED if it's not already approved by client
              ...(assignment.clientStatus !== "ACCEPTED" && {
                clientStatus: "SUBMITTED", // Set to SUBMITTED for client review
              }),
              agencyStatus: "ACCEPTED", // Set agency status to ACCEPTED
            }),
            ...(status === "REJECTED" && {
              clientStatus: "PENDING", // Keep client status as PENDING
              agencyStatus: "NEEDS_REVISION", // Set agency status to NEEDS_REVISION
            }),
          },
          include: {
            labour: true,
            jobRole: {
              include: {
                requirement: true,
              },
            },
          },
        })
      );

      const results = await Promise.all(updates);

      // Update labour profiles status based on admin decision
      if (status === "REJECTED") {
        await Promise.all(
          results.map((assignment) =>
            tx.labourProfile.update({
              where: { id: assignment.labourId },
              data: {
                requirementId: null,
                status: "REJECTED",
              },
            })
          )
        );
      } else if (status === "ACCEPTED") {
        // Ensure accepted labour profiles are SHORTLISTED
        await Promise.all(
          results.map((assignment) =>
            tx.labourProfile.update({
              where: { id: assignment.labourId },
              data: {
                status: "SHORTLISTED",
                requirementId: assignment.jobRole.requirementId,
              },
            })
          )
        );
      }

      // Group assignments by job role for status updates
      const assignmentsByJobRole = results.reduce(
        (acc, assignment) => {
          if (!acc[assignment.jobRoleId]) {
            acc[assignment.jobRoleId] = [];
          }
          acc[assignment.jobRoleId].push(assignment);
          return acc;
        },
        {} as Record<string, typeof results>
      );

      // Track if we need to update any requirement status
      const requirementsToCheck = new Set<string>();

      // Update each job role's status and handle quantity checks
      for (const [jobRoleId, assignments] of Object.entries(
        assignmentsByJobRole
      )) {
        const jobRole = assignments[0].jobRole;
        requirementsToCheck.add(jobRole.requirementId);

        const jobRoleAssignments = await tx.labourAssignment.findMany({
          where: { jobRoleId },
        });

        // Count accepted assignments for this job role
        const acceptedAssignments = jobRoleAssignments.filter(
          (a) => a.adminStatus === "ACCEPTED"
        );

        // Sort accepted assignments by createdAt (oldest first)
        acceptedAssignments.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );

        // Mark the first N as not backup, rest as backup
        console.log(
          `Job role ${jobRoleId}: Marking assignments as primary/backup`,
          {
            totalAccepted: acceptedAssignments.length,
            quantity: jobRole.quantity,
            primaries: acceptedAssignments
              .slice(0, jobRole.quantity)
              .map((a) => ({ id: a.id, labourId: a.labourId })),
            backups: acceptedAssignments
              .slice(jobRole.quantity)
              .map((a) => ({ id: a.id, labourId: a.labourId })),
          }
        );

        await Promise.all(
          acceptedAssignments.map((assignment, idx) =>
            tx.labourAssignment.update({
              where: { id: assignment.id },
              data: {
                isBackup: idx >= jobRole.quantity,
              },
            })
          )
        );

        // For any non-accepted assignments, ensure isBackup is false
        const nonAcceptedAssignments = jobRoleAssignments.filter(
          (a) => a.adminStatus !== "ACCEPTED" && a.isBackup
        );
        await Promise.all(
          nonAcceptedAssignments.map((assignment) =>
            tx.labourAssignment.update({
              where: { id: assignment.id },
              data: { isBackup: false },
            })
          )
        );

        const allAccepted = jobRoleAssignments.every(
          (a) => a.adminStatus === "ACCEPTED"
        );
        const anyRejected = jobRoleAssignments.some(
          (a) => a.adminStatus === "REJECTED"
        );

        let newAdminStatus = jobRole.adminStatus;
        if (allAccepted) {
          newAdminStatus = "ACCEPTED";
        } else if (anyRejected) {
          newAdminStatus = "NEEDS_REVISION";
        }

        if (newAdminStatus !== jobRole.adminStatus) {
          await tx.jobRole.update({
            where: { id: jobRoleId },
            data: {
              adminStatus: newAdminStatus,
            },
          });
        }

        // If after rejection, accepted assignments < jobRole.quantity, set needsMoreLabour
        const acceptedPrimaries = jobRoleAssignments.filter(
          (a) => a.adminStatus === "ACCEPTED" && !a.isBackup
        ).length;
        // Fetch previous needsMoreLabour value
        const prevJobRole = await tx.jobRole.findUnique({
          where: { id: jobRoleId },
          select: {
            needsMoreLabour: true,
            assignedAgency: { include: { user: true } },
            title: true,
            requirement: {
              select: { id: true, client: { select: { companyName: true } } },
            },
          },
        });
        const newNeedsMoreLabour = acceptedPrimaries < jobRole.quantity;
        await tx.jobRole.update({
          where: { id: jobRoleId },
          data: { needsMoreLabour: newNeedsMoreLabour },
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
          const companyName =
            prevJobRole.requirement?.client?.companyName || "";
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
      }

      // Check each requirement to see if all job roles are fulfilled
      for (const requirementId of requirementsToCheck) {
        const requirement = await tx.requirement.findUnique({
          where: { id: requirementId },
          include: {
            jobRoles: {
              select: {
                id: true,
                quantity: true,
              },
            },
          },
        });

        if (!requirement) continue;

        // Check if all job roles have enough accepted assignments
        let allRolesFulfilled = true;
        for (const jobRole of requirement.jobRoles) {
          const acceptedCount = await tx.labourAssignment.count({
            where: {
              jobRoleId: jobRole.id,
              adminStatus: "ACCEPTED",
              agencyStatus: "ACCEPTED",
              clientStatus: "SUBMITTED",
              isBackup: false, // Don't count backups
            },
          });

          if (acceptedCount < jobRole.quantity) {
            allRolesFulfilled = false;
            break;
          }
        }

        // If all job roles are fulfilled, update requirement status
        if (allRolesFulfilled) {
          console.log(
            `Updating requirement ${requirementId} status to CLIENT_REVIEW`
          );
          await tx.requirement.update({
            where: { id: requirementId },
            data: {
              status: "CLIENT_REVIEW",
            },
          });
        } else {
          console.log(
            `Requirement ${requirementId} not fulfilled yet. All roles fulfilled: ${allRolesFulfilled}`
          );
        }
      }

      // Create audit logs for each update
      const auditLogs = currentAssignments.map((assignment) =>
        tx.auditLog.create({
          data: {
            action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
            entityType: "LabourAssignment",
            entityId: assignment.id,
            performedById: session.user.id,
            oldData: {
              adminStatus: assignment.adminStatus,
              labourId: assignment.labour.id,
              labourName: assignment.labour.name,
              jobRoleId: assignment.jobRole.id,
              jobRoleTitle: assignment.jobRole.title,
            },
            newData: {
              adminStatus: status,
              feedback: status === "ACCEPTED" ? null : feedback,
            },
            affectedFields: ["adminStatus", "adminFeedback"],
          },
        })
      );

      await Promise.all(auditLogs);

      return results;
    });

    return NextResponse.json(updatedAssignments);
  } catch (error) {
    console.error("Error bulk updating assignment status:", error);
    return NextResponse.json(
      { error: "Failed to bulk update assignment status" },
      { status: 500 }
    );
  }
}
