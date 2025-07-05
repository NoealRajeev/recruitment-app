// app/api/requirements/forward/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RequirementStatus, AuditAction } from "@/lib/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      requirementId,
      forwardedRoles,
      forwardAll = false,
    } = await request.json();

    if (!requirementId || !forwardedRoles || !Array.isArray(forwardedRoles)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate each forwarded role
    for (const role of forwardedRoles) {
      if (!role.jobRoleId || !role.agencyId || role.quantity === undefined) {
        return NextResponse.json(
          { error: "Invalid forwarded role data" },
          { status: 400 }
        );
      }
    }

    // Check if requirement exists
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      include: { jobRoles: true },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    // Update the requirement and job roles in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If forwarding all job roles, update requirement status
      if (forwardAll) {
        await tx.requirement.update({
          where: { id: requirementId },
          data: {
            status: "FORWARDED",
          },
        });
      }

      // Update each job role with agency assignment
      const updatedJobRoles = await Promise.all(
        forwardedRoles.map(async (role) => {
          // Verify the job role exists in this requirement
          const jobRoleExists = requirement.jobRoles.some(
            (jr) => jr.id === role.jobRoleId
          );
          if (!jobRoleExists) {
            throw new Error(
              `Job role ${role.jobRoleId} not found in requirement`
            );
          }

          // Verify the agency exists
          const agencyExists = await tx.agency.findUnique({
            where: { id: role.agencyId },
          });
          if (!agencyExists) {
            throw new Error(`Agency ${role.agencyId} not found`);
          }

          // Upsert JobRoleForwarding record
          await tx.jobRoleForwarding.upsert({
            where: {
              jobRoleId_agencyId: {
                jobRoleId: role.jobRoleId,
                agencyId: role.agencyId,
              },
            },
            update: {
              quantity: role.quantity,
            },
            create: {
              jobRoleId: role.jobRoleId,
              agencyId: role.agencyId,
              quantity: role.quantity,
            },
          });

          return tx.jobRole.update({
            where: { id: role.jobRoleId },
            data: {
              assignedAgencyId: role.agencyId,
              agencyStatus: "FORWARDED",
            },
          });
        })
      );

      // Check if all job roles are now forwarded
      const allJobRoles = await tx.jobRole.findMany({
        where: { requirementId },
      });
      const allForwarded = allJobRoles.every(
        (jr) => jr.assignedAgencyId && jr.agencyStatus === "FORWARDED"
      );

      // If all job roles are forwarded, update requirement status
      if (allForwarded) {
        await tx.requirement.update({
          where: { id: requirementId },
          data: {
            status: RequirementStatus.FORWARDED,
          },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_UPDATE,
          entityType: forwardAll ? "Requirement" : "JobRole",
          entityId: forwardAll ? requirementId : forwardedRoles[0].jobRoleId,
          performedById: session.user.id,
          oldData: {
            status: requirement.status,
            jobRoles: requirement.jobRoles.map((jr) => ({
              id: jr.id,
              assignedAgencyId: jr.assignedAgencyId,
              agencyStatus: jr.agencyStatus,
            })),
          },
          newData: {
            status: allForwarded ? "FORWARDED" : requirement.status,
            forwardedRoles: forwardedRoles.map((role) => ({
              jobRoleId: role.jobRoleId,
              agencyId: role.agencyId,
              quantity: role.quantity,
            })),
          },
          affectedFields: ["status", "jobRoles"],
        },
      });

      return {
        requirement: {
          ...requirement,
          status: allForwarded ? "FORWARDED" : requirement.status,
        },
        jobRoles: updatedJobRoles,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error forwarding requirement:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to forward requirement",
      },
      { status: 500 }
    );
  }
}
