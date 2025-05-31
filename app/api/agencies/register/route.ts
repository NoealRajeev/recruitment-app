// app/api/agencies/register/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { UserRole, AccountStatus } from "@prisma/client";

// Helper to generate random password
function generateRandomPassword(length = 12): string {
  return randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, length);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Only allow admins to register agencies
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.agencyName || !body.email || !body.contactPerson || !body.phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Generate random password
    const randomPassword = generateRandomPassword();
    const hashedPassword = await hash(randomPassword, 12);
    console.log(randomPassword);

    // Create user and agency in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: body.contactPerson,
          email: body.email,
          password: hashedPassword,
          role: UserRole.RECRUITMENT_AGENCY,
          status: AccountStatus.NOT_VERIFIED,
          resetRequired: true,
        },
      });

      const agency = await tx.agency.create({
        data: {
          userId: user.id,
          agencyName: body.agencyName,
          registrationNo: body.registrationNo,
          licenseNumber: body.licenseNumber,
          licenseExpiry: new Date(body.licenseExpiry),
          country: body.country,
          contactPerson: body.contactPerson,
          phone: body.phone,
          email: body.email,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "USER_CREATED",
          entityType: "AGENCY",
          entityId: agency.id,
          performedById: session.user.id,
          description: `Agency ${body.agencyName} registered by admin`,
          newData: {
            agencyName: body.agencyName,
            email: body.email,
            status: "NOT_VERIFIED",
          },
        },
      });

      return { ...agency, user };
    });

    // TODO: Send welcome email with temporary password
    // This should include randomPassword for the initial login

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error registering agency:", error);
    return NextResponse.json(
      { error: "Failed to register agency" },
      { status: 500 }
    );
  }
}
