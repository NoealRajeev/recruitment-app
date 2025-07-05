// app/api/agencies/requirements/accepted/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get agency profile
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    const requirements = await prisma.requirement.findMany({
      where: {
        jobRoles: {
          some: {
            assignedAgencyId: agency.id,
          },
        },
        status: "ACCEPTED",
      },
      include: {
        jobRoles: {
          where: {
            assignedAgencyId: agency.id,
          },
          include: {
            LabourAssignment: {
              where: {
                agencyStatus: "ACCEPTED",
                labour: {
                  status: "SHORTLISTED",
                },
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
            forwardings: {
              where: { agencyId: agency.id },
              select: { quantity: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map jobRoles to include forwardedQuantity
    const requirementsWithForwardedQuantity = requirements.map((req) => ({
      ...req,
      jobRoles: req.jobRoles.map((role) => ({
        ...role,
        forwardedQuantity: role.forwardings?.[0]?.quantity ?? role.quantity,
      })),
    }));

    return NextResponse.json(requirementsWithForwardedQuantity);
  } catch (error) {
    console.error("Error fetching agency requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}
