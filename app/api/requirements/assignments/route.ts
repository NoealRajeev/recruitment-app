import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { RequirementStatus } from "@/lib/generated/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as RequirementStatus | null;

    // Get agency ID from user
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

    // Get all job roles assigned to this agency
    const assignments = await prisma.jobRole.findMany({
      where: {
        assignedAgencyId: agency.id,
        ...(status ? { agencyStatus: status } : {}),
      },
      include: {
        requirement: {
          select: {
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        forwardings: {
          where: { agencyId: agency.id },
          select: { quantity: true },
        },
      },
      orderBy: {
        requirement: {
          createdAt: "desc",
        },
      },
    });

    // Add forwardedQuantity and needsMoreLabour to each assignment
    const assignmentsWithForwarded = assignments.map((assignment) => ({
      ...assignment,
      forwardedQuantity:
        assignment.forwardings?.[0]?.quantity ?? assignment.quantity,
      needsMoreLabour: assignment.needsMoreLabour ?? false,
    }));

    return NextResponse.json({ assignments: assignmentsWithForwarded });
  } catch (error) {
    console.error("Error fetching agency assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
