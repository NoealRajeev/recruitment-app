// app/api/assignments/[id]/travel-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  StageStatus,
  AuditAction,
  NotificationType,
  NotificationPriority,
} from "@/lib/generated/prisma";
import path from "path";
import fs from "fs";
import { NotificationDelivery } from "@/lib/notification-delivery";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "flight-tickets"
);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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
    let status, rescheduledTravelDate, notes, flightTicketFile;
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    if (isMultipart) {
      const formData = await request.formData();
      status = formData.get("status");
      rescheduledTravelDate = formData.get("rescheduledTravelDate");
      notes = formData.get("notes");
      flightTicketFile = formData.get("flightTicket");
    } else {
      const body = await request.json();
      status = body.status;
      rescheduledTravelDate = body.rescheduledTravelDate;
      notes = body.notes;
    }

    if (!["TRAVELED", "RESCHEDULED", "CANCELED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be TRAVELED, RESCHEDULED, or CANCELED" },
        { status: 400 }
      );
    }
    if (status === "RESCHEDULED" && !rescheduledTravelDate) {
      return NextResponse.json(
        {
          error:
            "Rescheduled travel date is required when status is RESCHEDULED",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.labourAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        labour: true,
        jobRole: { include: { requirement: { include: { client: true } } } },
        agency: { include: { user: true } },
      },
    });
    if (!assignment)
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    if (assignment.agency.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this assignment" },
        { status: 403 }
      );
    }
    if (assignment.labour.currentStage !== "TRAVEL_CONFIRMATION") {
      return NextResponse.json(
        { error: "Labour must be in TRAVEL_CONFIRMATION stage" },
        { status: 400 }
      );
    }

    // Handle RESCHEDULED + file upload
    if (status === "RESCHEDULED" && isMultipart) {
      if (
        !flightTicketFile ||
        typeof flightTicketFile !== "object" ||
        !(flightTicketFile instanceof File) ||
        flightTicketFile.type !== "application/pdf"
      ) {
        return NextResponse.json(
          { error: "A PDF flight ticket file is required for rescheduling." },
          { status: 400 }
        );
      }
      const filename = `flight-ticket-${assignmentId}-${Date.now()}.pdf`;
      const filePath = path.join(UPLOAD_DIR, filename);
      const buffer = Buffer.from(
        await (flightTicketFile as File).arrayBuffer()
      );
      fs.writeFileSync(filePath, buffer);
      const url = `/uploads/flight-tickets/${filename}`;

      await prisma.$transaction(async (tx) => {
        await tx.labourAssignment.update({
          where: { id: assignmentId },
          data: {
            travelDate: new Date(rescheduledTravelDate),
            flightTicketUrl: url,
          },
        });
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: { currentStage: "TRAVEL_CONFIRMATION" },
        });
        await tx.labourStageHistory.create({
          data: {
            labourId: assignment.labourId,
            stage: "TRAVEL_CONFIRMATION",
            status: "PENDING",
            notes: "Travel rescheduled - new flight ticket uploaded",
          },
        });
        await tx.auditLog.create({
          data: {
            action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
            entityType: "LabourAssignment",
            entityId: assignmentId,
            performedById: session.user.id,
            oldData: {
              currentStage: "TRAVEL_CONFIRMATION",
              travelDate: assignment.travelDate,
              flightTicketUrl: assignment.flightTicketUrl,
            },
            newData: {
              currentStage: "TRAVEL_CONFIRMATION",
              travelDate: rescheduledTravelDate,
              flightTicketUrl: url,
              status: "RESCHEDULED",
            },
            description: `Travel rescheduled for ${assignment.labour.name} (${assignment.jobRole.title}). New ticket uploaded.`,
            affectedFields: ["travelDate", "flightTicketUrl", "status"],
          },
        });
      });

      // Deliver
      const cfg = {
        type: NotificationType.TRAVEL_CONFIRMED,
        title: "Travel rescheduled",
        message: `Travel for ${assignment.labour.name} (${assignment.jobRole.title}) has been rescheduled.`,
        priority: NotificationPriority.NORMAL,
        actionUrl: `/dashboard/agency/recruitment`,
        actionText: "View details",
      } as const;
      await NotificationDelivery.deliverToUser(
        assignment.agency.userId,
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

      return NextResponse.json({ success: true });
    }

    // Transaction for other statuses
    await prisma.$transaction(async (tx) => {
      await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "TRAVEL_CONFIRMATION",
          status: "PENDING",
        },
        data: {
          status: status as StageStatus,
          notes: notes || `Travel status updated to ${status}`,
          completedAt: new Date(),
        },
      });

      if (status === "CANCELED") {
        await tx.labourAssignment.update({
          where: { id: assignmentId },
          data: {
            adminStatus: "REJECTED",
            adminFeedback: "Travel cancelled by agency",
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
              currentStage: "TRAVEL_CONFIRMATION",
              requirementStatus: assignment.jobRole.requirement.status,
              jobRoleAdminStatus: assignment.jobRole.adminStatus,
            },
            newData: {
              adminStatus: "REJECTED",
              adminFeedback: "Travel cancelled by agency",
              labourStatus: "APPROVED",
              currentStage: "OFFER_LETTER_SIGN",
              needsMoreLabour: true,
              requirementStatus: "UNDER_REVIEW",
              jobRoleAdminStatus: "NEEDS_REVISION",
              stageHistoryDeleted: true,
            },
            description: `Travel cancelled for ${assignment.labour.name} (${assignment.jobRole.title}).`,
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
      } else if (status === "RESCHEDULED") {
        await tx.labourAssignment.update({
          where: { id: assignmentId },
          data: {
            travelDate: new Date(rescheduledTravelDate),
            flightTicketUrl: null,
          },
        });
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: { currentStage: "TRAVEL_CONFIRMATION" },
        });
        await tx.labourStageHistory.create({
          data: {
            labourId: assignment.labourId,
            stage: "TRAVEL_CONFIRMATION",
            status: "PENDING",
            notes: "Travel rescheduled - new flight ticket required",
          },
        });
        await tx.auditLog.create({
          data: {
            action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
            entityType: "LabourAssignment",
            entityId: assignmentId,
            performedById: session.user.id,
            oldData: {
              currentStage: "TRAVEL_CONFIRMATION",
              travelDate: assignment.travelDate,
              flightTicketUrl: assignment.flightTicketUrl,
            },
            newData: {
              currentStage: "TRAVEL_CONFIRMATION",
              travelDate: rescheduledTravelDate,
              flightTicketUrl: null,
              status: "RESCHEDULED",
            },
            description: `Travel rescheduled for ${assignment.labour.name} (${assignment.jobRole.title}). New ticket required.`,
            affectedFields: ["travelDate", "flightTicketUrl", "status"],
          },
        });
      } else if (status === "TRAVELED") {
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: { currentStage: "ARRIVAL_CONFIRMATION" },
        });
        await tx.labourStageHistory.create({
          data: {
            labourId: assignment.labourId,
            stage: "ARRIVAL_CONFIRMATION",
            status: "PENDING",
            notes: "Waiting for arrival confirmation",
          },
        });
        await tx.auditLog.create({
          data: {
            action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
            entityType: "LabourProfile",
            entityId: assignment.labourId,
            performedById: session.user.id,
            oldData: { currentStage: "TRAVEL_CONFIRMATION" },
            newData: {
              currentStage: "ARRIVAL_CONFIRMATION",
              travelStatus: "TRAVELED",
            },
            description: `Travel confirmed for ${assignment.labour.name} (${assignment.jobRole.title}).`,
            affectedFields: ["currentStage", "travelStatus"],
          },
        });
      }
    });

    // NEW: Deliver notifications mapped by status
    if (status === "CANCELED") {
      const cfg = {
        type: NotificationType.TRAVEL_CONFIRMED,
        title: "Travel canceled",
        message: `Travel canceled for ${assignment.labour.name} (${assignment.jobRole.title}). Replacement needed.`,
        priority: NotificationPriority.HIGH,
        actionUrl: `/dashboard/agency/recruitment`,
        actionText: "Review role",
      } as const;
      await NotificationDelivery.deliverToUser(
        assignment.agency.userId,
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
    } else if (status === "RESCHEDULED") {
      const cfg = {
        type: NotificationType.TRAVEL_CONFIRMED,
        title: "Travel rescheduled",
        message: `Travel rescheduled for ${assignment.labour.name} (${assignment.jobRole.title}).`,
        priority: NotificationPriority.NORMAL,
        actionUrl: `/dashboard/agency/recruitment`,
        actionText: "View",
      } as const;
      await NotificationDelivery.deliverToUser(
        assignment.agency.userId,
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
    } else if (status === "TRAVELED") {
      const cfg = {
        type: NotificationType.TRAVEL_CONFIRMED,
        title: "Travel confirmed",
        message: `Travel confirmed for ${assignment.labour.name} (${assignment.jobRole.title}).`,
        priority: NotificationPriority.HIGH,
        actionUrl: `/dashboard/client/trackers`,
        actionText: "Track arrival",
      } as const;
      await NotificationDelivery.deliverToUser(
        assignment.agency.userId,
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
    }

    return NextResponse.json({
      success: true,
      message: `Travel status updated to ${status}`,
      ...(status === "RESCHEDULED" && {
        requiresNewFlightTicket: true,
        message: "Travel rescheduled. Please upload new flight ticket.",
      }),
    });
  } catch (error) {
    console.error("Error updating travel confirmation:", error);
    return NextResponse.json(
      { error: "Failed to update travel confirmation" },
      { status: 500 }
    );
  }
}
