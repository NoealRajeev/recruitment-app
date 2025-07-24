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

    // Use a transaction to update both the stage history and current stage
    await prisma.$transaction(async (tx) => {
      // Mark QVC_PAYMENT stage as completed
      const updatedStage = await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "QVC_PAYMENT",
          status: "PENDING",
        },
        data: {
          status: "PAID",
          completedAt: new Date(),
        },
      });
      console.log("Updated QVC_PAYMENT stage:", updatedStage);

      // Update current stage to CONTRACT_SIGN
      await tx.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          currentStage: "CONTRACT_SIGN",
        },
      });

      // Create new CONTRACT_SIGN stage with PENDING status
      const newStage = await tx.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "CONTRACT_SIGN",
          status: "PENDING",
          notes: "QVC payment completed, proceeding to contract signing",
        },
      });
      console.log("Created new CONTRACT_SIGN stage:", newStage);
    });

    return NextResponse.json({
      success: true,
      message: "QVC payment marked as completed successfully",
    });
  } catch (error) {
    console.error("Error marking QVC payment as completed:", error);
    return NextResponse.json(
      { error: "Failed to mark QVC payment as completed" },
      { status: 500 }
    );
  }
}
