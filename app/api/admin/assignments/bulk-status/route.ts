import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction, RequirementStatus } from "@/lib/generated/prisma";

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
      // Update all assignments
      const updates = assignmentIds.map((id) =>
        tx.labourAssignment.update({
          where: { id },
          data: {
            adminStatus: status as RequirementStatus,
            adminFeedback: status === "ACCEPTED" ? null : feedback, // Clear feedback if accepted
            ...(status === "ACCEPTED" && {
              clientStatus: "SUBMITTED", // Set to SUBMITTED for client review
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

        // If we have more accepted assignments than needed, mark extras as backup
        if (acceptedAssignments.length > jobRole.quantity) {
          const extras = acceptedAssignments.slice(jobRole.quantity);
          await Promise.all(
            extras.map((assignment) =>
              tx.labourAssignment.update({
                where: { id: assignment.id },
                data: {
                  isBackup: true,
                },
              })
            )
          );
        }

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
          await tx.requirement.update({
            where: { id: requirementId },
            data: {
              status: "CLIENT_REVIEW",
            },
          });
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
