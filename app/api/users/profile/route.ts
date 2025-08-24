import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";

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

const COMPANY_SECTORS = new Set([
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
] as const);

const COMPANY_SIZES = new Set([
  "SMALL",
  "MEDIUM",
  "LARGE",
  "ENTERPRISE",
] as const);

const DEPARTMENTS = new Set([
  "RECRUITMENT",
  "HR",
  "OPERATIONS",
  "FINANCE",
  "COMPLIANCE",
  "BUSINESS_DEVELOPMENT",
  "IT",
  "MARKETING",
] as const);

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
      // client
      companyName,
      companySector,
      companySize,
      website,
      address,
      city,
      country,
      postalCode,
      designation,
      // agency
      agencyName,
      // admin
      department,
    } = body ?? {};

    // Update basic user information
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name ?? undefined,
        phone: phone ?? undefined,
        altContact: altContact ?? undefined,
      },
    });

    // CLIENT updates (partial / only provided keys)
    if (session.user.role === "CLIENT_ADMIN") {
      const clientUpdate: any = {};
      if (companyName !== undefined) clientUpdate.companyName = companyName;
      if (website !== undefined) clientUpdate.website = website || null;
      if (address !== undefined) clientUpdate.address = address;
      if (city !== undefined) clientUpdate.city = city;
      if (country !== undefined) clientUpdate.country = country;
      if (postalCode !== undefined)
        clientUpdate.postalCode = postalCode || null;
      if (designation !== undefined) clientUpdate.designation = designation;

      if (companySector !== undefined) {
        if (!COMPANY_SECTORS.has(companySector)) {
          return NextResponse.json(
            { error: "Invalid company sector" },
            { status: 400 }
          );
        }
        clientUpdate.companySector = companySector;
      }
      if (companySize !== undefined) {
        if (!COMPANY_SIZES.has(companySize)) {
          return NextResponse.json(
            { error: "Invalid company size" },
            { status: 400 }
          );
        }
        clientUpdate.companySize = companySize;
      }

      if (Object.keys(clientUpdate).length > 0) {
        await prisma.client.update({
          where: { userId: session.user.id },
          data: clientUpdate,
        });
      }
    }

    // AGENCY updates (partial / only provided keys)
    if (session.user.role === "RECRUITMENT_AGENCY") {
      const agencyUpdate: any = {};
      if (agencyName !== undefined) agencyUpdate.agencyName = agencyName;
      if (website !== undefined) agencyUpdate.website = website || null;
      if (address !== undefined) agencyUpdate.address = address;
      if (city !== undefined) agencyUpdate.city = city;
      if (country !== undefined) agencyUpdate.country = country;
      if (postalCode !== undefined)
        agencyUpdate.postalCode = postalCode || null;

      if (Object.keys(agencyUpdate).length > 0) {
        await prisma.agency.update({
          where: { userId: session.user.id },
          data: agencyUpdate,
        });
      }
    }

    // ADMIN updates (department)
    if (session.user.role === "RECRUITMENT_ADMIN") {
      const adminUpdate: any = {};
      if (department !== undefined) {
        if (department === "" || department === null) {
          adminUpdate.department = null;
        } else {
          if (!DEPARTMENTS.has(department)) {
            return NextResponse.json(
              { error: "Invalid department" },
              { status: 400 }
            );
          }
          adminUpdate.department = department;
        }
      }
      if (Object.keys(adminUpdate).length > 0) {
        await prisma.admin.update({
          where: { userId: session.user.id },
          data: adminUpdate,
        });
      }
    }

    // Fetch updated profile
    const updatedProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientProfile: true,
        agencyProfile: true,
        adminProfile: true,
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
