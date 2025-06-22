// app/api/agencies/assignments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

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
        _count: {
          select: {
            JobRole: {
              where: {
                agencyStatus: {
                  in: ["SUBMITTED", "PARTIALLY_SUBMITTED", "ACCEPTED"],
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
      pendingAssignmentsCount: agency._count.JobRole,
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
