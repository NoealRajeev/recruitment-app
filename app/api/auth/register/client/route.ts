// app/api/auth/register/client/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import { CompanySector, CompanySize } from "@/lib/generated/prisma";

const RegistrationSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  registrationNumber: z
    .string()
    .min(3, "Registration number is required")
    .regex(
      /^[a-zA-Z0-9\-]+$/,
      "Only alphanumeric characters and hyphens allowed"
    ),
  sector: z.nativeEnum(CompanySector),
  companySize: z.nativeEnum(CompanySize),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().optional(),
  fullName: z.string().min(2, "Full name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(6, "Phone number is required"),
  countryCode: z.string().min(1, "Country code is required"),
  altContact: z.string().optional().or(z.literal("")),
  altCountryCode: z.string().optional(),
});

function generateRandomPassword(length = 12): string {
  return randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, length);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = RegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors.map((e) => ({
            field: e.path[0],
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      companyName,
      registrationNumber,
      sector,
      companySize,
      website,
      address,
      city,
      country,
      postalCode,
      fullName,
      jobTitle,
      email,
      phone,
      countryCode,
      altContact,
      altCountryCode,
    } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: `${countryCode}${phone}` }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
          details:
            existingUser.email === email
              ? "Email already in use"
              : "Phone number already in use",
        },
        { status: 400 }
      );
    }

    const randomPassword = generateRandomPassword();
    const hashedPassword = await hash(randomPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          name: fullName,
          email,
          phone: `${countryCode}${phone}`,
          altContact: altContact
            ? `${altCountryCode || countryCode}${altContact}`
            : null,
          password: hashedPassword,
          role: "CLIENT_ADMIN",
          status: "PENDING_REVIEW",
          resetRequired: true,
        },
      });

      // Create Client
      const client = await tx.client.create({
        data: {
          userId: user.id,
          companyName,
          registrationNo: registrationNumber,
          companySector: sector,
          companySize,
          website: website || null,
          address,
          city,
          country,
          postalCode: postalCode || null,
          designation: jobTitle,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "CLIENT_CREATED",
          entityType: "Client",
          entityId: client.id,
          performedById: user.id,
          newData: {
            companyName,
            registrationNumber,
            email,
          },
        },
      });

      return { user, client, plainTextPassword: randomPassword };
    });

    // TODO: In production, send email with temporary password here
    console.log("Temporary password:", randomPassword);

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      clientId: result.client.id,
      email: result.user.email,
      status: result.user.status,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Registration failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
