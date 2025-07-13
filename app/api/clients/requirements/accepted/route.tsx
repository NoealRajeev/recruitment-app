// app/api/clients/requirements/accepted/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CLIENT_ADMIN") {
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

    const requirements = await prisma.requirement.findMany({
      where: {
        clientId: client.id,
        status: "ACCEPTED",
      },
      include: {
        jobRoles: {
          include: {
            LabourAssignment: {
              where: {
                clientStatus: "ACCEPTED",
              },
              select: {
                id: true,
                agencyStatus: true,
                adminStatus: true,
                clientStatus: true,
                adminFeedback: true,
                clientFeedback: true,
                signedOfferLetterUrl: true,
                visaUrl: true,
                travelDate: true,
                flightTicketUrl: true,
                medicalCertificateUrl: true,
                policeClearanceUrl: true,
                employmentContractUrl: true,
                additionalDocumentsUrls: true,
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error("Error fetching client requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}
