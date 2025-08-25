// app/api/assignments/[id]/fingerprint-fail/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  AuditAction,
  NotificationType,
  NotificationPriority,
} from "@/lib/generated/prisma";
import { NotificationDelivery } from "@/lib/notification-delivery";

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
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true, agencyName: true, userId: true },
    });
    if (!agency)
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );

    const assignment = await prisma.labourAssignment.findFirst({
      where: { id: assignmentId, agencyId: agency.id },
      include: {
        jobRole: { include: { requirement: { include: { client: true } } } },
        labour: true,
      },
    });
    if (!assignment)
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );

    if (assignment.labour.currentStage !== "FINGERPRINT") {
      return NextResponse.json(
        { error: "Labour must be in FINGERPRINT stage" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
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
      await tx.labourAssignment.update({
        where: { id: assignmentId },
        data: {
          adminStatus: "REJECTED",
          adminFeedback: "Labour failed fingerprint verification",
          clientStatus: "PENDING",
          agencyStatus: "NEEDS_REVISION",
        },
      });
      await tx.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          status: "APPROVED",
          requirementId: null,
          currentStage: "OFFER_LETTER_SIGN",
        },
      });
      await tx.labourStageHistory.deleteMany({
        where: { labourId: assignment.labourId },
      });
      await tx.jobRole.update({
        where: { id: assignment.jobRoleId },
        data: { needsMoreLabour: true, adminStatus: "NEEDS_REVISION" },
      });
      await tx.requirement.update({
        where: { id: assignment.jobRole.requirement.id },
        data: { status: "UNDER_REVIEW" },
      });
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

    // NEW: Deliver notifications (agency + client + admins)
    const msg = `Labour ${assignment.labour.name} failed fingerprint verification for ${assignment.jobRole.title}. Replacement needed.`;
    const cfg = {
      type: NotificationType.STAGE_FAILED,
      title: "Fingerprint verification failed",
      message: msg,
      priority: NotificationPriority.HIGH,
      actionUrl: `/dashboard/agency/recruitment`,
      actionText: "Review assignment",
    } as const;

    await NotificationDelivery.deliverToUser(
      agency.userId,
      cfg,
      session.user.id,
      "LabourAssignment",
      assignmentId
    );

    if (assignment.jobRole.requirement.client.userId) {
      await NotificationDelivery.deliverToUser(
        assignment.jobRole.requirement.client.userId,
        cfg,
        session.user.id,
        "LabourAssignment",
        assignmentId
      );
    }

    // Optional: notify admins
    await NotificationDelivery.deliverToRole(
      "RECRUITMENT_ADMIN",
      {
        ...cfg,
        title: `Action needed: ${assignment.jobRole.title}`,
      },
      session.user.id,
      "LabourAssignment",
      assignmentId
    );

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
