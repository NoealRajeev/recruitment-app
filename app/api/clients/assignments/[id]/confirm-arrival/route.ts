import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { notifyArrivalConfirmed } from "@/lib/notification-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CLIENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status, notes } = await request.json();
    const { id } = await params;

    // Validate status
    if (status !== "ARRIVED") {
      return NextResponse.json(
        { error: "Invalid status. Must be ARRIVED" },
        { status: 400 }
      );
    }

    // Get the assignment and verify it belongs to the client
    const assignment = await prisma.labourAssignment.findUnique({
      where: { id },
      include: {
        labour: true,
        jobRole: {
          include: {
            requirement: {
              include: {
                client: {
                  include: {
                    user: true,
                  },
                },
              },
            },
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

    // Check if the assignment belongs to the logged-in client
    if (assignment.jobRole.requirement.client.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this assignment" },
        { status: 403 }
      );
    }

    // Verify the labour is in ARRIVAL_CONFIRMATION stage
    if (assignment.labour.currentStage !== "ARRIVAL_CONFIRMATION") {
      return NextResponse.json(
        { error: "Labour must be in ARRIVAL_CONFIRMATION stage" },
        { status: 400 }
      );
    }

    // Find and update the existing ARRIVAL_CONFIRMATION stage to COMPLETED
    const existingArrivalStage = await prisma.labourStageHistory.findFirst({
      where: {
        labourId: assignment.labourId,
        stage: "ARRIVAL_CONFIRMATION",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingArrivalStage) {
      // Update the existing stage to COMPLETED
      await prisma.labourStageHistory.update({
        where: {
          id: existingArrivalStage.id,
        },
        data: {
          status: "COMPLETED",
          notes: notes || `Arrival confirmed - labour has arrived`,
          completedAt: new Date(),
        },
      });
    } else {
      // Fallback: create new stage if none exists
      await prisma.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "ARRIVAL_CONFIRMATION",
          status: "COMPLETED",
          notes: notes || `Arrival confirmed - labour has arrived`,
          completedAt: new Date(),
        },
      });
    }

    // Create new DEPLOYED stage
    await prisma.labourStageHistory.create({
      data: {
        labourId: assignment.labourId,
        stage: "DEPLOYED",
        status: "COMPLETED",
        notes: "Labour successfully deployed",
        completedAt: new Date(),
      },
    });

    // Update the labour's current stage to DEPLOYED and status to DEPLOYED
    await prisma.labourProfile.update({
      where: { id: assignment.labourId },
      data: {
        currentStage: "DEPLOYED",
        status: "DEPLOYED", // Update status from SHORTLISTED to DEPLOYED
      },
    });

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "LABOUR_PROFILE_STATUS_CHANGE",
          entityType: "LabourProfile",
          entityId: assignment.labourId,
          description: `Labour arrival confirmed and deployed successfully`,
          oldData: {
            currentStage: "ARRIVAL_CONFIRMATION",
            status: assignment.labour.status,
          },
          newData: {
            currentStage: "DEPLOYED",
            status: "DEPLOYED",
          },
          affectedFields: ["currentStage", "status"],
          performedById: session.user.id,
        },
      });
    } catch (auditError) {
      console.error("Audit log creation failed:", auditError);
      // Continue even if audit log fails
    }

    // Send notifications
    try {
      await notifyArrivalConfirmed(
        assignment.labour.name,
        assignment.agencyId,
        session.user.id
      );
    } catch (notificationError) {
      console.error("Notification sending failed:", notificationError);
      // Continue even if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Labour arrival confirmed successfully`,
      newStatus: "DEPLOYED",
    });
  } catch (error) {
    console.error("Error updating arrival confirmation:", error);
    return NextResponse.json(
      { error: "Failed to update arrival confirmation" },
      { status: 500 }
    );
  }
}
