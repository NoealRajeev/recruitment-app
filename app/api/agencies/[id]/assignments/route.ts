// app/api/admin/agencies/[id]/assignments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const jobRoles = await prisma.jobRole.findMany({
      where: {
        assignedAgencyId: id,
        agencyStatus: {
          in: ["SUBMITTED", "PARTIALLY_SUBMITTED", "ACCEPTED"],
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

    return NextResponse.json(jobRoles);
  } catch (error) {
    console.error("Error fetching agency assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency assignments" },
      { status: 500 }
    );
  }
}
