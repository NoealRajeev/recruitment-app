// app/api/agencies/documents/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { AccountStatus } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    // Get the agency associated with this user
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Process each document (in a real app, you would upload to storage like S3)
    const licenseFile = formData.get("license") as File | null;
    const insuranceFile = formData.get("insurance") as File | null;
    const idProofFile = formData.get("idProof") as File | null;
    const addressProofFile = formData.get("addressProof") as File | null;

    // Create document records (simplified example)
    await prisma.$transaction(async (tx) => {
      if (licenseFile) {
        await tx.agencyDocument.create({
          data: {
            agencyId: agency.id,
            type: "LICENSE",
            url: `uploads/${licenseFile.name}`, // Replace with actual storage URL
            verified: false,
          },
        });
      }

      if (insuranceFile) {
        await tx.agencyDocument.create({
          data: {
            agencyId: agency.id,
            type: "INSURANCE",
            url: `uploads/${insuranceFile.name}`, // Replace with actual storage URL
            verified: false,
          },
        });
      }

      if (idProofFile) {
        await tx.agencyDocument.create({
          data: {
            agencyId: agency.id,
            type: "ID_PROOF",
            url: `uploads/${idProofFile.name}`, // Replace with actual storage URL
            verified: false,
          },
        });
      }

      if (addressProofFile) {
        await tx.agencyDocument.create({
          data: {
            agencyId: agency.id,
            type: "ADDRESS_PROOF",
            url: `uploads/${addressProofFile.name}`, // Replace with actual storage URL
            verified: false,
          },
        });
      }

      // Update user status to pending review
      await tx.user.update({
        where: { id: session.user.id },
        data: { status: AccountStatus.PENDING_REVIEW },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting documents:", error);
    return NextResponse.json(
      { error: "Failed to submit documents" },
      { status: 500 }
    );
  }
}
