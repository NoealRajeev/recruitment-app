import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a client admin
    if (session.user.role !== "CLIENT_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only client admins can update travel dates" },
        { status: 403 }
      );
    }

    const { travelDate } = await request.json();

    if (!travelDate) {
      return NextResponse.json(
        { error: "Travel date is required" },
        { status: 400 }
      );
    }

    // Validate date format
    const parsedDate = new Date(travelDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

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

    // Check if assignment exists and belongs to the client
    const assignment = await prisma.labourAssignment.findFirst({
      where: {
        id: params.id,
        jobRole: {
          requirement: {
            clientId: client.id,
          },
        },
      },
      include: {
        labour: true,
        jobRole: {
          include: {
            requirement: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        { status: 404 }
      );
    }

    // Update travel date
    const updatedAssignment = await prisma.labourAssignment.update({
      where: {
        id: params.id,
      },
      data: {
        travelDate: parsedDate,
      },
      include: {
        labour: true,
        jobRole: {
          include: {
            requirement: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "LABOUR_PROFILE_STATUS_CHANGE",
        entityType: "LABOUR_ASSIGNMENT",
        entityId: params.id,
        description: `Travel date updated for ${assignment.labour.name} to ${parsedDate.toLocaleDateString()}`,
        performedById: session.user.id,
        oldData: { travelDate: assignment.travelDate },
        newData: { travelDate: parsedDate },
        affectedFields: ["travelDate"],
      },
    });

    console.log(
      `Travel date updated for assignment ${params.id} by client ${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      message: "Travel date updated successfully",
      data: {
        travelDate: updatedAssignment.travelDate,
      },
    });
  } catch (error) {
    console.error("Error updating travel date:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
