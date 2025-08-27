// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  AccountStatus,
  AuditAction,
  CompanySector,
  CompanySize,
  DocumentCategory,
  DocumentType,
  UserRole,
  NotificationType,
  NotificationPriority,
} from "@/lib/generated/prisma";
import { NotificationDelivery } from "@/lib/notification-delivery";
import { getAccountUnderReviewEmail } from "@/lib/utils/email-templates";
import { sendTemplateEmail } from "@/lib/utils/email-service";

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

async function saveFileToDisk(file: File, userId: string): Promise<string> {
  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "client",
    userId
  );
  await fs.mkdir(uploadsDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExt = path.extname(file.name);
  const fileName = `${Date.now()}-${file.name.replace(fileExt, "")}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, buffer);
  return `/uploads/client/${userId}/${fileName}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const formFields = Object.fromEntries(formData.entries());

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

    // ===== 1) DB work in one transaction =====
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validation.data.fullName,
          email,
          phone: `${countryCode}${phone}`, // <-- fix: remove stray quotes
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

      const processDocument = async (file: File, type: DocumentType) => {
        const url = await saveFileToDisk(file, user.id);
        await tx.document.create({
          data: {
            ownerId: user.id,
            type,
            url,
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

      return { user, client, hasSupporting: otherDocuments.length > 0 };
    });

    // ===== 2) SIDE EFFECTS AFTER COMMIT (notifications, emails, etc.) =====
    try {
      const mkAdminCfg = (label: string) =>
        ({
          type: NotificationType.DOCUMENT_UPLOADED,
          title: `${label} uploaded`,
          message: `${result.user.name} uploaded ${label}.`,
          priority: NotificationPriority.NORMAL,
          actionUrl: `/dashboard/admin/review-docs?ownerId=${result.user.id}`,
          actionText: "Review",
        }) as const;

      // notify admins
      await NotificationDelivery.deliverToRole(
        "RECRUITMENT_ADMIN",
        mkAdminCfg("Company Registration"),
        result.user.id, // senderId exists now
        "User",
        result.user.id
      );
      await NotificationDelivery.deliverToRole(
        "RECRUITMENT_ADMIN",
        mkAdminCfg("License"),
        result.user.id,
        "User",
        result.user.id
      );
      if (result.hasSupporting) {
        await NotificationDelivery.deliverToRole(
          "RECRUITMENT_ADMIN",
          mkAdminCfg("Supporting Documents"),
          result.user.id,
          "User",
          result.user.id
        );
      }

      // confirmation to the new client admin
      await NotificationDelivery.deliverToUser(
        result.user.id,
        {
          type: NotificationType.DOCUMENT_UPLOADED,
          title: "Documents received",
          message:
            "Your registration documents were received and queued for review.",
          priority: NotificationPriority.NORMAL,
          actionUrl: `/dashboard/client`,
          actionText: "Go to dashboard",
        },
        result.user.id, // senderId
        "User",
        result.user.id
      );

      const tpl = getAccountUnderReviewEmail(result.user.name || "there");
      await sendTemplateEmail(tpl, result.user.email);
    } catch (notificationError) {
      // Best-effort: log but don’t fail the request
      console.error("Failed to send notifications:", notificationError);
    }

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      clientId: result.client.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
