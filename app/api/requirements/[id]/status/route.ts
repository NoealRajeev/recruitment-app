// app/api/requirements/[id]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing assignment ID" },
        { status: 400 }
      );
    }

    if (!status || (status !== "ACCEPTED" && status !== "REJECTED")) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Verify the agency exists
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

    // Update the assignment status
    const updatedAssignment = await prisma.$transaction(async (tx) => {
      // First verify this assignment belongs to the agency
      const assignment = await tx.jobRole.findUnique({
        where: { id },
        include: {
          requirement: {
            select: {
              clientId: true,
            },
          },
          assignedAgency: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      if (assignment.assignedAgency?.id !== agency.id) {
        throw new Error("Unauthorized to update this assignment");
      }

      // Update the assignment status
      return await tx.jobRole.update({
        where: { id },
        data: {
          agencyStatus: status,
        },
        include: {
          requirement: {
            select: {
              id: true,
              jobRoles: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update assignment",
      },
      { status: 500 }
    );
  }
}
