import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all assignments that are accepted by admin but have wrong agency status
    const assignmentsToFix = await prisma.labourAssignment.findMany({
      where: {
        adminStatus: "ACCEPTED",
        agencyStatus: "NEEDS_REVISION",
        clientStatus: "SUBMITTED",
      },
      include: {
        labour: true,
        jobRole: true,
      },
    });

    console.log(`Found ${assignmentsToFix.length} assignments to fix`);

    // Update them to have correct agency status
    const updatedAssignments = await prisma.labourAssignment.updateMany({
      where: {
        adminStatus: "ACCEPTED",
        agencyStatus: "NEEDS_REVISION",
        clientStatus: "SUBMITTED",
      },
      data: {
        agencyStatus: "ACCEPTED",
      },
    });

    return NextResponse.json({
      message: `Fixed ${updatedAssignments.count} assignments`,
      assignmentsFixed: updatedAssignments.count,
      assignments: assignmentsToFix.map((a) => ({
        id: a.id,
        labourName: a.labour.name,
        jobRoleTitle: a.jobRole.title,
        isBackup: a.isBackup,
      })),
    });
  } catch (error) {
    console.error("Error fixing assignments:", error);
    return NextResponse.json(
      { error: "Failed to fix assignments" },
      { status: 500 }
    );
  }
}
