// app/api/agencies/labour-profiles/import/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  AuditAction,
  LabourProfileStatus,
  DocumentVerificationStatus,
} from "@/lib/generated/prisma";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.agencyProfile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profiles } = await request.json();

    if (!Array.isArray(profiles)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Process and validate each profile
    const validProfiles = profiles
      .filter((p) => p["Full Name"] && p["Nationality"] && p["Age"])
      .map((p) => ({
        name: p["Full Name"],
        age: Number(p["Age"]),
        gender: p["Gender"] || "MALE",
        nationality: p["Nationality"],
        email: p["Email"] || null,
        phone: p["Phone"] || null,
        passportNumber: p["Passport Number"] || null,
        passportExpiry: p["Passport Expiry"]
          ? new Date(p["Passport Expiry"])
          : null,
        visaType: p["Visa Type"] || null,
        visaExpiry: p["Visa Expiry"] ? new Date(p["Visa Expiry"]) : null,
        status: (p["Status"] as LabourProfileStatus) || "RECEIVED",
        verificationStatus: DocumentVerificationStatus.PENDING,
        documentsSubmittedAt: new Date(),
        agencyId: user.agencyProfile?.id as string,
      }));

    if (validProfiles.length === 0) {
      return NextResponse.json(
        { error: "No valid profiles found" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create all profiles
      const creationResult = await tx.labourProfile.createMany({
        data: validProfiles,
      });

      // Create audit log for the import
      await tx.auditLog.create({
        data: {
          action: AuditAction.LABOUR_PROFILE_IMPORT,
          entityType: "LABOUR_PROFILE",
          description: `Imported ${creationResult.count} labour profiles`,
          performedById: user.id,
          newData: {
            count: creationResult.count,
            sample: validProfiles.slice(0, 3).map((p) => p.name),
          },
        },
      });

      // Get total count
      const totalCount = await tx.labourProfile.count({
        where: { agencyId: user.agencyProfile?.id },
      });

      return {
        count: creationResult.count,
        total: totalCount,
      };
    });

    return NextResponse.json({
      count: result.count,
      profiles: validProfiles.slice(0, 5), // Return first 5 as sample
      total: result.total,
    });
  } catch (error) {
    console.error("Error importing labour profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
