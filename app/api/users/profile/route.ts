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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, altContact, ...profileData } = body;

    // Update basic user information
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        altContact: altContact || undefined,
      },
    });

    // Update role-specific profile data
    if (session.user.role === "CLIENT_ADMIN" && profileData.companyName) {
      await prisma.client.update({
        where: { userId: session.user.id },
        data: {
          companyName: profileData.companyName,
          website: profileData.website || undefined,
          address: profileData.address,
          city: profileData.city,
          country: profileData.country,
          postalCode: profileData.postalCode || undefined,
          designation: profileData.designation,
        },
      });
    }

    if (session.user.role === "RECRUITMENT_AGENCY" && profileData.agencyName) {
      await prisma.agency.update({
        where: { userId: session.user.id },
        data: {
          agencyName: profileData.agencyName,
          website: profileData.website || undefined,
          address: profileData.address,
          city: profileData.city,
          country: profileData.country,
          postalCode: profileData.postalCode || undefined,
        },
      });
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
