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

    if (!assignment.signedOfferLetterUrl) {
      return NextResponse.json(
        { error: "No signed offer letter found" },
        { status: 400 }
      );
    }

    // Use a transaction to update both the stage history and current stage
    await prisma.$transaction(async (tx) => {
      // Mark OFFER_LETTER_SIGN stage as completed
      const updatedStage = await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "OFFER_LETTER_SIGN",
          status: "SIGNED",
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      console.log("Updated OFFER_LETTER_SIGN stage:", updatedStage);

      // Update current stage to VISA_APPLYING
      const updatedLabour = await tx.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          currentStage: "VISA_APPLYING",
        },
      });
      console.log(
        "Updated labour current stage to:",
        updatedLabour.currentStage
      );

      // Create new VISA_APPLYING stage with PENDING status
      const newStage = await tx.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "VISA_APPLYING",
          status: "PENDING",
          notes:
            "Offer letter verified by client, proceeding to visa application",
        },
      });
      console.log("Created new VISA_APPLYING stage:", newStage);
    });

    return NextResponse.json({
      success: true,
      message: "Signed offer letter verified successfully",
    });
  } catch (error) {
    console.error("Error verifying signed offer letter:", error);
    return NextResponse.json(
      { error: "Failed to verify signed offer letter" },
      { status: 500 }
    );
  }
}
