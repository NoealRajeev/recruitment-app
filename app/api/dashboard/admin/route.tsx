import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AccountStatus, RequirementStatus } from "@/lib/generated/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get counts for stats overview
    const totalRequests = await prisma.requirement.count();
    const pendingReviews = await prisma.requirement.count({
      where: { status: RequirementStatus.UNDER_REVIEW },
    });
    const clientsRegistered = await prisma.client.count();
    const agenciesActive = await prisma.agency.count({
      where: {
        user: {
          status: AccountStatus.VERIFIED,
        },
      },
    });

    // Get recent requirements for project summary
    const recentRequirements = await prisma.requirement.findMany({
      take: 9,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        jobRoles: true,
      },
    });

    // Get recent activity from audit logs
    const recentActivity = await prisma.auditLog.findMany({
      take: 19,
      orderBy: { performedAt: "desc" },
      include: {
        performedBy: true,
      },
    });

    return NextResponse.json({
      stats: {
        totalRequests,
        pendingReviews,
        clientsRegistered,
        agenciesActive,
      },
      recentRequirements,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
