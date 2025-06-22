import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { RequirementStatus } from "@/lib/generated/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found" },
        { status: 404 }
      );
    }

    // Get requirements with job roles and assignments
    const requirements = await prisma.requirement.findMany({
      where: { clientId: client.id, status: RequirementStatus.CLIENT_REVIEW },
      include: {
        jobRoles: {
          include: {
            LabourAssignment: {
              where: {
                agencyStatus: "SUBMITTED",
                adminStatus: "ACCEPTED",
                clientStatus: "SUBMITTED",
              },
              include: {
                labour: true,
                agency: {
                  select: {
                    agencyName: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}
