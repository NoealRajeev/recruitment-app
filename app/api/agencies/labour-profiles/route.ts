// app/api/agencies/labour-profiles/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AuditAction } from "@/lib/generated/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.agencyProfile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const labourProfiles = await prisma.labourProfile.findMany({
      where: {
        agencyId: user.agencyProfile.id,
      },
      include: {
        documentVerifications: {
          select: {
            id: true,
            documentType: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ labourProfiles });
  } catch (error) {
    console.error("Error fetching labour profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.agencyProfile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate stage 1 required fields
    if (
      !data.name ||
      !data.age ||
      !data.gender ||
      !data.nationality ||
      !data.jobRoleName
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, age, gender, nationality, jobRoleName",
        },
        { status: 400 }
      );
    }

    // Create basic profile
    const labourProfile = await prisma.labourProfile.create({
      data: {
        name: data.name,
        age: data.age,
        gender: data.gender,
        nationality: data.nationality,
        jobRoleName: data.jobRoleName,
        status: "RECEIVED",
        agencyId: user.agencyProfile.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: AuditAction.LABOUR_PROFILE_CREATED,
        entityType: "LABOUR_PROFILE",
        entityId: labourProfile.id,
        description: `Basic labour profile created for ${data.name}`,
        performedById: user.id,
        newData: {
          name: data.name,
          nationality: data.nationality,
          jobRoleName: data.jobRoleName,
        },
      },
    });

    return NextResponse.json(laborProfile);
  } catch (error) {
    console.error("Error creating labour profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
