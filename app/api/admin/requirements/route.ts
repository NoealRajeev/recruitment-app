// app/api/admin/requirements/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/middleware/adminCheck";
import { AuditAction, RequirementStatus } from "@/lib/generated/prisma";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    // Build the where clause with proper typing
    const where: {
      status: RequirementStatus;
      clientId?: string;
    } = {
      status: RequirementStatus.SUBMITTED,
    };

    if (clientId) {
      where.clientId = clientId;
    }

    // Fetch requirements with all necessary fields
    const requirements = await prisma.requirement.findMany({
      where,
      include: {
        jobRoles: true,
        client: {
          include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data with proper typing
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
    console.error("Error in admin requirements API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT handler remains the same
export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Requirement ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status is either APPROVED or REJECTED
    if (
      ![RequirementStatus.APPROVED, RequirementStatus.REJECTED].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
      );
    }

    // Update the requirement
    const updatedRequirement = await prisma.$transaction(async (tx) => {
      const requirement = await tx.requirement.update({
        where: { id },
        data: { status },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action:
            status === RequirementStatus.APPROVED
              ? AuditAction.REQUIREMENT_ASSIGNED
              : AuditAction.REQUIREMENT_REJECTED,
          entityType: "REQUIREMENT",
          entityId: id,
          description: `Requirement ${status.toLowerCase()}`,
          performedById: adminCheck.user.id,
          newData: {
            status,
          },
        },
      });

      return requirement;
    });

    return NextResponse.json(updatedRequirement);
  } catch (error) {
    console.error("Error updating requirement status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
