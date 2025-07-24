import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { StageStatus, AuditAction } from "@/lib/generated/prisma";
import {
  notifyTravelConfirmed,
  notifyTravelCanceled,
  notifyTravelRescheduled,
} from "@/lib/notification-helpers";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "flight-tickets"
);
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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
    let isMultipart = false;
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      isMultipart = true;
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

    // Validate status
    if (!["TRAVELED", "RESCHEDULED", "CANCELED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be TRAVELED, RESCHEDULED, or CANCELED" },
        { status: 400 }
      );
    }

    // Validate rescheduledTravelDate for RESCHEDULED status
    if (status === "RESCHEDULED" && !rescheduledTravelDate) {
      return NextResponse.json(
        {
          error:
            "Rescheduled travel date is required when status is RESCHEDULED",
        },
        { status: 400 }
      );
    }

    // Get the assignment and verify it belongs to the agency
    const assignment = await prisma.labourAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        labour: true,
        jobRole: {
          include: {
            requirement: {
              include: {
                client: true,
              },
            },
          },
        },
        agency: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if the assignment belongs to the logged-in agency
    if (assignment.agency.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this assignment" },
        { status: 403 }
      );
    }

    // Verify the labour is in TRAVEL_CONFIRMATION stage
    if (assignment.labour.currentStage !== "TRAVEL_CONFIRMATION") {
      return NextResponse.json(
        { error: "Labour must be in TRAVEL_CONFIRMATION stage" },
        { status: 400 }
      );
    }

    // If RESCHEDULED and multipart, handle file upload
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
      // Save the new flight ticket
      const filename = `flight-ticket-${assignmentId}-${Date.now()}.pdf`;
      const filePath = path.join(UPLOAD_DIR, filename);
      const buffer = Buffer.from(await flightTicketFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      const url = `/uploads/flight-tickets/${filename}`;

      // Optionally, remove old ticket file (not implemented here)

      // Transaction: update assignment, stage, audit, etc.
      await prisma.$transaction(async (tx) => {
        // Update assignment with new travel date and flight ticket
        await tx.labourAssignment.update({
          where: { id: assignmentId },
          data: {
            travelDate: new Date(rescheduledTravelDate),
            flightTicketUrl: url,
          },
        });
        // Update labour's current stage to stay in TRAVEL_CONFIRMATION
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: { currentStage: "TRAVEL_CONFIRMATION" },
        });
        // Create new stage history entry for rescheduled travel
        await tx.labourStageHistory.create({
          data: {
            labourId: assignment.labourId,
            stage: "TRAVEL_CONFIRMATION",
            status: "PENDING",
            notes: "Travel rescheduled - new flight ticket uploaded",
          },
        });
        // Create audit log for rescheduling
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
            description: `Travel rescheduled for ${assignment.labour.name} for ${assignment.jobRole.title} position. New flight ticket uploaded and required.`,
            affectedFields: ["travelDate", "flightTicketUrl", "status"],
          },
        });
      });
      return NextResponse.json({ success: true });
    }

    // Use a transaction to handle the travel confirmation update
    await prisma.$transaction(async (tx) => {
      // 1. Mark TRAVEL_CONFIRMATION stage with the appropriate status
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
        // 2. Mark the assignment as rejected by admin with specific feedback
        await tx.labourAssignment.update({
          where: { id: assignmentId },
          data: {
            adminStatus: "REJECTED",
            adminFeedback: "Travel cancelled by agency",
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

        // 6. Create audit log for cancellation
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
            description: `Travel cancelled for ${assignment.labour.name} for ${assignment.jobRole.title} position. Stage history cleared for reassignment.`,
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
        // For rescheduled travel, update the travel date and require new flight ticket
        await tx.labourAssignment.update({
          where: { id: assignmentId },
          data: {
            travelDate: new Date(rescheduledTravelDate),
            flightTicketUrl: null, // Clear existing flight ticket to require new upload
          },
        });

        // Update labour's current stage to stay in TRAVEL_CONFIRMATION
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: {
            currentStage: "TRAVEL_CONFIRMATION",
          },
        });

        // Create new stage history entry for rescheduled travel
        await tx.labourStageHistory.create({
          data: {
            labourId: assignment.labourId,
            stage: "TRAVEL_CONFIRMATION",
            status: "PENDING",
            notes: "Travel rescheduled - new flight ticket required",
          },
        });

        // Create audit log for rescheduling
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
            description: `Travel rescheduled for ${assignment.labour.name} for ${assignment.jobRole.title} position. New flight ticket required.`,
            affectedFields: ["travelDate", "flightTicketUrl", "status"],
          },
        });
      } else if (status === "TRAVELED") {
        // For traveled status, move to ARRIVAL_CONFIRMATION stage
        await tx.labourProfile.update({
          where: { id: assignment.labourId },
          data: {
            currentStage: "ARRIVAL_CONFIRMATION",
          },
        });

        // Create stage history entry for arrival confirmation
        await tx.labourStageHistory.create({
          data: {
            labourId: assignment.labourId,
            stage: "ARRIVAL_CONFIRMATION",
            status: "PENDING",
            notes: "Waiting for arrival confirmation",
          },
        });

        // Create audit log for travel
        await tx.auditLog.create({
          data: {
            action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
            entityType: "LabourProfile",
            entityId: assignment.labourId,
            performedById: session.user.id,
            oldData: {
              currentStage: "TRAVEL_CONFIRMATION",
            },
            newData: {
              currentStage: "ARRIVAL_CONFIRMATION",
              travelStatus: "TRAVELED",
            },
            description: `Travel confirmed for ${assignment.labour.name} for ${assignment.jobRole.title} position.`,
            affectedFields: ["currentStage", "travelStatus"],
          },
        });
      }
    });

    // 7. Send notifications
    try {
      if (status === "CANCELED") {
        await notifyTravelCanceled(
          assignment.labour.name,
          assignment.jobRole.title,
          assignment.agency.agencyName,
          assignment.agency.userId,
          assignment.jobRole.requirement.client.userId
        );
      } else if (status === "RESCHEDULED") {
        await notifyTravelRescheduled(
          assignment.labour.name,
          assignment.jobRole.title,
          assignment.agency.agencyName,
          rescheduledTravelDate,
          assignment.agency.userId,
          assignment.jobRole.requirement.client.userId
        );
      } else if (status === "TRAVELED") {
        await notifyTravelConfirmed(
          assignment.labour.name,
          rescheduledTravelDate ||
            assignment.travelDate?.toISOString() ||
            "Travel date",
          assignment.agencyId,
          assignment.jobRole.requirement.client.userId
        );
      }
    } catch (notificationError) {
      console.error("Error sending travel notifications:", notificationError);
      // Continue execution - don't let notification failures break the main flow
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
