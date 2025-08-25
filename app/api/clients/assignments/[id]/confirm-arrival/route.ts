// app/api/assignments/[id]/arrival-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { NotificationDelivery } from "@/lib/notification-delivery";
import { NotificationType, NotificationPriority } from "@prisma/client";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CLIENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status, notes } = await request.json();
    if (status !== "ARRIVED") {
      return NextResponse.json(
        { error: "Invalid status. Must be ARRIVED" },
        { status: 400 }
      );
    }

    const assignment = await prisma.labourAssignment.findUnique({
      where: { id },
      include: {
        labour: true,
        jobRole: {
          include: {
            requirement: { include: { client: { include: { user: true } } } },
          },
        },
      },
    });
    if (!assignment)
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    if (assignment.jobRole.requirement.client.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this assignment" },
        { status: 403 }
      );
    }
    if (assignment.labour.currentStage !== "ARRIVAL_CONFIRMATION") {
      return NextResponse.json(
        { error: "Labour must be in ARRIVAL_CONFIRMATION stage" },
        { status: 400 }
      );
    }

    const existingArrivalStage = await prisma.labourStageHistory.findFirst({
      where: { labourId: assignment.labourId, stage: "ARRIVAL_CONFIRMATION" },
      orderBy: { createdAt: "desc" },
    });

    if (existingArrivalStage) {
      await prisma.labourStageHistory.update({
        where: { id: existingArrivalStage.id },
        data: {
          status: "COMPLETED",
          notes: notes || "Arrival confirmed - labour has arrived",
          completedAt: new Date(),
        },
      });
    } else {
      await prisma.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "ARRIVAL_CONFIRMATION",
          status: "COMPLETED",
          notes: notes || "Arrival confirmed - labour has arrived",
          completedAt: new Date(),
        },
      });
    }

    await prisma.labourStageHistory.create({
      data: {
        labourId: assignment.labourId,
        stage: "DEPLOYED",
        status: "COMPLETED",
        notes: "Labour successfully deployed",
        completedAt: new Date(),
      },
    });

    await prisma.labourProfile.update({
      where: { id: assignment.labourId },
      data: { currentStage: "DEPLOYED", status: "DEPLOYED" },
    });

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
          newData: { currentStage: "DEPLOYED", status: "DEPLOYED" },
          affectedFields: ["currentStage", "status"],
          performedById: session.user.id,
        },
      });
    } catch {}

    // NEW: Deliver (agency + client self)
    const cfg = {
      type: NotificationType.ARRIVAL_CONFIRMED,
      title: "Arrival confirmed",
      message: `Arrival confirmed for ${assignment.labour.name}. Status updated to DEPLOYED.`,
      priority: NotificationPriority.HIGH,
      actionUrl: `/dashboard/agency/recruitment`,
      actionText: "View tracker",
    } as const;

    // Agency userId is on Agency record; we have agencyId here, so fetch userId:
    const agency = await prisma.agency.findUnique({
      where: { id: assignment.agencyId },
      select: { userId: true },
    });
    if (agency?.userId) {
      await NotificationDelivery.deliverToUser(
        agency.userId,
        cfg,
        session.user.id,
        "LabourAssignment",
        id
      );
    }
    await NotificationDelivery.deliverToUser(
      session.user.id,
      cfg,
      session.user.id,
      "LabourAssignment",
      id
    );

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
