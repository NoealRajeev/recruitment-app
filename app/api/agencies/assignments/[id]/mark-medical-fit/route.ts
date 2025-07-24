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
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignmentId = id;

  try {
    // Get agency profile
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
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
      // Mark MEDICAL_STATUS stage as completed
      const updatedStage = await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "MEDICAL_STATUS",
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      console.log("Updated MEDICAL_STATUS stage:", updatedStage);

      // Update current stage to FINGERPRINT
      await tx.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          currentStage: "FINGERPRINT",
        },
      });

      // Create new FINGERPRINT stage with PENDING status
      const newStage = await tx.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "FINGERPRINT",
          status: "PENDING",
          notes: "Medical examination passed, proceeding to fingerprint",
        },
      });
      console.log("Created new FINGERPRINT stage:", newStage);
    });

    return NextResponse.json({
      success: true,
      message: "Medical status marked as fit successfully",
    });
  } catch (error) {
    console.error("Error marking medical status as fit:", error);
    return NextResponse.json(
      { error: "Failed to mark medical status as fit" },
      { status: 500 }
    );
  }
}
