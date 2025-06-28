import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  RequirementStatus,
  ContractDuration,
  AuditAction,
} from "@/lib/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// GET /api/requirements/[id] - Get a specific requirement
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found for this user" },
        { status: 404 }
      );
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id }, // Use the destructured id
      include: {
        jobRoles: true,
        client: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    // Authorization checks
    if (
      session.user.role === "CLIENT_ADMIN" &&
      requirement.clientId !== client.id
    ) {
      return NextResponse.json(
        { error: "You don't have permission to access this requirement" },
        { status: 403 }
      );
    }

    if (session.user.role === "RECRUITMENT_AGENCY") {
      const hasAccess = requirement.jobRoles.some(
        (role) => role.assignedAgencyId === client.id
      );
      if (!hasAccess) {
        return NextResponse.json(
          { error: "You don't have permission to access this requirement" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(requirement);
  } catch (error) {
    console.error(`Error fetching requirement ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch requirement" },
      { status: 500 }
    );
  }
}

// PATCH /api/requirements/[id] - Update a requirement
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      jobRoles,
      status,
    }: {
      jobRoles?: Array<{
        id?: string;
        title?: string;
        quantity?: number;
        nationality?: string;
        startDate?: string;
        contractDuration?: ContractDuration;
        basicSalary?: number;
        salaryCurrency?: string;
        foodAllowance?: number;
        foodProvidedByCompany?: boolean;
        housingAllowance?: number;
        housingProvidedByCompany?: boolean;
        transportationAllowance?: number;
        transportationProvidedByCompany?: boolean;
        mobileAllowance?: number;
        mobileProvidedByCompany?: boolean;
        natureOfWorkAllowance?: number;
        otherAllowance?: number;
        healthInsurance?: string;
        ticketFrequency: string;
        workLocations: string;
        previousExperience: string;
        totalExperienceYears?: number;
        preferredAge?: number;
        languageRequirements?: string[];
        specialRequirements?: string;
        assignedAgencyId?: string;
        agencyStatus?: RequirementStatus;
      }>;
      status?: RequirementStatus;
    } = await request.json();

    // Check if requirement exists
    const existingRequirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: {
        jobRoles: true,
        client: true,
      },
    });

    if (!existingRequirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    // Authorization checks based on user role
    let canUpdateStatus = false;
    let canUpdateJobRoles = false;
    let canUpdateAgencyStatus = false;

    if (session.user.role === "CLIENT_ADMIN") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client profile not found for this user" },
          { status: 404 }
        );
      }

      // Client can only update their own requirements
      if (existingRequirement.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Client can update status only if current status is DRAFT
      canUpdateStatus = existingRequirement.status === "DRAFT";

      // Client can update job roles only if status is DRAFT
      canUpdateJobRoles = existingRequirement.status === "DRAFT";

      // Client cannot update agency status
      canUpdateAgencyStatus = false;
    } else if (session.user.role === "RECRUITMENT_ADMIN") {
      // Admin can update status to REJECTED or COMPLETED
      canUpdateStatus = status === "REJECTED" || status === "COMPLETED";

      // Admin cannot update job roles
      canUpdateJobRoles = false;

      // Admin can update agency status
      canUpdateAgencyStatus = true;
    } else {
      // Other roles not allowed
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate status update permission
    if (status && !canUpdateStatus) {
      return NextResponse.json(
        { error: "Not allowed to update status" },
        { status: 403 }
      );
    }

    // Validate job roles update permission
    if (jobRoles && !canUpdateJobRoles) {
      return NextResponse.json(
        { error: "Not allowed to update job roles" },
        { status: 403 }
      );
    }

    const updatedRequirement = await prisma.$transaction(async (tx) => {
      // Update requirement status if provided and allowed
      if (status) {
        await tx.requirement.update({
          where: { id: params.id },
          data: { status },
        });
      }

      // Update job roles if provided and allowed
      if (jobRoles && canUpdateJobRoles) {
        await Promise.all(
          jobRoles.map(async (role) => {
            if (role.id) {
              // Update existing role
              return tx.jobRole.update({
                where: { id: role.id },
                data: {
                  title: role.title,
                  quantity: role.quantity,
                  nationality: role.nationality,
                  startDate: role.startDate
                    ? new Date(role.startDate)
                    : undefined,
                  contractDuration: role.contractDuration,
                  basicSalary: role.basicSalary,
                  salaryCurrency: role.salaryCurrency,
                  foodAllowance: role.foodAllowance,
                  foodProvidedByCompany: role.foodProvidedByCompany,
                  housingAllowance: role.housingAllowance,
                  housingProvidedByCompany: role.housingProvidedByCompany,
                  transportationAllowance: role.transportationAllowance,
                  transportationProvidedByCompany:
                    role.transportationProvidedByCompany,
                  mobileAllowance: role.mobileAllowance,
                  mobileProvidedByCompany: role.mobileProvidedByCompany,
                  natureOfWorkAllowance: role.natureOfWorkAllowance,
                  otherAllowance: role.otherAllowance,
                  healthInsurance: role.healthInsurance,
                  ticketFrequency: role.ticketFrequency,
                  workLocations: role.workLocations,
                  previousExperience: role.previousExperience,
                  totalExperienceYears: role.totalExperienceYears,
                  preferredAge: role.preferredAge,
                  languageRequirements: role.languageRequirements,
                  specialRequirements: role.specialRequirements,
                  assignedAgencyId: role.assignedAgencyId,
                  agencyStatus: canUpdateAgencyStatus
                    ? role.agencyStatus
                    : undefined,
                },
              });
            } else {
              // Create new role
              return tx.jobRole.create({
                data: {
                  requirementId: params.id,
                  title: role.title || "",
                  quantity: role.quantity || 1,
                  nationality: role.nationality || "",
                  startDate: role.startDate
                    ? new Date(role.startDate)
                    : new Date(),
                  contractDuration: role.contractDuration,
                  basicSalary: role.basicSalary || 0,
                  salaryCurrency: role.salaryCurrency || "QAR",
                  foodAllowance: role.foodAllowance,
                  foodProvidedByCompany: role.foodProvidedByCompany || false,
                  housingAllowance: role.housingAllowance,
                  housingProvidedByCompany:
                    role.housingProvidedByCompany || false,
                  transportationAllowance: role.transportationAllowance,
                  transportationProvidedByCompany:
                    role.transportationProvidedByCompany || false,
                  mobileAllowance: role.mobileAllowance,
                  mobileProvidedByCompany:
                    role.mobileProvidedByCompany || false,
                  natureOfWorkAllowance: role.natureOfWorkAllowance,
                  otherAllowance: role.otherAllowance,
                  healthInsurance: role.healthInsurance || "asPerLaw",
                  ticketFrequency: role.ticketFrequency || "",
                  workLocations: role.workLocations || "",
                  previousExperience: role.previousExperience || "",
                  totalExperienceYears: role.totalExperienceYears,
                  preferredAge: role.preferredAge,
                  languageRequirements: role.languageRequirements || [],
                  specialRequirements: role.specialRequirements,
                  assignedAgencyId: role.assignedAgencyId,
                  agencyStatus: canUpdateAgencyStatus
                    ? role.agencyStatus
                    : "UNDER_REVIEW",
                },
              });
            }
          })
        );
      }

      // Get the updated requirement
      const updated = await tx.requirement.findUnique({
        where: { id: params.id },
        include: {
          jobRoles: true,
          client: {
            select: {
              companyName: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_UPDATE,
          entityType: "Requirement",
          entityId: params.id,
          performedById: session.user.id,
          newData: {
            status: status || existingRequirement.status,
            jobRoles: updated?.jobRoles.map((role) => ({
              id: role.id,
              title: role.title,
            })),
          },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedRequirement);
  } catch (error) {
    console.error("Error updating requirement:", error);
    return NextResponse.json(
      { error: "Failed to update requirement" },
      { status: 500 }
    );
  }
}

// DELETE /api/requirements/[id] - Delete a requirement
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found for this user" },
        { status: 404 }
      );
    }

    // Check if requirement exists and user has access
    const existingRequirement = await prisma.requirement.findUnique({
      where: { id: params.id },
    });

    if (!existingRequirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    // Only client admin can delete their own DRAFT requirements
    if (
      session.user.role !== "CLIENT_ADMIN" ||
      existingRequirement.clientId !== client.id ||
      existingRequirement.status !== "DRAFT"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete job roles first
      await tx.jobRole.deleteMany({
        where: { requirementId: params.id },
      });

      // Then delete the requirement
      await tx.requirement.delete({
        where: { id: params.id },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_DELETE,
          entityType: "Requirement",
          entityId: params.id,
          performedById: client.id,
        },
      });
    });

    return NextResponse.json(
      { message: "Requirement deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting requirement:", error);
    return NextResponse.json(
      { error: "Failed to delete requirement" },
      { status: 500 }
    );
  }
}
