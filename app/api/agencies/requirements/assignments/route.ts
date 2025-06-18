// app/api/agencies/requirements/assignments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.agencyProfile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await prisma.requirementAssignment.findMany({
      where: {
        agencyId: user.agencyProfile.id,
      },
      select: {
        id: true,
        quantity: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        jobRole: {
          select: {
            id: true,
            title: true,
            nationality: true,
            salary: true,
            salaryCurrency: true,
            startDate: true,
            contractDuration: true,
          },
        },
        requirement: {
          select: {
            id: true,
            languages: true,
            minExperience: true,
            maxAge: true,
            ticketType: true,
            ticketProvided: true,
          },
        },
      },
      orderBy: [
        {
          status: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    const sortedAssignments = assignments.sort((a, b) => {
      if (a.status === "APPROVED" && b.status !== "APPROVED") return -1;
      if (a.status !== "APPROVED" && b.status === "APPROVED") return 1;
      return 0;
    });

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const filteredAssignments = sortedAssignments.filter((agency) => {
      if (agency.status === "REJECTED") {
        return agency.updatedAt > oneHourAgo;
      }
      return true;
    });

    return NextResponse.json({ assignments: filteredAssignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
