// app/api/admin/requirements/accepted/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requirements = await prisma.requirement.findMany({
      where: {
        status: "ACCEPTED",
      },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },
        jobRoles: {
          include: {
            LabourAssignment: {
              where: {
                clientStatus: "ACCEPTED",
              },
              include: {
                labour: {
                  include: {
                    stages: {
                      orderBy: {
                        createdAt: "asc",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error("Error fetching accepted requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch accepted requirements" },
      { status: 500 }
    );
  }
}
