import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all requirements with detailed information (for debugging)
    const requirements = await prisma.requirement.findMany({
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        jobRoles: {
          include: {
            LabourAssignment: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    const debugInfo = requirements.map((req) => ({
      id: req.id,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      client: {
        id: req.client.id,
        companyName: req.client.companyName,
        userId: req.client.user.id,
        userEmail: req.client.user.email,
        userRole: req.client.user.role,
      },
      jobRoles: req.jobRoles.map((jr) => ({
        id: jr.id,
        title: jr.title,
        quantity: jr.quantity,
        agencyStatus: jr.agencyStatus,
        adminStatus: jr.adminStatus,
        needsMoreLabour: jr.needsMoreLabour,
        assignments: jr.LabourAssignment.map((a) => ({
          id: a.id,
          labourId: a.labourId,
          labourName: a.labour.name,
          agencyStatus: a.agencyStatus,
          adminStatus: a.adminStatus,
          clientStatus: a.clientStatus,
          isBackup: a.isBackup,
          createdAt: a.createdAt,
          agencyName: a.agency.agencyName,
        })),
        acceptedCount: jr.LabourAssignment.filter(
          (a) => a.adminStatus === "ACCEPTED" && !a.isBackup
        ).length,
        totalAccepted: jr.LabourAssignment.filter(
          (a) => a.adminStatus === "ACCEPTED"
        ).length,
        submittedToClient: jr.LabourAssignment.filter(
          (a) => a.clientStatus === "SUBMITTED"
        ).length,
        pendingForClient: jr.LabourAssignment.filter(
          (a) => a.clientStatus === "PENDING"
        ).length,
      })),
    }));

    return NextResponse.json({
      currentUser: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      totalRequirements: requirements.length,
      requirements: debugInfo,
    });
  } catch (error) {
    console.error("Error fetching debug info:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug info" },
      { status: 500 }
    );
  }
}
