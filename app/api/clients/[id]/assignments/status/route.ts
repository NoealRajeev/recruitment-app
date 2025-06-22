// app/api/clients/[id]/assignments/status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status, feedback } = await request.json();

    // Validate input
    if (!status || (status !== "ACCEPTED" && status !== "REJECTED")) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    if (status === "REJECTED" && !feedback) {
      return NextResponse.json(
        { error: "Feedback is required for rejection" },
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

    // Update the assignment within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First update the assignment
      const updatedAssignment = await tx.labourAssignment.update({
        where: {
          id: params.id,
          jobRole: {
            requirement: {
              clientId: client.id,
            },
          },
          adminStatus: "ACCEPTED",
        },
        data: {
          clientStatus: status,
          agencyStatus: status,
          adminStatus: status,
          clientFeedback: status === "ACCEPTED" ? null : feedback,
          updatedAt: new Date(),
        },
        include: {
          jobRole: {
            select: {
              id: true,
              requirementId: true,
              quantity: true,
              LabourAssignment: {
                select: {
                  id: true,
                  clientStatus: true,
                  labourId: true,
                },
              },
            },
          },
        },
      });

      // Check if all assignments in this job role are accepted
      const jobRole = updatedAssignment.jobRole;
      const acceptedCount = jobRole.LabourAssignment.filter(
        (a) => a.clientStatus === "ACCEPTED"
      ).length;

      // If requirement is fully completed (all needed assignments accepted)
      if (status === "ACCEPTED" && acceptedCount >= jobRole.quantity) {
        // 1. First reject all unselected assignments for this job role
        const unselectedAssignments = jobRole.LabourAssignment.filter(
          (a) => a.clientStatus !== "ACCEPTED" && a.id !== params.id
        );

        await Promise.all(
          unselectedAssignments.map((assignment) =>
            tx.labourAssignment.update({
              where: { id: assignment.id },
              data: {
                clientStatus: "REJECTED",
                clientFeedback: "Not selected - requirement fulfilled",
              },
            })
          )
        );

        // 2. Update all backup labour profiles for this job role
        await tx.labourProfile.updateMany({
          where: {
            LabourAssignment: {
              some: {
                jobRoleId: jobRole.id,
                isBackup: true,
              },
            },
          },
          data: {
            status: "APPROVED", // Or whatever status makes sense for your workflow
            verificationStatus: "VERIFIED", // Optional
          },
        });

        // 3. Mark all backup assignments as rejected
        await tx.labourAssignment.updateMany({
          where: {
            jobRoleId: jobRole.id,
            isBackup: true,
          },
          data: {
            clientStatus: "REJECTED",
            clientFeedback: "Backup candidate - requirement fulfilled",
          },
        });
      }

      return updatedAssignment;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating assignment status:", error);
    return NextResponse.json(
      { error: "Failed to update assignment status" },
      { status: 500 }
    );
  }
}
