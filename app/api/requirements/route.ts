import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  RequirementStatus,
  ContractDuration,
  AuditAction,
} from "@/lib/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// GET /api/requirements - Get all requirements for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as RequirementStatus | null;
    const ADclientId = searchParams.get("clientId");
    const showAssigned = searchParams.get("showAssigned") === "true";

    let requirements;
    let client = null;

    if (session.user.role === "CLIENT_ADMIN") {
      // First, get the client record for this user
      client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client profile not found for this user" },
          { status: 404 }
        );
      }
    }

    // Validate status if provided
    if (status && !Object.values(RequirementStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status parameter" },
        { status: 400 }
      );
    }

    if (session.user.role === "CLIENT_ADMIN") {
      // Client admin can see their own requirements
      requirements = await prisma.requirement.findMany({
        where: {
          clientId: client!.id,
          ...(status ? { status } : {}),
        },
        include: {
          jobRoles: true,
          client: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (session.user.role === "RECRUITMENT_ADMIN") {
      // Admin can see all requirements
      requirements = await prisma.requirement.findMany({
        where: {
          ...(ADclientId ? { clientId: ADclientId } : {}),
          ...(status ? { status } : {}),
        },
        include: {
          jobRoles: {
            where: showAssigned ? {} : { assignedAgencyId: null },
            include: {
              assignedAgency: {
                select: {
                  agencyName: true,
                },
              },
            },
          },
          client: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (session.user.role === "RECRUITMENT_AGENCY") {
      // Agency can see requirements assigned to them
      requirements = await prisma.requirement.findMany({
        where: {
          jobRoles: {
            some: {
              assignedAgencyId: session.user.id,
              ...(status ? { agencyStatus: status } : {}),
            },
          },
        },
        include: {
          jobRoles: {
            where: {
              assignedAgencyId: session.user.id,
            },
          },
          client: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(requirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

// POST /api/requirements - Create a new requirement
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "CLIENT_ADMIN") {
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

    const {
      jobRoles,
      status = "DRAFT",
    }: {
      jobRoles: Array<{
        title: string;
        quantity: number;
        nationality: string;
        startDate: string;
        contractDuration?: ContractDuration;
        basicSalary: number;
        salaryCurrency?: string;
        foodAllowance?: number;
        foodProvidedByCompany: boolean;
        housingAllowance?: number;
        housingProvidedByCompany: boolean;
        transportationAllowance?: number;
        transportationProvidedByCompany: boolean;
        mobileAllowance?: number;
        mobileProvidedByCompany: boolean;
        natureOfWorkAllowance?: number;
        otherAllowance?: number;
        healthInsurance: string;
        ticketFrequency: string[];
        workLocations: string[];
        previousExperience: string[];
        totalExperienceYears?: number;
        preferredAge?: number;
        languageRequirements: string[];
        specialRequirements?: string;
      }>;
      status?: RequirementStatus;
    } = await request.json();

    if (!jobRoles || jobRoles.length === 0) {
      return NextResponse.json(
        { error: "At least one job role is required" },
        { status: 400 }
      );
    }

    // Validate job roles
    for (const role of jobRoles) {
      if (
        !role.title ||
        !role.quantity ||
        !role.nationality ||
        !role.startDate
      ) {
        return NextResponse.json(
          { error: "Missing required fields in job role" },
          { status: 400 }
        );
      }
    }

    const requirement = await prisma.$transaction(async (tx) => {
      // Create the requirement
      const newRequirement = await tx.requirement.create({
        data: {
          clientId: client.id,
          status,
        },
      });

      // Create job roles
      const createdJobRoles = await Promise.all(
        jobRoles.map((role) =>
          tx.jobRole.create({
            data: {
              requirementId: newRequirement.id,
              title: role.title,
              quantity: role.quantity,
              nationality: role.nationality,
              startDate: new Date(role.startDate),
              contractDuration: role.contractDuration,
              basicSalary: role.basicSalary,
              salaryCurrency: role.salaryCurrency || "QAR",
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
            },
          })
        )
      );

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_CREATE,
          entityType: "Requirement",
          entityId: newRequirement.id,
          performedById: session.user.id,
          newData: {
            status,
            jobRoles: createdJobRoles.map((role) => ({
              title: role.title,
              quantity: role.quantity,
            })),
          },
        },
      });

      return {
        ...newRequirement,
        jobRoles: createdJobRoles,
      };
    });

    return NextResponse.json(requirement, { status: 201 });
  } catch (error) {
    console.error("Error creating requirement:", error);
    return NextResponse.json(
      { error: "Failed to create requirement" },
      { status: 500 }
    );
  }
}
