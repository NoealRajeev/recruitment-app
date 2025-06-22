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
            jobRole: true,
          },
        })
      );

      const results = await Promise.all(updates);

      // Update labour profiles
      await tx.labourProfile.updateMany({
        where: {
          id: {
            in: results.map((a) => a.labourId),
          },
        },
        data: {
          status: status === "ACCEPTED" ? "APPROVED" : "UNDER_REVIEW",
        },
      });

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

      // Update each job role's status
      for (const [jobRoleId, assignments] of Object.entries(
        assignmentsByJobRole
      )) {
        const jobRoleAssignments = await tx.labourAssignment.findMany({
          where: { jobRoleId },
        });

        const allAccepted = jobRoleAssignments.every(
          (a) => a.adminStatus === "ACCEPTED"
        );
        const anyRejected = jobRoleAssignments.some(
          (a) => a.adminStatus === "REJECTED"
        );

        let newAdminStatus = assignments[0].jobRole.adminStatus;
        if (allAccepted) {
          newAdminStatus = "ACCEPTED";
        } else if (anyRejected) {
          newAdminStatus = "NEEDS_REVISION";
        }

        if (newAdminStatus !== assignments[0].jobRole.adminStatus) {
          await tx.jobRole.update({
            where: { id: jobRoleId },
            data: {
              adminStatus: newAdminStatus,
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
