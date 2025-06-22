// app/api/dashboard/agency/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  LabourProfileStatus,
  DocumentVerificationStatus,
} from "@/lib/generated/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get agency ID
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

    // Get counts for stats overview
    const totalProfiles = await prisma.labourProfile.count({
      where: { agencyId: agency.id },
    });
    const pendingVerification = await prisma.labourProfile.count({
      where: {
        agencyId: agency.id,
        verificationStatus: DocumentVerificationStatus.PENDING,
      },
    });
    const approvedProfiles = await prisma.labourProfile.count({
      where: {
        agencyId: agency.id,
        status: LabourProfileStatus.APPROVED,
      },
    });
    const deployedProfiles = await prisma.labourProfile.count({
      where: {
        agencyId: agency.id,
        status: LabourProfileStatus.DEPLOYED,
      },
    });

    // Get recent labour profiles
    const recentProfiles = await prisma.labourProfile.findMany({
      where: { agencyId: agency.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        nationality: true,
        status: true,
        verificationStatus: true,
        createdAt: true,
        Document: {
          select: {
            type: true,
            status: true,
          },
          take: 1,
        },
      },
    });

    // Get recent activity from audit logs
    const recentActivity = await prisma.auditLog.findMany({
      where: {
        OR: [
          { entityType: "LabourProfile", performedById: session.user.id },
          { entityType: "Requirement", performedById: session.user.id },
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
        totalProfiles,
        pendingVerification,
        approvedProfiles,
        deployedProfiles,
      },
      recentProfiles,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching agency dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
