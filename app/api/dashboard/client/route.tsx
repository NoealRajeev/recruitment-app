// app/api/dashboard/client/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "CLIENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get client ID
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

    // Get stats for client dashboard (unchanged)
    const openRequirements = await prisma.requirement.count({
      where: {
        clientId: client.id,
        status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
      },
    });

    const filledPositions = await prisma.labourAssignment.count({
      where: {
        jobRole: {
          requirement: {
            clientId: client.id,
          },
        },
      },
    });

    const totalPositions = await prisma.jobRole.aggregate({
      where: {
        requirement: { clientId: client.id },
      },
      _sum: { quantity: true },
    });

    const activeWorkers = await prisma.labourProfile.count({
      where: {
        requirement: { clientId: client.id },
        status: "DEPLOYED",
      },
    });

    const upcomingRenewals = await prisma.requirement.count({
      where: {
        clientId: client.id,
        jobRoles: {
          some: {
            contractDuration: {
              in: ["ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS"],
            },
          },
        },
      },
    });

    const recentRequirements = await prisma.requirement.findMany({
      where: { clientId: client.id },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        jobRoles: {
          select: {
            id: true,
            title: true,
            quantity: true,
            LabourAssignment: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Format requirements data to show all job roles
    const formattedRequirements = recentRequirements.map((req) => ({
      id: req.id,
      jobRoles: req.jobRoles.map((role) => ({
        id: role.id,
        title: role.title,
        quantity: role.quantity,
        filled: role.LabourAssignment.length,
        progress: Math.round(
          (role.LabourAssignment.length / role.quantity) * 100
        ),
      })),
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    }));

    // Get recent activity (unchanged)
    const recentActivity = await prisma.auditLog.findMany({
      where: {
        OR: [
          {
            entityType: "Requirement",
            entityId: { in: recentRequirements.map((r) => r.id) },
          },
          { performedById: session.user.id },
        ],
      },
      take: 10,
      orderBy: { performedAt: "desc" },
      select: {
        id: true,
        action: true,
        description: true,
        performedAt: true,
        performedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        openRequirements,
        filledPositions,
        totalPositions: totalPositions._sum.quantity || 0,
        activeWorkers,
        upcomingRenewals,
        lastMonth: 0,
      },
      recentRequirements: formattedRequirements,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching client dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
