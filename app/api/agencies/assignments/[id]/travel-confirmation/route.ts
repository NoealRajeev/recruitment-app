import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { StageStatus, LabourStage } from "@/lib/generated/prisma";
import { notifyTravelConfirmed } from "@/lib/notification-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status, rescheduledTravelDate, notes } = await request.json();

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
      where: { id: params.id },
      include: {
        labour: true,
        jobRole: {
          include: {
            requirement: true,
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

    // Update the travel confirmation stage
    const stageHistory = await prisma.labourStageHistory.create({
      data: {
        labourId: assignment.labourId,
        stage: "TRAVEL_CONFIRMATION",
        status: status as StageStatus,
        notes: notes || `Travel status updated to ${status}`,
        completedAt: new Date(),
      },
    });

    // Update the labour's current stage based on the status
    let nextStage: LabourStage;

    if (status === "TRAVELED") {
      // Move to ARRIVAL_CONFIRMATION stage
      nextStage = "ARRIVAL_CONFIRMATION";
    } else if (status === "RESCHEDULED") {
      // Stay in TRAVEL_CONFIRMATION but with RESCHEDULED status
      nextStage = "TRAVEL_CONFIRMATION";
    } else if (status === "CANCELED") {
      // Reset to beginning - OFFER_LETTER_SIGN
      nextStage = "OFFER_LETTER_SIGN";
    } else {
      throw new Error("Invalid status");
    }

    // Update labour's current stage
    await prisma.labourProfile.update({
      where: { id: assignment.labourId },
      data: {
        currentStage: nextStage,
      },
    });

    // If moving to next stage, create the stage history entry
    if (status === "TRAVELED") {
      await prisma.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "ARRIVAL_CONFIRMATION",
          status: "PENDING",
          notes: "Waiting for arrival confirmation",
        },
      });
    } else if (status === "CANCELED") {
      // Reset all stages and start fresh
      await prisma.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "OFFER_LETTER_SIGN",
          status: "PENDING",
          notes: "Process restarted after travel cancellation",
        },
      });
    }

    // Update assignment travel date if rescheduled
    if (status === "RESCHEDULED" && rescheduledTravelDate) {
      await prisma.labourAssignment.update({
        where: { id: params.id },
        data: {
          travelDate: new Date(rescheduledTravelDate),
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "LABOUR_PROFILE_STATUS_CHANGE",
        entityType: "LabourProfile",
        entityId: assignment.labourId,
        description: `Travel confirmation status updated to ${status}`,
        oldData: { currentStage: "TRAVEL_CONFIRMATION" },
        newData: {
          currentStage: nextStage,
          travelConfirmationStatus: status,
          rescheduledTravelDate:
            status === "RESCHEDULED" ? rescheduledTravelDate : null,
        },
        affectedFields: ["currentStage", "travelConfirmationStatus"],
        performedById: session.user.id,
      },
    });

    // Send notifications for travel confirmation
    try {
      if (status === "TRAVELED") {
        // Get client ID from the requirement
        const clientId = assignment.jobRole.requirement.clientId;

        await notifyTravelConfirmed(
          assignment.labour.name,
          rescheduledTravelDate ||
            assignment.travelDate?.toISOString() ||
            "Travel date",
          assignment.agencyId,
          clientId
        );
      }
    } catch (notificationError) {
      console.error("Notification sending failed:", notificationError);
      // Continue even if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Travel status updated to ${status}`,
      stageHistory,
      nextStage,
    });
  } catch (error) {
    console.error("Error updating travel confirmation:", error);
    return NextResponse.json(
      { error: "Failed to update travel confirmation" },
      { status: 500 }
    );
  }
}
