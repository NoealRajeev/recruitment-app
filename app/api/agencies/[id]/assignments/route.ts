// app/api/admin/agencies/[id]/assignments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { RequirementStatus } from "@/lib/generated/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  // pull the id out of the promised params
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobRoles = await prisma.jobRole.findMany({
      where: {
        assignedAgencyId: id,
        agencyStatus: {
          in: ["SUBMITTED", "PARTIALLY_SUBMITTED", "ACCEPTED"],
        },
        requirement: {
          status: {
            not: RequirementStatus.ACCEPTED,
          },
        },
      },
      include: {
        requirement: {
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        LabourAssignment: {
          include: {
            labour: true,
          },
        },
      },
    });

    // Add needsMoreLabour to each jobRole if not already present
    const jobRolesWithNeedsMore = jobRoles.map((role) => ({
      ...role,
      needsMoreLabour: role.needsMoreLabour ?? false,
    }));

    return NextResponse.json(jobRolesWithNeedsMore);
  } catch (error) {
    console.error("Error fetching agency assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency assignments" },
      { status: 500 }
    );
  }
}
