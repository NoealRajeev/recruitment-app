import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction, LabourProfileStatus } from "@/lib/generated/prisma";
import { NotificationType, NotificationPriority } from "@prisma/client";
import { NotificationService } from "@/lib/notifications";
import { sendEmail } from "@/lib/utils/email-service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: jobRoleId } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        status: { in: ["APPROVED"] },
        verificationStatus: { in: ["PARTIALLY_VERIFIED", "VERIFIED"] }, // Only approved or shortlisted profiles
      },
    });

    if (profiles.length !== profileIds.length) {
      const missingProfiles = profileIds.filter(
        (id: string) => !profiles.some((p) => p.id === id)
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

    // Fetch the JobRoleForwarding record for this agency/jobRole
    const forwarding = await prisma.jobRoleForwarding.findUnique({
      where: {
        jobRoleId_agencyId: {
          jobRoleId,
          agencyId: agency.id,
        },
      },
    });
    if (!forwarding) {
      return NextResponse.json(
        { error: "No forwarding record found for this agency and job role" },
        { status: 400 }
      );
    }

    // Only count assignments that are not rejected by admin or client
    const nonRejectedAssignments = jobRole.LabourAssignment.filter(
      (a) => a.adminStatus !== "REJECTED" && a.clientStatus !== "REJECTED"
    );
    const rejectedAssignments = jobRole.LabourAssignment.filter(
      (a) => a.adminStatus === "REJECTED" || a.clientStatus === "REJECTED"
    );
    const existingAssignmentsCount = nonRejectedAssignments.length;
    const remainingSlots = forwarding.quantity - existingAssignmentsCount;

    if (
      profileIds.length > remainingSlots ||
      existingAssignmentsCount + profileIds.length > forwarding.quantity
    ) {
      return NextResponse.json(
        {
          error: "Exceeds available slots for this agency",
          details: {
            current: existingAssignmentsCount,
            adding: profileIds.length,
            remaining: remainingSlots,
            max: forwarding.quantity,
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
              agencyStatus: "ACCEPTED", // Initial status when agency submits
              adminStatus: "PENDING", // Waiting for admin review
              clientStatus: "PENDING", // Waiting for client review
            },
            include: {
              labour: true, // Include labour profile details
            },
          })
        )
      );

      // Update the labour profiles to SHORTLISTED status and reset stage history for new assignments
      await Promise.all(
        profileIds.map(async (profileId: string) => {
          // Clear existing stage history for this labour profile
          await tx.labourStageHistory.deleteMany({
            where: { labourId: profileId },
          });

          // Update labour profile with fresh start
          await tx.labourProfile.update({
            where: { id: profileId },
            data: {
              status: LabourProfileStatus.SHORTLISTED,
              requirementId: jobRole.requirementId,
              currentStage: "OFFER_LETTER_SIGN", // Reset to initial stage
            },
          });

          // Create fresh OFFER_LETTER_SIGN stage for the new assignment
          await tx.labourStageHistory.create({
            data: {
              labourId: profileId,
              stage: "OFFER_LETTER_SIGN",
              status: "PENDING",
              notes: "New assignment - awaiting offer letter signature",
            },
          });
        })
      );

      // Reset rejected labour profiles so they can be assigned elsewhere
      await Promise.all(
        rejectedAssignments.map((assignment) =>
          tx.labourProfile.update({
            where: { id: assignment.labourId },
            data: {
              status: "APPROVED",
              requirementId: null,
            },
          })
        )
      );

      // Delete rejected LabourAssignment records for this job role
      await Promise.all(
        rejectedAssignments.map((assignment) =>
          tx.labourAssignment.delete({
            where: { id: assignment.id },
          })
        )
      );

      // Calculate new assignment status
      const totalAssignments = existingAssignmentsCount + profileIds.length;
      const isFullyAssigned = totalAssignments >= forwarding.quantity;
      const newAgencyStatus = isFullyAssigned
        ? "SUBMITTED"
        : "PARTIALLY_SUBMITTED";

      // Update job role status and needsMoreLabour
      // Fetch previous needsMoreLabour value
      const prevJobRole = await prisma.jobRole.findUnique({
        where: { id: jobRoleId },
        select: {
          needsMoreLabour: true,
          assignedAgency: { include: { user: true } },
          title: true,
          requirement: {
            select: { id: true, client: { select: { companyName: true } } },
          },
        },
      });
      const newNeedsMoreLabour = totalAssignments < forwarding.quantity;
      const updatedJobRole = await tx.jobRole.update({
        where: { id: jobRoleId },
        data: {
          agencyStatus: newAgencyStatus,
          needsMoreLabour: newNeedsMoreLabour,
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
      // Notify agency if needsMoreLabour transitioned from false to true
      if (
        prevJobRole &&
        !prevJobRole.needsMoreLabour &&
        newNeedsMoreLabour &&
        prevJobRole.assignedAgency?.user
      ) {
        const agencyUser = prevJobRole.assignedAgency.user;
        const jobRoleTitle = prevJobRole.title;
        const companyName = prevJobRole.requirement?.client?.companyName || "";
        const config = {
          type: NotificationType.REQUIREMENT_NEEDS_REVISION,
          title: `Urgent: More Labour Needed for ${jobRoleTitle}`,
          message: `The requirement for ${companyName} needs more labour profiles for the job role: ${jobRoleTitle}. Please take action immediately.`,
          priority: NotificationPriority.HIGH,
          actionUrl: `/dashboard/agency/requirements`,
          actionText: "View Requirement",
        };
        // In-app notification
        await NotificationService.createNotification({
          ...config,
          recipientId: agencyUser.id,
        });
        // Email
        if (agencyUser.email) {
          await sendEmail({
            to: agencyUser.email,
            subject: config.title,
            text: config.message,
          });
        }
      }

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
        rejectedAssignments,
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

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  // pull the id out of the promised params
  const { id: jobRoleId } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Fetch all assignments for this job role and agency
    const assignments = await prisma.labourAssignment.findMany({
      where: {
        jobRoleId,
        agencyId: agency.id,
      },
      include: {
        labour: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments for job role:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
