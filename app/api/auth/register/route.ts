import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import {
  AccountStatus,
  AuditAction,
  CompanySector,
  CompanySize,
  DocumentCategory,
  DocumentType,
  UserRole,
} from "@/lib/generated/prisma";
import { uploadFile } from "@/lib/s3";
import { env } from "@/lib/env.server";

const RegistrationSchema = z.object({
  companyName: z.string().min(2),
  registrationNumber: z.string().min(3),
  sector: z.nativeEnum(CompanySector),
  companySize: z.nativeEnum(CompanySize),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  postcode: z.string().optional(),
  fullName: z.string().min(2),
  jobTitle: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  countryCode: z.string().min(1),
  altContact: z.string().optional().or(z.literal("")),
  altCountryCode: z.string().optional(),
});

function generateRandomPassword(length = 12): string {
  return randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, length);
}

async function processS3Upload(file: File, userId: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  const key = await uploadFile(
    new File([buffer], fileName, { type: file.type }),
    env.S3_UPLOAD_PREFIX,
    userId
  );

  return key;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Convert FormData to object
    const formFields = Object.fromEntries(formData.entries());

    // Validate form data (excluding files)
    const validation = RegistrationSchema.safeParse({
      ...formFields,
      sector: formFields.sector as CompanySector,
      companySize: formFields.companySize as CompanySize,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, phone, countryCode } = validation.data;

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: `${countryCode}${phone}` }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Process files
    const crFile = formData.get("crFile") as File | null;
    const licenseFile = formData.get("licenseFile") as File | null;
    const otherDocuments = formData.getAll("otherDocuments") as File[];

    if (!crFile || !licenseFile) {
      return NextResponse.json(
        { error: "Missing required documents" },
        { status: 400 }
      );
    }

    const randomPassword = generateRandomPassword();
    const hashedPassword = await hash(randomPassword, 12);

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          name: validation.data.fullName,
          email,
          phone: `${countryCode}${phone}`,
          altContact: validation.data.altContact
            ? `${validation.data.altCountryCode || countryCode}${validation.data.altContact}`
            : null,
          password: hashedPassword,
          tempPassword: randomPassword,
          role: UserRole.CLIENT_ADMIN,
          status: AccountStatus.NOT_VERIFIED,
          resetRequired: true,
        },
      });

      // Create Client
      const client = await tx.client.create({
        data: {
          userId: user.id,
          companyName: validation.data.companyName,
          registrationNo: validation.data.registrationNumber,
          companySector: validation.data.sector,
          companySize: validation.data.companySize,
          website: validation.data.website || null,
          address: validation.data.address,
          city: validation.data.city,
          country: validation.data.country,
          postalCode: validation.data.postcode || null,
          designation: validation.data.jobTitle,
        },
      });

      // Process documents
      const processDocument = async (file: File, type: DocumentType) => {
        const key = await processS3Upload(file, user.id);

        await tx.document.create({
          data: {
            ownerId: user.id,
            type,
            url: key,
            status: AccountStatus.NOT_VERIFIED,
            category:
              type === DocumentType.OTHER
                ? DocumentCategory.SUPPORTING
                : DocumentCategory.IMPORTANT,
          },
        });
      };

      await processDocument(crFile, DocumentType.COMPANY_REGISTRATION);
      await processDocument(licenseFile, DocumentType.LICENSE);

      for (const doc of otherDocuments) {
        await processDocument(doc, DocumentType.OTHER);
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.CLIENT_CREATE,
          entityType: "Client",
          entityId: client.id,
          performedById: user.id,
          newData: {
            companyName: validation.data.companyName,
            registrationNumber: validation.data.registrationNumber,
            email,
          },
        },
      });

      return { user, client };
    });

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      clientId: result.client.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
