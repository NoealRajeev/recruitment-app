// app/api/clients/assignments/bulk-status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { assignmentIds, status, feedback } = await request.json();

    // Validate input
    if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid assignment IDs provided" },
        { status: 400 }
      );
    }

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

    // Process the bulk update within a transaction
    const results = await prisma.$transaction(async (tx) => {
      // 1. First get all current assignments with related data
      const currentAssignments = await tx.labourAssignment.findMany({
        where: { id: { in: assignmentIds } },
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

      if (currentAssignments.length !== assignmentIds.length) {
        throw new Error("Some assignments not found");
      }

      // 2. Filter out assignments that already have the opposite status
      const assignmentsToUpdate = currentAssignments.filter((assignment) => {
        if (status === "ACCEPTED") {
          // For bulk accept, exclude assignments that are already rejected
          return assignment.clientStatus !== "REJECTED";
        } else {
          // For bulk reject, exclude assignments that are already accepted
          return assignment.clientStatus !== "ACCEPTED";
        }
      });

      if (assignmentsToUpdate.length === 0) {
        return [];
      }

      // Update only the filtered assignments
      const updatePromises = assignmentsToUpdate.map((assignment) =>
        tx.labourAssignment.update({
          where: { id: assignment.id },
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
            jobRole: true,
            labour: true,
          },
        })
      );

      const updatedAssignments = await Promise.all(updatePromises);

      // Update rejected labour profiles status
      if (status === "REJECTED") {
        await Promise.all(
          updatedAssignments.map((assignment) =>
            tx.labourProfile.update({
              where: { id: assignment.labourId },
              data: {
                requirementId: null,
                status: "REJECTED",
              },
            })
          )
        );
      }

      // 3. Group assignments by job role for processing
      const assignmentsByJobRole = updatedAssignments.reduce(
        (acc, assignment) => {
          if (!acc[assignment.jobRoleId]) {
            acc[assignment.jobRoleId] = [];
          }
          acc[assignment.jobRoleId].push(assignment);
          return acc;
        },
        {} as Record<string, typeof updatedAssignments>
      );

      // 4. Process each job role
      for (const [jobRoleId, assignments] of Object.entries(
        assignmentsByJobRole
      )) {
        const jobRole = assignments[0].jobRole;

        // Create stage history records for accepted assignments
        if (status === "ACCEPTED") {
          await Promise.all(
            assignments.map((assignment) =>
              tx.labourStageHistory.create({
                data: {
                  labourId: assignment.labourId,
                  stage: "OFFER_LETTER_SIGN",
                  status: "PENDING",
                  notes: "Awaiting offer letter signature",
                  documents: [],
                },
              })
            )
          );
        }

        // If client REJECTED primaries, promote backups if available
        if (status === "REJECTED") {
          // Find all rejected primaries for this job role
          const rejectedPrimaries = assignments.filter(
            (a) => a.isBackup === false
          );

          // For each rejected primary, try to promote a backup
          for (let i = 0; i < rejectedPrimaries.length; i++) {
            // Find the oldest backup for this job role
            const backups = await tx.labourAssignment.findMany({
              where: {
                jobRoleId: jobRoleId,
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
        }

        // Get current counts for the job role after backup promotion
        const jobRoleAssignments = await tx.labourAssignment.findMany({
          where: { jobRoleId },
        });

        // Calculate needsMoreLabour exactly like admin rejection logic
        const acceptedPrimaries = jobRoleAssignments.filter(
          (a) => a.clientStatus === "ACCEPTED" && !a.isBackup
        ).length;
        await tx.jobRole.update({
          where: { id: jobRoleId },
          data: {
            needsMoreLabour: acceptedPrimaries < jobRole.quantity,
          },
        });

        // Only auto-reject unselected assignments when accepting (not when rejecting)
        if (status === "ACCEPTED") {
          // Calculate accepted count for requirement completion check
          const acceptedCount = jobRoleAssignments.filter(
            (a) => a.clientStatus === "ACCEPTED" && !a.isBackup
          ).length;

          // If requirement is fully completed (all needed assignments accepted)
          if (acceptedCount >= jobRole.quantity) {
            // Reject all unselected assignments for this job role
            const unselectedAssignments = jobRoleAssignments.filter(
              (a) =>
                a.clientStatus !== "ACCEPTED" && !assignmentIds.includes(a.id)
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

            // Update unselected labour profiles back to APPROVED
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

            // Update all backup labour profiles for this job role
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
              },
            });

            // Mark all backup assignments as rejected
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

            // Check if all job roles in the requirement are fulfilled
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
                // Update requirement status to ACCEPTED
                await tx.requirement.update({
                  where: { id: jobRole.requirementId },
                  data: {
                    status: "ACCEPTED",
                  },
                });
              }
            }
          }
        }
      }

      return updatedAssignments;
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error bulk updating assignment status:", error);
    return NextResponse.json(
      { error: "Failed to bulk update assignment status" },
      { status: 500 }
    );
  }
}
