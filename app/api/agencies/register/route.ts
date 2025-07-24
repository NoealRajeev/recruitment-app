// app/api/agencies/register/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { z, ZodError } from "zod";
import { AgencyRegistrationSchema } from "@/lib/validations/agency";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { UserRole, AccountStatus, AuditAction } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { UnauthorizedError } from "@/lib/errors";
import { faker } from "@faker-js/faker";
import { getAgencyCreationEmail } from "@/lib/utils/email-templates";
import { sendTemplateEmail } from "@/lib/utils/email-service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  // — App-Router requires even static routes to accept a `params` arg.
  //   We simply await it (always `{}`) to satisfy the signature.
  await context.params;

  // 1) Parse & validate body
  let data: z.infer<typeof AgencyRegistrationSchema>;
  try {
    const body = await request.json();
    data = AgencyRegistrationSchema.parse(body);
  } catch (err) {
    const issues = err instanceof ZodError ? err.issues : undefined;
    return NextResponse.json(
      { error: "Invalid request payload", issues },
      { status: 400 }
    );
  }

  // 2) Authenticate & authorize
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const adminId = session.user.id;

  // 3) Ensure unique email
  const conflict = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "Email already in use", code: "EMAIL_EXISTS" },
      { status: 409 }
    );
  }

  // 4) Generate credentials
  const tempPassword = randomBytes(12).toString("hex");
  const hashedPassword = await hash(tempPassword, 12);

  // 5) Create user → agency → auditLog in one transaction
  let created: {
    agency: Awaited<ReturnType<typeof prisma.agency.create>>;
    user: { id: string; name: string };
  };
  try {
    created = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.agencyName,
          email: data.email,
          password: hashedPassword,
          tempPassword,
          phone: data.phone,
          profilePicture: faker.image.avatar(),
          role: UserRole.RECRUITMENT_AGENCY,
          status: AccountStatus.NOT_VERIFIED,
          resetRequired: true,
          createdById: adminId,
        },
        select: { id: true, name: true },
      });

      const agency = await tx.agency.create({
        data: {
          userId: newUser.id,
          agencyName: data.agencyName,
          registrationNo: data.registrationNo,
          licenseNumber: data.licenseNumber,
          licenseExpiry: new Date(data.licenseExpiry),
          country: data.country,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.AGENCY_CREATE,
          entityType: "AGENCY",
          entityId: agency.id,
          performedById: adminId,
          description: `Agency ${data.agencyName} registered by admin`,
          newData: {
            agencyName: data.agencyName,
            email: data.email,
            status: "NOT_VERIFIED",
          },
        },
      });

      return { agency, user: newUser };
    });
  } catch (dbErr) {
    console.error("Transaction failed", dbErr);
    return NextResponse.json(
      { error: "Database error during creation" },
      { status: 500 }
    );
  }

  // 6) Send verification email (best‐effort)
  try {
    const link =
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-account?email=` +
      encodeURIComponent(data.email);
    const emailTemplate = getAgencyCreationEmail(
      data.agencyName,
      data.email,
      session.user.name || "Findly Admin",
      link
    );
    await sendTemplateEmail(emailTemplate, data.email);
  } catch (mailErr) {
    console.error("Failed sending agency creation email:", mailErr);
  }

  // 7) Return newly created agency & user
  return NextResponse.json(created, { status: 201 });
}
