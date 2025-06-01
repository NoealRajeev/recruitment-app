// app/api/requirements/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import {
  AuditAction,
  ContractDuration,
  PreviousExperience,
  RequirementStatus,
  TicketDetails,
} from "@/lib/generated/prisma/client";

interface JobRoleInput {
  title: string;
  quantity: number;
  nationality: string;
  salary: string;
}

interface JobRoleResponse {
  id: string;
  title: string;
  quantity: number;
  nationality: string;
  salary: string;
  requirementId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle admin view - get all requirements or filtered by clientId
    if (session.user.role === "RECRUITMENT_ADMIN") {
      const clientId = searchParams.get("clientId");
      const status = searchParams.get("status");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (clientId) where.clientId = clientId;
      if (status) where.status = status;

      const requirements = await prisma.requirement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              user: {
                select: {
                  status: true,
                },
              },
            },
          },
          jobRoles: true,
        },
      });

      return NextResponse.json(requirements);
    }

    // Existing client-specific logic
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get all requirements for this client with job roles
    const requirements = await prisma.requirement.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },
        jobRoles: true,
      },
    });

    return NextResponse.json(requirements);
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
    const {
      projectLocation,
      startDate,
      contractDuration,
      previousExperience,
      totalExperienceYears,
      preferredAge,
      specialNotes,
      status,
      languages,
      jobRoles,
      ticketDetails, // For updates
    } = body;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get client associated with current user
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true, userId: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // For drafts, allow null values for required fields
    const isDraft = status === "DRAFT";

    // Validate required fields for non-drafts
    if (!isDraft) {
      if (!projectLocation || !startDate || !contractDuration) {
        return NextResponse.json(
          {
            error: "Missing required fields",
            details: {
              projectLocation: !projectLocation,
              startDate: !startDate,
              contractDuration: !contractDuration,
            },
          },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the requirement
      const requirement = await tx.requirement.create({
        data: {
          projectLocation: projectLocation || null,
          startDate: startDate ? new Date(startDate) : null,
          contractDuration: (contractDuration as ContractDuration) || null,
          previousExperience:
            (previousExperience as PreviousExperience) || null,
          totalExperienceYears: totalExperienceYears
            ? Number(totalExperienceYears)
            : null,
          preferredAge: preferredAge ? Number(preferredAge) : null,
          specialNotes: specialNotes || null,
          status: (status as RequirementStatus) || "DRAFT",
          client: {
            connect: {
              id: client.id,
            },
          },
          languages: languages || [],
          ticketDetails: (ticketDetails as TicketDetails) || null,
        },
      });

      // Create job roles (empty array is fine for drafts)
      let createdJobRoles: JobRoleResponse[] = [];
      if (jobRoles && jobRoles.length > 0) {
        createdJobRoles = await Promise.all(
          jobRoles.map((role: JobRoleInput) =>
            tx.jobRole.create({
              data: {
                title: role.title || "",
                quantity: role.quantity ? Number(role.quantity) : 1,
                nationality: role.nationality || "",
                salary: role.salary || "",
                requirement: {
                  connect: {
                    id: requirement.id,
                  },
                },
              },
            })
          )
        );
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action:
            status === "DRAFT"
              ? AuditAction.DRAFT_CREATED
              : AuditAction.REQUIREMENT_CREATED,
          entityType: "REQUIREMENT",
          entityId: requirement.id,
          description:
            status === "DRAFT"
              ? "Draft requirement created"
              : "New requirement submitted",
          performedById: client.userId,
          newData: {
            projectLocation: requirement.projectLocation,
            status: requirement.status,
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Requirement ID is required" },
        { status: 400 }
      );
    }

    // Verify the requirement belongs to the user's client
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const existingRequirement = await prisma.requirement.findUnique({
      where: { id },
    });

    if (!existingRequirement || existingRequirement.clientId !== client.id) {
      return NextResponse.json(
        { error: "Requirement not found or not authorized" },
        { status: 404 }
      );
    }

    if (
      status &&
      status !== "DRAFT" &&
      existingRequirement.status === "DRAFT"
    ) {
      if (
        !updateData.projectLocation ||
        !updateData.startDate ||
        !updateData.contractDuration
      ) {
        return NextResponse.json(
          {
            error: "Missing required fields to submit requirement",
            details: {
              projectLocation: !updateData.projectLocation,
              startDate: !updateData.startDate,
              contractDuration: !updateData.contractDuration,
            },
          },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedRequirement = await tx.requirement.update({
        where: { id },
        data: {
          projectLocation:
            updateData.projectLocation || existingRequirement.projectLocation,
          startDate: updateData.startDate
            ? new Date(updateData.startDate)
            : existingRequirement.startDate,
          contractDuration:
            (updateData.contractDuration as ContractDuration) ||
            existingRequirement.contractDuration,
          previousExperience:
            (updateData.previousExperience as PreviousExperience) ||
            existingRequirement.previousExperience,
          totalExperienceYears:
            updateData.totalExperienceYears ||
            existingRequirement.totalExperienceYears,
          preferredAge:
            Number(updateData.preferredAge) ||
            Number(existingRequirement.preferredAge),
          specialNotes:
            updateData.specialNotes || existingRequirement.specialNotes,
          status: (status as RequirementStatus) || existingRequirement.status,
          languages: updateData.languages || existingRequirement.languages,
          ticketDetails:
            (updateData.ticketDetails as TicketDetails) ||
            existingRequirement.ticketDetails,
        },
      });

      let updatedJobRoles: JobRoleResponse[] = [];
      // Update job roles if provided
      if (updateData.jobRoles) {
        // First delete existing job roles
        await tx.jobRole.deleteMany({
          where: { requirementId: id },
        });

        // Then create new ones
        updatedJobRoles = await Promise.all(
          updateData.jobRoles.map((role: JobRoleInput) =>
            tx.jobRole.create({
              data: {
                title: role.title,
                quantity: Number(role.quantity),
                nationality: role.nationality,
                salary: role.salary,
                requirementId: id,
              },
            })
          )
        );
      } else {
        // If job roles not provided, fetch existing ones
        updatedJobRoles = await tx.jobRole.findMany({
          where: { requirementId: id },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_UPDATED,
          entityType: "REQUIREMENT",
          entityId: id,
          description: "Requirement updated",
          performedById: session.user.id,
          newData: {
            projectLocation: updatedRequirement.projectLocation,
            status: updatedRequirement.status,
          },
        },
      });

      return {
        ...updatedRequirement,
        jobRoles: updatedJobRoles,
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Requirement ID is required" },
        { status: 400 }
      );
    }

    // Verify the requirement belongs to the user's client
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const deletedRequirement = await prisma.$transaction(async (tx) => {
      // First verify the requirement belongs to the user's client
      const requirement = await tx.requirement.findUnique({
        where: { id },
      });

      if (!requirement || requirement.clientId !== client.id) {
        throw new Error("Requirement not found or not authorized");
      }

      // Delete associated job roles first
      await tx.jobRole.deleteMany({
        where: { requirementId: id },
      });

      // Then delete the requirement
      const deleted = await tx.requirement.delete({
        where: { id },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.REQUIREMENT_DELETED,
          entityType: "REQUIREMENT",
          entityId: id,
          description: "Requirement deleted",
          performedById: session.user.id,
          oldData: {
            projectLocation: deleted.projectLocation,
            status: deleted.status,
          },
        },
      });

      return deleted;
    });

    return NextResponse.json(deletedRequirement);
  } catch (error) {
    console.error("Error deleting requirement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
