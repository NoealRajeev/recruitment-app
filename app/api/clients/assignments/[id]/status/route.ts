import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
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
      // First get the current assignment with related data
      const currentAssignment = await tx.labourAssignment.findUnique({
        where: { id: id },
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
          labour: {
            select: {
              id: true,
              currentStage: true,
            },
          },
        },
      });

      if (!currentAssignment) {
        throw new Error("Assignment not found");
      }

      // Update the assignment
      const updatedAssignment = await tx.labourAssignment.update({
        where: { id: id },
        data: {
          clientStatus: status,
          ...(status === "ACCEPTED" && {
            agencyStatus: "ACCEPTED",
            adminStatus: "ACCEPTED",
          }),
          ...(status === "REJECTED" && {
            adminStatus: "REJECTED",
          }),
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
          labour: true,
        },
      });

      // If accepted, create a stage history record for offer letter sign pending
      if (status === "ACCEPTED") {
        // Check if OFFER_LETTER_SIGN stage already exists to prevent duplicates
        const existingStage = await tx.labourStageHistory.findFirst({
          where: {
            labourId: currentAssignment.labourId,
            stage: "OFFER_LETTER_SIGN",
          },
        });

        if (!existingStage) {
          await tx.labourStageHistory.create({
            data: {
              labourId: currentAssignment.labourId,
              stage: "OFFER_LETTER_SIGN",
              status: "PENDING",
              notes: "Awaiting offer letter signature",
              documents: [],
            },
          });
        }

        // Update the current stage to OFFER_LETTER_SIGN
        await tx.labourProfile.update({
          where: { id: currentAssignment.labourId },
          data: {
            currentStage: "OFFER_LETTER_SIGN",
          },
        });
      }

      // If client REJECTED, update labour profile status
      if (status === "REJECTED") {
        await tx.labourProfile.update({
          where: { id: currentAssignment.labourId },
          data: {
            requirementId: null,
            status: "REJECTED",
          },
        });
      }

      // If client REJECTED a primary (not backup), promote oldest backup if available
      if (status === "REJECTED" && currentAssignment.isBackup === false) {
        // Find the oldest backup for this job role
        const backups = await tx.labourAssignment.findMany({
          where: {
            jobRoleId: currentAssignment.jobRole.id,
            isBackup: true,
          },
          orderBy: { createdAt: "asc" },
        });
        const oldestBackup = backups[0];
        if (oldestBackup) {
          await tx.labourAssignment.update({
            where: { id: oldestBackup.id },
            data: {
              isBackup: false,
              clientStatus: "SUBMITTED",
            },
          });
        }
      }

      // Get all assignments for this job role, sorted by createdAt
      const jobRoleAssignments = await tx.labourAssignment.findMany({
        where: { jobRoleId: currentAssignment.jobRole.id },
        orderBy: { createdAt: "asc" },
      });

      // Calculate needsMoreLabour exactly like admin rejection logic
      const acceptedPrimaries = jobRoleAssignments.filter(
        (a) => a.clientStatus === "ACCEPTED" && !a.isBackup
      ).length;
      await tx.jobRole.update({
        where: { id: currentAssignment.jobRole.id },
        data: {
          needsMoreLabour:
            acceptedPrimaries < currentAssignment.jobRole.quantity,
        },
      });

      // Check if all assignments in this job role are accepted
      const jobRole = updatedAssignment.jobRole;
      const acceptedCount = jobRoleAssignments.filter(
        (a) => a.clientStatus === "ACCEPTED"
      ).length;
      if (status === "ACCEPTED" && acceptedCount >= jobRole.quantity) {
        // 1. First reject all unselected assignments for this job role
        const unselectedAssignments = jobRole.LabourAssignment.filter(
          (a) => a.clientStatus !== "ACCEPTED" && a.id !== id
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

        // 1.5. Update unselected labour profiles back to APPROVED and remove requirement details
        await tx.labourProfile.updateMany({
          where: {
            id: {
              in: unselectedAssignments.map((a) => a.labourId),
            },
          },
          data: {
            status: "APPROVED",
            requirementId: null,
          },
        });

        // 2. Update all backup labour profiles for this job role to APPROVED and remove requirement details
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
            status: "APPROVED",
            verificationStatus: "VERIFIED",
            requirementId: null,
          },
        });

        // 3. Mark all backup assignments as rejected and remove backup details
        await tx.labourAssignment.updateMany({
          where: {
            jobRoleId: jobRole.id,
            isBackup: true,
          },
          data: {
            clientStatus: "REJECTED",
            clientFeedback: "Backup candidate - requirement fulfilled",
            isBackup: false,
          },
        });

        // 4. Also update rejected labour profiles to APPROVED and remove requirement details
        await tx.labourProfile.updateMany({
          where: {
            LabourAssignment: {
              some: {
                jobRoleId: jobRole.id,
                clientStatus: "REJECTED",
              },
            },
          },
          data: {
            status: "APPROVED",
            requirementId: null,
          },
        });

        // 4. Check if all job roles in the requirement are fulfilled
        const requirement = await tx.requirement.findUnique({
          where: { id: jobRole.requirementId },
          include: {
            jobRoles: {
              select: {
                id: true,
                quantity: true,
                LabourAssignment: {
                  select: {
                    id: true,
                    clientStatus: true,
                  },
                },
              },
            },
          },
        });

        if (requirement) {
          const allRolesFulfilled = requirement.jobRoles.every((jr) => {
            const accepted = jr.LabourAssignment.filter(
              (a) => a.clientStatus === "ACCEPTED"
            ).length;
            return accepted >= jr.quantity;
          });

          if (allRolesFulfilled) {
            // Update requirement status to COMPLETED
            await tx.requirement.update({
              where: { id: jobRole.requirementId },
              data: {
                status: "ACCEPTED",
              },
            });
          }
        }
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
