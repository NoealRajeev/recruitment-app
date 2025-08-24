import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";

function toEnum<T extends string>(
  val: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  if (typeof val === "string") {
    const up = val.toUpperCase().replace(/\s+/g, "_");
    if ((allowed as readonly string[]).includes(up)) return up as T;
  }
  return fallback;
}

const COMPANY_SECTORS = [
  "IT",
  "REAL_ESTATE",
  "HEALTHCARE",
  "FINANCE",
  "MANUFACTURING",
  "RETAIL",
  "CONSTRUCTION",
  "EDUCATION",
  "HOSPITALITY",
  "OIL_GAS",
  "TRANSPORTATION",
  "OTHER",
] as const;

const COMPANY_SIZES = ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"] as const;

const DEPARTMENTS = [
  "RECRUITMENT",
  "HR",
  "OPERATIONS",
  "FINANCE",
  "COMPLIANCE",
  "BUSINESS_DEVELOPMENT",
  "IT",
  "MARKETING",
] as const;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientProfile: true,
        agencyProfile: true,
        adminProfile: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      altContact,
      profilePicture, // base fields
      // client
      companyName,
      website,
      address,
      city,
      country,
      postalCode,
      designation,
      companySector,
      companySize,
      // agency
      agencyName,
      // admin
      department,
    } = body;

    // Update base user info (and profile picture URL if passed)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        altContact: altContact || undefined,
        profilePicture: profilePicture || undefined,
      },
    });

    // Role-specific updates
    const role = session.user.role;

    if (role === "CLIENT_ADMIN" && companyName) {
      await prisma.client.update({
        where: { userId: session.user.id },
        data: {
          companyName,
          website: website || undefined,
          address,
          city,
          country,
          postalCode: postalCode || undefined,
          designation,
          companySector: toEnum(companySector, COMPANY_SECTORS, "OTHER"),
          companySize: toEnum(companySize, COMPANY_SIZES, "SMALL"),
        },
      });
    }

    if (role === "RECRUITMENT_AGENCY" && agencyName) {
      await prisma.agency.update({
        where: { userId: session.user.id },
        data: {
          agencyName,
          website: website || undefined,
          address,
          city,
          country,
          postalCode: postalCode || undefined,
          // license fields are intentionally not editable here
        },
      });
    }

    if (role === "RECRUITMENT_ADMIN" && department) {
      await prisma.admin.update({
        where: { userId: session.user.id },
        data: {
          department: toEnum(department, DEPARTMENTS, null as any), // nullable in schema
        },
      });
    }

    const updatedProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientProfile: true,
        agencyProfile: true,
        adminProfile: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_UPDATE",
        entityType: "User",
        entityId: session.user.id,
        description: "Profile updated",
        affectedFields: Object.keys(body),
        performedById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
