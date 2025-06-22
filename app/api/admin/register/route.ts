// app/api/admin/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { UserRole, AuditAction, AccountStatus } from "@/lib/generated/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getAdminOnboardingEmail } from "@/lib/utils/email-templates";
import { sendTemplateEmail } from "@/lib/utils/email-service";

function generateRandomPassword(length = 12): string {
  return randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, length);
}

async function saveProfilePicture(file: File, userId: string): Promise<string> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "admin",
    userId
  );
  await fs.mkdir(uploadsDir, { recursive: true });

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const fileExt = path.extname(file.name);
  const fileName = `profile-${Date.now()}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);

  // Save file
  await fs.writeFile(filePath, buffer);

  // Return relative path for database storage
  return `/uploads/admin/${userId}/${fileName}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Extract form data
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const department = formData.get("department") as string;
    const profilePicture = formData.get("profilePicture") as File | null;

    // Basic validation
    if (!name || !email || !phone || !department) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
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

    // Create user and admin profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          tempPassword: randomPassword,
          role: UserRole.RECRUITMENT_ADMIN,
          status: AccountStatus.VERIFIED,
          resetRequired: true,
          createdById: session.user.id,
        },
      });

      // Save profile picture if provided
      let profilePictureUrl = null;
      if (profilePicture && profilePicture.size > 0) {
        profilePictureUrl = await saveProfilePicture(profilePicture, user.id);
        await tx.user.update({
          where: { id: user.id },
          data: { profilePicture: profilePictureUrl },
        });
      }

      // Create Admin profile
      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          name,
          department,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.USER_CREATE,
          entityType: "User",
          entityId: user.id,
          performedById: session.user.id,
          newData: {
            name,
            email,
            role: UserRole.RECRUITMENT_ADMIN,
          },
        },
      });

      return { user, admin, profilePictureUrl };
    });

    // Send onboarding email
    try {
      const emailTemplate = getAdminOnboardingEmail(
        name,
        email,
        randomPassword
      );
      await sendTemplateEmail(emailTemplate, email);
    } catch (emailError) {
      console.error("Failed to send onboarding email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        userId: result.user.id,
        adminId: result.admin.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin account:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
