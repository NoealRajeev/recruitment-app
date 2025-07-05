// app/api/clients/requirements/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { RequirementStatus } from "@/lib/generated/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true, companyName: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found" },
        { status: 404 }
      );
    }

    // Get requirements with job roles and assignments
    const requirements = await prisma.requirement.findMany({
      where: {
        clientId: client.id,
        status: {
          in: [
            RequirementStatus.CLIENT_REVIEW,
            RequirementStatus.UNDER_REVIEW,
            RequirementStatus.PARTIALLY_SUBMITTED,
          ],
        },
      },
      include: {
        jobRoles: {
          include: {
            LabourAssignment: {
              where: {
                adminStatus: "ACCEPTED",
                agencyStatus: "ACCEPTED",
                OR: [
                  { clientStatus: "SUBMITTED" },
                  { clientStatus: "PENDING" },
                ],
                isBackup: false,
              },
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

    // Debug logging
    console.log("Client requirements query result:", {
      clientId: client.id,
      requirementsCount: requirements.length,
      requirements: requirements.map((req) => ({
        id: req.id,
        status: req.status,
        jobRolesCount: req.jobRoles.length,
        jobRoles: req.jobRoles.map((jr) => ({
          id: jr.id,
          title: jr.title,
          assignmentsCount: jr.LabourAssignment.length,
          assignments: jr.LabourAssignment.map((a) => ({
            id: a.id,
            adminStatus: a.adminStatus,
            clientStatus: a.clientStatus,
            isBackup: a.isBackup,
            labourName: a.labour.name,
          })),
        })),
      })),
    });

    // Format the response to include company name and count of pending assignments
    const formattedRequirements = requirements.map((req) => ({
      ...req,
      companyName: client.companyName,
      pendingAssignmentsCount: req.jobRoles.reduce(
        (count, jobRole) => count + jobRole.LabourAssignment.length,
        0
      ),
    }));

    return NextResponse.json(formattedRequirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}
