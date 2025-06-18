// app/api/requirements/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  RequirementStatus,
  AuditAction,
  ExperienceLevel,
  TicketType,
  ContractDuration,
} from "@/lib/generated/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// Minimal job role schema (for case 1)
const MinimalJobRoleSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  nationality: z.string().min(1, "Nationality is required"),
});

// Full job role schema (for case 2)
const FullJobRoleSchema = MinimalJobRoleSchema.extend({
  salary: z
    .string()
    .min(1, "Salary is required")
    .refine((val) => !isNaN(parseFloat(val)), "Salary must be a number"),
  salaryCurrency: z.string().min(1, "Currency is required").default("QAR"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
    .refine((val) => {
      const inputDate = new Date(val);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Strip time
      const minDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      return inputDate >= minDate;
    }, "Start date must be at least 2 weeks from today"),
  contractDuration: z.nativeEnum(ContractDuration, {
    errorMap: () => ({ message: "Contract duration is required" }),
  }),
});

// Base schema with mandatory fields
const BaseRequirementSchema = z.object({
  jobRoles: z
    .array(z.union([MinimalJobRoleSchema, FullJobRoleSchema]))
    .min(1, "At least one job role is required"),
});

// Extended schema for full requirement submission
const FullRequirementSchema = BaseRequirementSchema.extend({
  languageRequirements: z
    .array(z.string().min(1))
    .min(1, "At least one language requirement is required"),
  minExperience: z
    .nativeEnum(ExperienceLevel, {
      errorMap: () => ({ message: "Invalid experience level" }),
    })
    .optional(),
  maxAge: z
    .union([
      z
        .number()
        .min(18, "Minimum age must be 18")
        .max(70, "Maximum age must be 70"),
      z
        .string()
        .regex(/^\d+$/, "Must be a number")
        .transform(Number)
        .refine((n) => n >= 18 && n <= 70, {
          message: "Age must be between 18 and 70",
        }),
    ])
    .optional(),
  specialNotes: z.string().optional(),
  ticketType: z
    .nativeEnum(TicketType, {
      errorMap: () => ({ message: "Invalid ticket type" }),
    })
    .optional(),
  ticketProvided: z.boolean().optional(),
  status: z.nativeEnum(RequirementStatus).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role to determine what data to fetch
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, clientProfile: true, agencyProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let requirements;

    if (user.role === "CLIENT_ADMIN" && user.clientProfile) {
      // Fetch requirements for this client
      requirements = await prisma.requirement.findMany({
        where: { clientId: user.clientProfile.id },
        include: {
          jobRoles: true,
          client: {
            select: {
              companyName: true,
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "RECRUITMENT_AGENCY" && user.agencyProfile) {
      // Fetch requirements assigned to this agency
      requirements = await prisma.requirement.findMany({
        where: { assignedAgencyId: user.agencyProfile.id },
        include: {
          jobRoles: true,
          client: {
            select: {
              companyName: true,
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "RECRUITMENT_ADMIN") {
      // Admin can see all requirements
      requirements = await prisma.requirement.findMany({
        include: {
          jobRoles: true,
          client: {
            select: {
              companyName: true,
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json(
        { error: "Unauthorized access to requirements" },
        { status: 403 }
      );
    }

    // Transform data to match frontend Requirement interface
    const transformedRequirements = requirements.map((req) => ({
      id: req.id,
      jobRoles: req.jobRoles.map((role) => ({
        id: role.id,
        title: role.title,
        quantity: role.quantity,
        nationality: role.nationality,
        salary: role.salary?.toString() || "",
        salaryCurrency: role.salaryCurrency || "QAR",
        startDate: role.startDate?.toISOString() || "",
        contractDuration: role.contractDuration || "",
      })),
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      languageRequirements: req.languages || [],
      minExperience: req.minExperience || null,
      maxAge: req.maxAge || null,
      specialNotes: req.specialNotes || null,
      ticketType: req.ticketType || null,
      ticketProvided: req.ticketProvided || false,
      client: {
        companyName: req.client.companyName,
        fullName: req.client.user.name || "",
        email: req.client.user.email || "",
        phone: req.client.user.phone || "",
      },
    }));

    return NextResponse.json(transformedRequirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    // First validate the base requirements
    if (body.maxAge && typeof body.maxAge === "string") {
      body.maxAge = Number(body.maxAge);
    }
    const baseValidation = BaseRequirementSchema.safeParse(body);
    if (!baseValidation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: baseValidation.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Then validate extended fields if present
    const fullValidation = FullRequirementSchema.safeParse(body);
    const hasFullData = fullValidation.success;

    let clientId = body.clientId;
    let userId: string;
    if (body.userId) {
      userId = body.userId;
    } else if (session?.user?.id) {
      userId = session.user.id;
    } else {
      return NextResponse.json(
        { error: "User ID is required for audit logging" },
        { status: 400 }
      );
    }

    // Verify the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "Specified user not found" },
        { status: 404 }
      );
    }

    // If clientId wasn't provided but we have a user, try to get their client profile
    if (!clientId && userId) {
      const client = await prisma.client.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found for this user" },
          { status: 404 }
        );
      }
      clientId = client.id;
    }

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    let status: RequirementStatus;
    if (hasFullData && fullValidation.data.status) {
      status = fullValidation.data.status as RequirementStatus;
    } else if (hasFullData) {
      status = RequirementStatus.SUBMITTED;
    } else {
      status = RequirementStatus.DRAFT;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the requirement with available data
      const requirement = await tx.requirement.create({
        data: {
          specialNotes: body.specialNotes || null,
          status: status,
          languages: body.languageRequirements || [],
          minExperience: body.minExperience || null,
          maxAge: body.maxAge || null,
          ticketType: body.ticketType || null,
          ticketProvided: body.ticketProvided || false,
          client: {
            connect: {
              id: clientId,
            },
          },
        },
      });
      const createdJobRoles = await Promise.all(
        body.jobRoles.map((role: any) => {
          const jobRoleData: any = {
            title: role.title,
            quantity: role.quantity,
            nationality: role.nationality,
            requirement: {
              connect: {
                id: requirement.id,
              },
            },
          };

          // Add optional fields if they exist
          if (role.salary) jobRoleData.salary = parseFloat(role.salary);
          if (role.salaryCurrency)
            jobRoleData.salaryCurrency = role.salaryCurrency;
          if (role.startDate) jobRoleData.startDate = new Date(role.startDate);
          if (role.contractDuration)
            jobRoleData.contractDuration = role.contractDuration;

          return tx.jobRole.create({
            data: jobRoleData,
          });
        })
      );

      // Create audit log - now guaranteed to have a valid userId
      const auditLogData = {
        action:
          status === "DRAFT"
            ? AuditAction.DRAFT_CREATED
            : AuditAction.REQUIREMENT_CREATED,
        entityType: "REQUIREMENT",
        entityId: requirement.id,
        description: hasFullData
          ? "Full requirement submitted"
          : "Minimal requirement created",
        performedById: userId,
        newData: {
          status: requirement.status,
          jobRoles: createdJobRoles.length,
          hasFullData,
        },
      };

      await tx.auditLog.create({
        data: auditLogData,
      });

      const result = {
        ...requirement,
        jobRoles: createdJobRoles,
      };
      return result;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    // Validate the input
    const validation = BaseRequirementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requirement exists and belongs to this user
    const existingRequirement = await prisma.requirement.findUnique({
      where: { id: body.id },
      include: { client: true },
    });

    if (!existingRequirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    if (existingRequirement.client.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update the requirement
      const updatedRequirement = await tx.requirement.update({
        where: { id: body.id },
        data: {
          specialNotes: body.specialNotes || null,
          status: body.status || existingRequirement.status,
          languages: body.languageRequirements || existingRequirement.languages,
          minExperience:
            body.minExperience || existingRequirement.minExperience,
          maxAge: body.maxAge || existingRequirement.maxAge,
          ticketType: body.ticketType || existingRequirement.ticketType,
          ticketProvided:
            body.ticketProvided || existingRequirement.ticketProvided,
        },
      });

      // Delete existing job roles
      await tx.jobRole.deleteMany({
        where: { requirementId: body.id },
      });

      // Create new job roles with all provided fields
      const createdJobRoles = await Promise.all(
        body.jobRoles.map((role: any) => {
          const jobRoleData: any = {
            title: role.title,
            quantity: role.quantity,
            nationality: role.nationality,
            requirement: {
              connect: {
                id: body.id,
              },
            },
          };
          // Add optional fields if they exist
          if (role.salary) jobRoleData.salary = parseFloat(role.salary);
          if (role.salaryCurrency)
            jobRoleData.salaryCurrency = role.salaryCurrency;
          if (role.startDate) jobRoleData.startDate = new Date(role.startDate);
          if (role.contractDuration)
            jobRoleData.contractDuration = role.contractDuration;

          return tx.jobRole.create({
            data: jobRoleData,
          });
        })
      );

      // Create audit log
      await tx.auditLog.create({
        data: {
          action:
            body.status === "DRAFT"
              ? AuditAction.DRAFT_UPDATED
              : AuditAction.REQUIREMENT_UPDATED,
          entityType: "REQUIREMENT",
          entityId: body.id,
          description:
            body.status === "DRAFT" ? "Draft updated" : "Requirement updated",
          performedById: userId,
          newData: {
            status: updatedRequirement.status,
            jobRoles: createdJobRoles.length,
          },
        },
      });

      return {
        ...updatedRequirement,
        jobRoles: createdJobRoles,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating requirement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
