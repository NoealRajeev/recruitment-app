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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get client associated with current user
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
      clientId,
      languages,
      jobRoles,
      ticketDetails,
    } = body;

    // Validate required fields
    if (!projectLocation || !startDate || !contractDuration || !clientId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In your POST handler in route.ts
    if (!projectLocation || !startDate || !contractDuration || !clientId) {
      console.log("Missing fields:", {
        projectLocation: !!projectLocation,
        startDate: !!startDate,
        contractDuration: !!contractDuration,
        clientId: !!clientId,
      });
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            projectLocation: !projectLocation,
            startDate: !startDate,
            contractDuration: !contractDuration,
            clientId: !clientId,
          },
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the requirement
      const requirement = await tx.requirement.create({
        data: {
          projectLocation,
          startDate: new Date(startDate),
          contractDuration: contractDuration as ContractDuration,
          previousExperience: previousExperience as PreviousExperience,
          totalExperienceYears,
          preferredAge,
          specialNotes,
          status: (status as RequirementStatus) || "SUBMITTED",
          clientId,
          languages,
          ticketDetails: (ticketDetails as TicketDetails) || null,
        },
      });

      // Create job roles
      if (jobRoles && jobRoles.length > 0) {
        await Promise.all(
          jobRoles.map((role: JobRoleInput) =>
            tx.jobRole.create({
              data: {
                title: role.title,
                quantity: role.quantity,
                nationality: role.nationality,
                salary: role.salary,
                requirementId: requirement.id,
              },
            })
          )
        );
      }

      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { userId: true },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.COMPANY_VERIFIED,
          entityType: "REQUIREMENT",
          entityId: requirement.id,
          description: "New requirement submitted",
          performedById: client.userId,
          newData: {
            projectLocation: requirement.projectLocation,
            status: requirement.status,
          },
        },
      });

      return requirement;
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
    const { id, ...updateData } = body;

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

    const result = await prisma.$transaction(async (tx) => {
      // Update the requirement
      const updatedRequirement = await tx.requirement.update({
        where: { id },
        data: {
          projectLocation: updateData.projectLocation,
          startDate: updateData.startDate
            ? new Date(updateData.startDate)
            : undefined,
          contractDuration: updateData.contractDuration as ContractDuration,
          previousExperience:
            updateData.previousExperience as PreviousExperience,
          totalExperienceYears: updateData.totalExperienceYears,
          preferredAge: updateData.preferredAge,
          specialNotes: updateData.specialNotes,
          status: updateData.status as RequirementStatus,
          languages: updateData.languages,
          ticketDetails: updateData.ticketDetails as TicketDetails,
        },
      });

      // Update job roles if provided
      if (updateData.jobRoles) {
        // First delete existing job roles
        await tx.jobRole.deleteMany({
          where: { requirementId: id },
        });

        // Then create new ones
        await Promise.all(
          updateData.jobRoles.map((role: JobRoleInput) =>
            tx.jobRole.create({
              data: {
                title: role.title,
                quantity: role.quantity,
                nationality: role.nationality,
                salary: role.salary,
                requirementId: id,
              },
            })
          )
        );
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.COMPANY_UPDATED,
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

      return updatedRequirement;
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
          action: AuditAction.COMPANY_UPDATED,
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
