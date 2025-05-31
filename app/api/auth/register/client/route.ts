// app/api/auth/register/client/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import { CompanySector, CompanySize } from "@/types";

const RegistrationSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  registrationNumber: z
    .string()
    .min(3, "Registration number is required")
    .regex(
      /^[a-zA-Z0-9\-]+$/,
      "Only alphanumeric characters and hyphens allowed"
    ),
  sector: z.string().transform((val) => val as CompanySector),
  companySize: z.string().transform((val) => val as CompanySize),
  address: z.string().min(5, "Address is required"),
  website: z.string().url().optional().or(z.literal("")),
  fullName: z.string().min(2, "Full name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(6, "Phone number is required"),
  altContact: z.string().optional().or(z.literal("")),
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
      console.log("Validation errors:", validation.error); // Log full error
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors.map((e) => ({
            field: e.path[0],
            message: e.message,
            code: e.code,
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
      address,
      website,
      fullName,
      jobTitle,
      email,
      phone,
      altContact,
    } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const randomPassword = generateRandomPassword();
    const hashedPassword = await hash(randomPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: fullName,
          email,
          password: hashedPassword,
          role: "CLIENT_ADMIN",
          status: "PENDING_REVIEW",
          resetRequired: true,
        },
      });

      const client = await tx.client.create({
        data: {
          userId: user.id,
          companyName,
          registrationNo: registrationNumber,
          companySector: sector,
          companySize,
          address,
          website: website || null,
          designation: jobTitle,
          phone,
          altContact: altContact || null,
        },
      });

      return { user, client, plainTextPassword: randomPassword };
    });

    // In production, send email here instead of logging
    console.log("Temporary password:", randomPassword);

    return NextResponse.json({
      success: true,
      clientId: result.client.id,
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
