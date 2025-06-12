// app/api/requirements/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  RequirementStatus,
  AuditAction,
  ExperienceLevel,
  TicketType,
} from "@/lib/generated/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// Base schema with mandatory fields
const BaseRequirementSchema = z.object({
  jobRoles: z
    .array(
      z.object({
        title: z.string().min(1, "Job title is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        nationality: z.string().min(1, "Nationality is required"),
        salary: z.number().min(0).optional(),
        salaryCurrency: z.string().optional(),
      })
    )
    .min(1, "At least one job role is required"),
});

// Extended schema for full requirement submission
const FullRequirementSchema = BaseRequirementSchema.extend({
  specialNotes: z.string().optional(),
  status: z.nativeEnum(RequirementStatus).optional(),
  languages: z.array(z.string()).optional(),
  minExperience: z.nativeEnum(ExperienceLevel).optional(),
  maxAge: z.number().min(18).max(70).optional(),
  ticketType: z.nativeEnum(TicketType).optional(),
  ticketProvided: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    // First validate the base requirements
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
    const hasFullData =
      fullValidation.success &&
      Object.keys(fullValidation.data).length >
        Object.keys(baseValidation.data).length;

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
          specialNotes: hasFullData ? fullValidation.data.specialNotes : null,
          status,
          languages: hasFullData ? fullValidation.data.languages || [] : [],
          minExperience: hasFullData ? fullValidation.data.minExperience : null,
          maxAge: hasFullData ? fullValidation.data.maxAge : null,
          ticketType: hasFullData ? fullValidation.data.ticketType : null,
          ticketProvided: hasFullData
            ? (fullValidation.data.ticketProvided ?? false)
            : false,
          client: {
            connect: {
              id: clientId,
            },
          },
        },
      });

      const createdJobRoles = await Promise.all(
        baseValidation.data.jobRoles.map((role) =>
          tx.jobRole.create({
            data: {
              title: role.title,
              quantity: role.quantity,
              nationality: role.nationality,
              salary: role.salary ?? null,
              salaryCurrency: role.salaryCurrency ?? "QAR",
              requirement: {
                connect: {
                  id: requirement.id,
                },
              },
            },
          })
        )
      );

      // Create audit log - now guaranteed to have a valid userId
      await tx.auditLog.create({
        data: {
          action:
            status === "DRAFT"
              ? AuditAction.DRAFT_CREATED
              : AuditAction.REQUIREMENT_CREATED,
          entityType: "REQUIREMENT",
          entityId: requirement.id,
          description: hasFullData
            ? "Full requirement submitted"
            : "Minimal requirement created during registration",
          performedById: userId,
          newData: {
            status: requirement.status,
            jobRoles: createdJobRoles.length,
            hasFullData,
          },
        },
      });

      return {
        ...requirement,
        jobRoles: createdJobRoles,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating requirement:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
