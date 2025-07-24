import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CLIENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignmentId = id;

  try {
    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found" },
        { status: 404 }
      );
    }

    // Check if assignment exists and belongs to this client
    const assignment = await prisma.labourAssignment.findFirst({
      where: {
        id: assignmentId,
        jobRole: {
          requirement: {
            clientId: client.id,
          },
        },
      },
      include: {
        jobRole: {
          include: {
            requirement: true,
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

    // Check if current stage is VISA_APPLYING
    if (assignment.labour.currentStage !== "VISA_APPLYING") {
      return NextResponse.json(
        { error: "Current stage is not VISA_APPLYING" },
        { status: 400 }
      );
    }

    // Use a transaction to update both the stage history and current stage
    await prisma.$transaction(async (tx) => {
      // Mark VISA_APPLYING stage as completed
      const updatedStage = await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "VISA_APPLYING",
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      console.log("Updated VISA_APPLYING stage:", updatedStage);

      // Update current stage to QVC_PAYMENT
      const updatedLabour = await tx.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          currentStage: "QVC_PAYMENT",
        },
      });
      console.log(
        "Updated labour current stage to:",
        updatedLabour.currentStage
      );

      // Create new QVC_PAYMENT stage with PENDING status
      const newStage = await tx.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "QVC_PAYMENT",
          status: "PENDING",
          notes: "Visa application completed, proceeding to QVC payment",
        },
      });
      console.log("Created new QVC_PAYMENT stage:", newStage);
    });

    return NextResponse.json({
      success: true,
      message: "Visa application marked as completed successfully",
    });
  } catch (error) {
    console.error("Error marking visa as applied:", error);
    return NextResponse.json(
      { error: "Failed to mark visa as applied" },
      { status: 500 }
    );
  }
}
