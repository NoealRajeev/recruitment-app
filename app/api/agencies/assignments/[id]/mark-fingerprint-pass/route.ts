import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignmentId = params.id;

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
      // Mark FINGERPRINT stage as completed
      const updatedStage = await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "FINGERPRINT",
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      console.log("Updated FINGERPRINT stage:", updatedStage);

      // Update current stage to VISA_PRINTING
      await tx.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          currentStage: "VISA_PRINTING",
        },
      });

      // Create new VISA_PRINTING stage with PENDING status
      const newStage = await tx.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "VISA_PRINTING",
          status: "PENDING",
          notes: "Fingerprint passed, proceeding to visa printing",
        },
      });
      console.log("Created new VISA_PRINTING stage:", newStage);
    });

    return NextResponse.json({
      success: true,
      message: "Fingerprint marked as passed successfully",
    });
  } catch (error) {
    console.error("Error marking fingerprint as passed:", error);
    return NextResponse.json(
      { error: "Failed to mark fingerprint as passed" },
      { status: 500 }
    );
  }
}
