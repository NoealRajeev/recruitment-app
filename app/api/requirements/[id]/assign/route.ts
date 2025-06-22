import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction, LabourProfileStatus } from "@/lib/generated/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobRoleId } = params;
    const { profileIds } = await request.json();

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

    // Verify the job role exists and is assigned to this agency
    const jobRole = await prisma.jobRole.findUnique({
      where: {
        id: jobRoleId,
        assignedAgencyId: agency.id,
        agencyStatus: "FORWARDED", // Only allow assignments for forwarded roles
      },
      include: {
        requirement: true,
        LabourAssignment: true, // Include existing assignments
      },
    });

    if (!jobRole) {
      return NextResponse.json(
        { error: "Job role not found or not assigned to your agency" },
        { status: 404 }
      );
    }

    // Verify all profiles belong to the agency and are available
    const profiles = await prisma.labourProfile.findMany({
      where: {
        id: { in: profileIds },
        agencyId: agency.id,
        status: { in: ["APPROVED", "SHORTLISTED"] }, // Only approved or shortlisted profiles
      },
    });

    if (profiles.length !== profileIds.length) {
      const missingProfiles = profileIds.filter(
        (id) => !profiles.some((p) => p.id === id)
      );
      return NextResponse.json(
        {
          error:
            "Some profiles don't belong to your agency or aren't available",
          details: {
            requested: profileIds.length,
            found: profiles.length,
            missing: missingProfiles,
          },
        },
        { status: 400 }
      );
    }

    // Check if we're exceeding the required quantity
    const existingAssignmentsCount = jobRole.LabourAssignment.length;
    const remainingSlots = jobRole.quantity - existingAssignmentsCount;

    if (profileIds.length > remainingSlots) {
      return NextResponse.json(
        {
          error: "Exceeds available slots",
          details: {
            current: existingAssignmentsCount,
            adding: profileIds.length,
            remaining: remainingSlots,
            max: jobRole.quantity,
          },
        },
        { status: 400 }
      );
    }

    // Create assignments in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new assignments
      const newAssignments = await Promise.all(
        profileIds.map((profileId: string) =>
          tx.labourAssignment.create({
            data: {
              jobRoleId,
              agencyId: agency.id,
              labourId: profileId,
              agencyStatus: "SUBMITTED", // Initial status when agency submits
              adminStatus: "PENDING", // Waiting for admin review
              clientStatus: "PENDING", // Waiting for client review
            },
            include: {
              labour: true, // Include labour profile details
            },
          })
        )
      );

      // Update the labour profiles to SHORTLISTED status
      await Promise.all(
        profileIds.map((profileId: string) =>
          tx.labourProfile.update({
            where: { id: profileId },
            data: {
              status: LabourProfileStatus.SHORTLISTED,
              requirementId: jobRole.requirementId,
            },
          })
        )
      );

      // Calculate new assignment status
      const totalAssignments = existingAssignmentsCount + profileIds.length;
      const isFullyAssigned = totalAssignments >= jobRole.quantity;
      const newAgencyStatus = isFullyAssigned
        ? "SUBMITTED"
        : "PARTIALLY_SUBMITTED";

      // Update job role status
      const updatedJobRole = await tx.jobRole.update({
        where: { id: jobRoleId },
        data: {
          agencyStatus: newAgencyStatus,
        },
        include: {
          requirement: true,
          LabourAssignment: {
            include: {
              labour: true,
            },
          },
        },
      });

      // Check if all job roles for this requirement are now submitted
      if (isFullyAssigned) {
        const allJobRoles = await tx.jobRole.findMany({
          where: { requirementId: jobRole.requirementId },
        });

        const allSubmitted = allJobRoles.every((jr) =>
          ["SUBMITTED", "ACCEPTED"].includes(jr.agencyStatus)
        );

        if (allSubmitted) {
          await tx.requirement.update({
            where: { id: jobRole.requirementId },
            data: { status: "UNDER_REVIEW" }, // Ready for admin review
          });
        }
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
          entityType: "JobRole",
          entityId: jobRoleId,
          performedById: session.user.id,
          oldData: {
            agencyStatus: jobRole.agencyStatus,
            assignments: existingAssignmentsCount,
          },
          newData: {
            agencyStatus: newAgencyStatus,
            newAssignments: newAssignments.map((a) => ({
              id: a.id,
              labourId: a.labourId,
              labourName: a.labour.name,
            })),
            totalAssignments: totalAssignments,
          },
          affectedFields: ["agencyStatus", "assignments"],
        },
      });

      return {
        jobRole: updatedJobRole,
        assignments: newAssignments,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error assigning profiles:", error);
    return NextResponse.json(
      { error: "Failed to assign profiles" },
      { status: 500 }
    );
  }
}
