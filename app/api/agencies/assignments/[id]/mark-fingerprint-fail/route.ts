import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction } from "@/lib/generated/prisma";
import { notifyFingerprintFail } from "@/lib/notification-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: assignmentId } = await params;

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

    // Verify the labour is in FINGERPRINT stage
    if (assignment.labour.currentStage !== "FINGERPRINT") {
      return NextResponse.json(
        { error: "Labour must be in FINGERPRINT stage" },
        { status: 400 }
      );
    }

    // Use a transaction to handle the fingerprint fail marking
    await prisma.$transaction(async (tx) => {
      // 1. Mark FINGERPRINT stage as failed
      await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "FINGERPRINT",
          status: "PENDING",
        },
        data: {
          status: "FAILED",
          notes: "Labour failed fingerprint verification",
          completedAt: new Date(),
        },
      });

      // 2. Mark the assignment as rejected by admin with specific feedback
      await tx.labourAssignment.update({
        where: { id: assignmentId },
        data: {
          adminStatus: "REJECTED",
          adminFeedback: "Labour failed fingerprint verification",
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

      // 3.1. Delete all stage history for this labour to prevent carrying failed stages
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
            currentStage: "FINGERPRINT",
            requirementStatus: assignment.jobRole.requirement.status,
            jobRoleAdminStatus: assignment.jobRole.adminStatus,
          },
          newData: {
            adminStatus: "REJECTED",
            adminFeedback: "Labour failed fingerprint verification",
            labourStatus: "APPROVED",
            currentStage: "OFFER_LETTER_SIGN",
            needsMoreLabour: true,
            requirementStatus: "UNDER_REVIEW",
            jobRoleAdminStatus: "NEEDS_REVISION",
            stageHistoryDeleted: true,
          },
          description: `Labour ${assignment.labour.name} failed fingerprint verification for ${assignment.jobRole.title} position. Stage history cleared for reassignment.`,
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
      await notifyFingerprintFail(
        assignment.labour.name,
        assignment.jobRole.title,
        agency.agencyName,
        agency.userId,
        assignment.jobRole.requirement.client.userId
      );
    } catch (notificationError) {
      console.error(
        "Error sending fingerprint fail notifications:",
        notificationError
      );
      // Continue execution - don't let notification failures break the main flow
    }

    return NextResponse.json({
      success: true,
      message:
        "Fingerprint fail marked successfully. Labour has been marked as rejected and can be replaced.",
    });
  } catch (error) {
    console.error("Error marking fingerprint fail:", error);
    return NextResponse.json(
      { error: "Failed to mark fingerprint fail" },
      { status: 500 }
    );
  }
}
