// app/api/requirements/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { RequirementStatus } from "@/lib/generated/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
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
              id: true,
              status: true,
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

      const newStatus = status === "REJECTED" ? "AGENCY_REJECTED" : "ACCEPTED";

      // Update the job role status
      const updatedJobRole = await tx.jobRole.update({
        where: { id },
        data: {
          agencyStatus: newStatus,
          ...(status === "REJECTED" && {
            assignedAgencyId: null, // Clear agency assignment so it can be reassigned
          }),
        },
      });

      // Check if we need to update the requirement status
      const allJobRoles = await tx.jobRole.findMany({
        where: { requirementId: assignment.requirement.id },
      });

      // Determine overall requirement status based on job roles
      let requirementStatus: RequirementStatus = assignment.requirement.status;

      if (allJobRoles.every((role) => role.agencyStatus === "ACCEPTED")) {
        requirementStatus = "ACCEPTED";
      } else if (allJobRoles.some((role) => role.agencyStatus === "ACCEPTED")) {
        requirementStatus = "PARTIALLY_ACCEPTED";
      } else if (
        allJobRoles.some((role) => role.agencyStatus === "AGENCY_REJECTED")
      ) {
        requirementStatus = "UNDER_REVIEW"; // Go back to admin for review/reassignment
      } else if (
        allJobRoles.some((role) => role.agencyStatus === "UNDER_REVIEW")
      ) {
        requirementStatus = "UNDER_REVIEW";
      }

      // Update requirement status if changed
      if (requirementStatus !== assignment.requirement.status) {
        await tx.requirement.update({
          where: { id: assignment.requirement.id },
          data: { status: requirementStatus },
        });
      }

      return updatedJobRole;
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
