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
    const statusParam = searchParams.get("status");
    const ADclientId = searchParams.get("clientId");
    const showAssigned = searchParams.get("showAssigned") === "true";

    // Handle multiple status values
    const statuses = statusParam
      ? (statusParam.split(",").map((s) => s.trim()) as RequirementStatus[])
      : null;

    let requirements;
    let client = null;

    if (session.user.role === "CLIENT_ADMIN") {
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

    if (session.user.role === "CLIENT_ADMIN") {
      requirements = await prisma.requirement.findMany({
        where: {
          clientId: client!.id,
          ...(statuses ? { status: { in: statuses } } : {}),
          jobRoles: {
            none: {
              agencyStatus: "AGENCY_REJECTED",
            },
          },
        },
        include: {
          jobRoles: {
            where: {
              agencyStatus: {
                not: "AGENCY_REJECTED",
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
    } else if (session.user.role === "RECRUITMENT_ADMIN") {
      requirements = await prisma.requirement.findMany({
        where: {
          ...(ADclientId ? { clientId: ADclientId } : {}),
          ...(statuses ? { status: { in: statuses } } : {}),
          jobRoles: {
            some: {
              OR: [
                { assignedAgencyId: null },
                { agencyStatus: "REJECTED" },
                { agencyStatus: "AGENCY_REJECTED" },
              ],
            },
          },
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
      requirements = await prisma.requirement.findMany({
        where: {
          jobRoles: {
            some: {
              assignedAgencyId: session.user.id,
              ...(statuses ? { agencyStatus: { in: statuses } } : {}),
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

    const body = await request.json();
    const {
      jobRoles,
      status = "DRAFT",
    }: {
      jobRoles: Array<{
        title?: string;
        quantity?: number;
        nationality?: string;
        startDate?: string;
        contractDuration?: ContractDuration | null;
        basicSalary?: number;
        salaryCurrency?: string;
        foodAllowance?: number | null;
        foodProvidedByCompany?: boolean;
        housingAllowance?: number | null;
        housingProvidedByCompany?: boolean;
        transportationAllowance?: number | null;
        transportationProvidedByCompany?: boolean;
        mobileAllowance?: number | null;
        mobileProvidedByCompany?: boolean;
        natureOfWorkAllowance?: number | null;
        otherAllowance?: number | null;
        healthInsurance?: string;
        ticketFrequency?: string;
        workLocations?: string;
        previousExperience?: string;
        totalExperienceYears?: number | null;
        preferredAge?: number | null;
        languageRequirements?: string[];
        specialRequirements?: string | null;
      }>;
      status?: RequirementStatus;
    } = body;

    if (!jobRoles || jobRoles.length === 0) {
      return NextResponse.json(
        { error: "At least one job role is required" },
        { status: 400 }
      );
    }

    const isDraft = status === "DRAFT";

    // --- Validation for final submissions only ---
    if (!isDraft) {
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
    }

    // Helper to get yyyy-MM-dd for today + 15d
    const minStartDate = () => {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      return d;
    };

    // Coerce/normalize a role (for draft we allow missing fields)
    function normalizeRole(r: any) {
      const start = r?.startDate ? new Date(r.startDate) : minStartDate();
      return {
        title: r?.title ?? "", // allow empty string
        quantity: r?.quantity ?? 1, // default 1
        nationality: r?.nationality ?? "", // allow empty string
        startDate: Number.isNaN(start.getTime()) ? minStartDate() : start,
        contractDuration: r?.contractDuration ?? null,

        basicSalary: typeof r?.basicSalary === "number" ? r.basicSalary : 0,
        salaryCurrency: r?.salaryCurrency ?? "QAR",

        foodAllowance: r?.foodProvidedByCompany
          ? 0
          : (r?.foodAllowance ?? null),
        foodProvidedByCompany: !!r?.foodProvidedByCompany,

        housingAllowance: r?.housingProvidedByCompany
          ? 0
          : (r?.housingAllowance ?? null),
        housingProvidedByCompany: !!r?.housingProvidedByCompany,

        transportationAllowance: r?.transportationProvidedByCompany
          ? 0
          : (r?.transportationAllowance ?? null),
        transportationProvidedByCompany: !!r?.transportationProvidedByCompany,

        mobileAllowance: r?.mobileProvidedByCompany
          ? 0
          : (r?.mobileAllowance ?? null),
        mobileProvidedByCompany: !!r?.mobileProvidedByCompany,

        natureOfWorkAllowance: r?.natureOfWorkAllowance ?? null, // allow 0 or null
        otherAllowance: r?.otherAllowance ?? null, // allow 0 or null

        healthInsurance: r?.healthInsurance ?? "asPerLaw",
        ticketFrequency: r?.ticketFrequency ?? "",
        workLocations: r?.workLocations ?? "",
        previousExperience: r?.previousExperience ?? "",

        totalExperienceYears:
          typeof r?.totalExperienceYears === "number"
            ? r.totalExperienceYears
            : null,
        preferredAge:
          typeof r?.preferredAge === "number" ? r.preferredAge : null,

        languageRequirements: Array.isArray(r?.languageRequirements)
          ? r.languageRequirements
          : [],

        specialRequirements: r?.specialRequirements ?? null,
      };
    }

    const normalizedRoles = isDraft
      ? jobRoles.map(normalizeRole)
      : // for non-draft, still normalize to ensure types
        jobRoles.map((r) => ({
          ...normalizeRole(r),
          // guarantee the required set is filled (already validated above)
          title: r.title!,
          quantity: r.quantity!,
          nationality: r.nationality!,
          startDate: new Date(r.startDate!),
        }));

    const requirement = await prisma.$transaction(async (tx) => {
      const newRequirement = await tx.requirement.create({
        data: {
          clientId: client.id,
          status,
        },
      });

      // Create job roles (both for draft and submitted, with defaults where needed)
      const createdJobRoles = await Promise.all(
        normalizedRoles.map((role) =>
          tx.jobRole.create({
            data: {
              requirementId: newRequirement.id,
              title: role.title,
              quantity: role.quantity,
              nationality: role.nationality,
              startDate: role.startDate,
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
            },
          })
        )
      );

      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_CREATE,
          entityType: "Requirement",
          entityId: newRequirement.id,
          performedById: session.user.id,
          newData: {
            status,
            jobRoles: createdJobRoles.map((r) => ({
              title: r.title,
              quantity: r.quantity,
            })),
          },
        },
      });

      return { ...newRequirement, jobRoles: createdJobRoles };
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
