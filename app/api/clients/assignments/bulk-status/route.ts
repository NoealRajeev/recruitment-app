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

      // 2. Update all assignments
      const updatePromises = assignmentIds.map((id) =>
        tx.labourAssignment.update({
          where: { id },
          data: {
            clientStatus: status,
            ...(status === "ACCEPTED" && {
              agencyStatus: "ACCEPTED",
              adminStatus: "ACCEPTED",
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
                  stage: "INITIALIZED",
                  status: "COMPLETED",
                  notes: "Client accepted the labour profile",
                  documents: [],
                },
              })
            )
          );
        }

        // Get current counts for the job role
        const jobRoleAssignments = await tx.labourAssignment.findMany({
          where: { jobRoleId },
        });

        const acceptedCount = jobRoleAssignments.filter(
          (a) => a.clientStatus === "ACCEPTED"
        ).length;

        // If requirement is fully completed (all needed assignments accepted)
        if (status === "ACCEPTED" && acceptedCount >= jobRole.quantity) {
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
