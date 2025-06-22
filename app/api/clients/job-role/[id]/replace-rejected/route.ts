// app/api/clients/job-role/[id]/replace-rejected/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the job role
    const jobRole = await prisma.jobRole.findUnique({
      where: {
        id: params.id,
        requirement: {
          clientId: client.id,
        },
      },
      include: {
        LabourAssignment: {
          where: {
            adminStatus: "ACCEPTED",
            clientStatus: { in: ["PENDING", "SUBMITTED"] },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        requirement: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!jobRole) {
      return NextResponse.json(
        { error: "Job role not found" },
        { status: 404 }
      );
    }

    // Count current accepted assignments
    const acceptedCount = jobRole.LabourAssignment.filter(
      (a) => a.clientStatus === "ACCEPTED"
    ).length;

    // If we're below the required quantity, try to replace with backups
    if (acceptedCount < jobRole.quantity) {
      // Find the oldest backup candidate
      const backupCandidate = jobRole.LabourAssignment.find(
        (a) => a.clientStatus === "PENDING" && a.isBackup
      );

      if (backupCandidate) {
        // Promote the backup candidate
        await prisma.labourAssignment.update({
          where: { id: backupCandidate.id },
          data: {
            clientStatus: "SUBMITTED",
            isBackup: false,
          },
        });

        return NextResponse.json({
          message: "Backup candidate promoted successfully",
          candidateId: backupCandidate.id,
        });
      }
    }

    return NextResponse.json({
      message: "No replacement needed or no backups available",
    });
  } catch (error) {
    console.error("Error replacing rejected candidate:", error);
    return NextResponse.json(
      { error: "Failed to replace rejected candidate" },
      { status: 500 }
    );
  }
}
