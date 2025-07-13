// app/api/agencies/labour/[id]/stages/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  LabourProfileStatus,
  LabourStage,
  StageStatus,
} from "@/lib/generated/prisma";

// Define the stage progression order
const STAGE_ORDER: LabourStage[] = [
  LabourStage.OFFER_LETTER_SIGN,
  LabourStage.VISA_APPLYING,
  LabourStage.QVC_PAYMENT,
  LabourStage.CONTRACT_SIGN,
  LabourStage.MEDICAL_STATUS,
  LabourStage.FINGERPRINT,
  LabourStage.VISA_PRINTING,
  LabourStage.READY_TO_TRAVEL,
  LabourStage.TRAVEL_CONFIRMATION,
  LabourStage.ARRIVAL_CONFIRMATION,
];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { stage, status, notes, documents } = await request.json();

    // Validate input
    if (!stage || !Object.values(LabourStage).includes(stage)) {
      return NextResponse.json(
        { error: "Invalid stage provided" },
        { status: 400 }
      );
    }

    if (!status || !Object.values(StageStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

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

    // Verify the labour profile belongs to this agency
    const labourAssignment = await prisma.labourAssignment.findFirst({
      where: {
        labourId: params.id,
        agencyId: agency.id,
      },
    });

    if (!labourAssignment) {
      return NextResponse.json(
        { error: "Labour profile not found or not assigned to your agency" },
        { status: 404 }
      );
    }

    // Update the stage within a transaction
    const updatedLabour = await prisma.$transaction(async (tx) => {
      // Get current labour profile
      const labour = await tx.labourProfile.findUnique({
        where: { id: params.id },
        include: { stages: true },
      });

      if (!labour) {
        throw new Error("Labour profile not found");
      }

      // Create new stage history
      const newStage = await tx.labourStageHistory.create({
        data: {
          labourId: params.id,
          stage,
          status,
          notes,
          documents: documents || [],
          completedAt: status === StageStatus.COMPLETED ? new Date() : null,
        },
      });

      // Update current stage if needed
      let nextStage: LabourStage | null = null;
      const nextStatus: StageStatus = StageStatus.PENDING;

      if (status === StageStatus.COMPLETED) {
        // Find the current stage in the order
        const currentIndex = STAGE_ORDER.indexOf(stage);

        // If this isn't the last stage, prepare the next one
        if (currentIndex < STAGE_ORDER.length - 1) {
          nextStage = STAGE_ORDER[currentIndex + 1];

          // Check if next stage already exists
          const existingNextStage = labour.stages.find(
            (s) => s.stage === nextStage
          );

          if (!existingNextStage) {
            await tx.labourStageHistory.create({
              data: {
                labourId: params.id,
                stage: nextStage,
                status: nextStatus,
                createdAt: new Date(),
              },
            });
          }
        }

        // Update current stage in labour profile
        await tx.labourProfile.update({
          where: { id: params.id },
          data: {
            currentStage: nextStage || stage,
          },
        });
      }
      if (stage === LabourStage.ARRIVAL_CONFIRMATION) {
        await tx.labourProfile.update({
          where: { id: params.id },
          data: {
            status: LabourProfileStatus.DEPLOYED,
          },
        });
      }

      return newStage;
    });

    return NextResponse.json(updatedLabour);
  } catch (error) {
    console.error("Error updating labour stage:", error);
    return NextResponse.json(
      { error: "Failed to update labour stage" },
      { status: 500 }
    );
  }
}
