import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction } from "@/lib/generated/prisma";
import { notifyContractRefused } from "@/lib/notification-helpers";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: assignmentId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get agency profile
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true, agencyName: true, userId: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    // Check if assignment exists and belongs to this agency
    const assignment = await prisma.labourAssignment.findFirst({
      where: {
        id: assignmentId,
        agencyId: agency.id,
      },
      include: {
        jobRole: {
          include: {
            requirement: {
              include: {
                client: true,
              },
            },
          },
        },
        labour: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Verify the labour is in CONTRACT_SIGN stage
    if (assignment.labour.currentStage !== "CONTRACT_SIGN") {
      return NextResponse.json(
        { error: "Labour must be in CONTRACT_SIGN stage" },
        { status: 400 }
      );
    }

    // Use a transaction to handle the contract refusal
    await prisma.$transaction(async (tx) => {
      // 1. Mark CONTRACT_SIGN stage as refused
      await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "CONTRACT_SIGN",
          status: "PENDING",
        },
        data: {
          status: "REFUSED",
          notes: "Labour refused to sign contract",
          completedAt: new Date(),
        },
      });

      // 2. Mark the assignment as rejected by admin with specific feedback
      await tx.labourAssignment.update({
        where: { id: assignmentId },
        data: {
          adminStatus: "REJECTED",
          adminFeedback: "Labour rejected during contract signing",
          clientStatus: "PENDING", // Reset client status
          agencyStatus: "NEEDS_REVISION", // Set agency status to needs revision
        },
      });

      // 3. Reset labour profile status so they can be assigned elsewhere
      await tx.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          status: "APPROVED", // Reset to approved so they can be assigned elsewhere
          requirementId: null, // Remove requirement association
          currentStage: "OFFER_LETTER_SIGN", // Reset stage
        },
      });

      // 3.1. Delete all stage history for this labour to prevent carrying rejected stages
      await tx.labourStageHistory.deleteMany({
        where: { labourId: assignment.labourId },
      });

      // 4. Update job role to indicate it needs more labour
      await tx.jobRole.update({
        where: { id: assignment.jobRoleId },
        data: {
          needsMoreLabour: true,
          adminStatus: "NEEDS_REVISION", // Reset admin status to allow new assignments
        },
      });

      // 5. Reset requirement status to UNDER_REVIEW so agency can assign new labour
      await tx.requirement.update({
        where: { id: assignment.jobRole.requirement.id },
        data: {
          status: "UNDER_REVIEW", // Reset to allow new assignments
        },
      });

      // 6. Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
          entityType: "LabourAssignment",
          entityId: assignmentId,
          performedById: session.user.id,
          oldData: {
            adminStatus: "ACCEPTED",
            clientStatus: "ACCEPTED",
            labourStatus: "SHORTLISTED",
            currentStage: "CONTRACT_SIGN",
            requirementStatus: assignment.jobRole.requirement.status,
            jobRoleAdminStatus: assignment.jobRole.adminStatus,
          },
          newData: {
            adminStatus: "REJECTED",
            adminFeedback: "Labour rejected during contract signing",
            labourStatus: "APPROVED",
            currentStage: "OFFER_LETTER_SIGN",
            needsMoreLabour: true,
            requirementStatus: "UNDER_REVIEW",
            jobRoleAdminStatus: "NEEDS_REVISION",
            stageHistoryDeleted: true,
          },
          description: `Labour ${assignment.labour.name} refused to sign contract for ${assignment.jobRole.title} position. Stage history cleared for reassignment.`,
          affectedFields: [
            "adminStatus",
            "adminFeedback",
            "labourStatus",
            "currentStage",
            "requirementStatus",
            "jobRoleAdminStatus",
            "stageHistoryDeleted",
          ],
        },
      });
    });

    // 7. Send notifications
    try {
      await notifyContractRefused(
        assignment.labour.name,
        assignment.jobRole.title,
        agency.agencyName,
        agency.userId, // Use userId instead of agencyId for notifications
        assignment.jobRole.requirement.client.userId
      );
    } catch (notificationError) {
      console.error(
        "Error sending contract refusal notifications:",
        notificationError
      );
      // Continue execution - don't let notification failures break the main flow
    }

    return NextResponse.json({
      success: true,
      message:
        "Contract refused successfully. Labour has been marked as rejected and can be replaced.",
    });
  } catch (error) {
    console.error("Error refusing contract:", error);
    return NextResponse.json(
      { error: "Failed to refuse contract" },
      { status: 500 }
    );
  }
}
