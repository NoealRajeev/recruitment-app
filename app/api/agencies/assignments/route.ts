// app/api/agencies/assignments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { RequirementStatus } from "@/lib/generated/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agencies = await prisma.agency.findMany({
      where: {
        user: {
          status: "VERIFIED",
        },
      },
      include: {
        user: {
          select: {
            status: true,
          },
        },
        JobRole: {
          where: {
            agencyStatus: {
              in: [
                "SUBMITTED",
                "PARTIALLY_SUBMITTED",
                "ACCEPTED",
              ] as RequirementStatus[],
            },
            requirement: {
              status: {
                not: RequirementStatus.ACCEPTED,
              },
            },
            LabourAssignment: {
              some: {
                adminStatus: {
                  not: RequirementStatus.ACCEPTED, // Use RequirementStatus enum
                },
                agencyStatus: {
                  not: RequirementStatus.ACCEPTED, // Use RequirementStatus enum
                },
              },
            },
          },
        },
      },
    });

    const agenciesWithCounts = agencies.map((agency) => ({
      id: agency.id,
      agencyName: agency.agencyName,
      user: {
        status: agency.user.status,
      },
      createdAt: agency.createdAt,
      pendingAssignmentsCount: agency.JobRole.length, // Count the filtered JobRoles
    }));

    return NextResponse.json(agenciesWithCounts);
  } catch (error) {
    console.error("Error fetching agencies with assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch agencies with assignments" },
      { status: 500 }
    );
  }
}
