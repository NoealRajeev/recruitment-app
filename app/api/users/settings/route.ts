import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return default settings
    // In a real application, you would store user settings in the database
    const settings = {
      notifications: {
        email: true,
        push: true,
        requirementUpdates: true,
        labourUpdates: true,
        documentUpdates: true,
        systemAlerts: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
      },
      preferences: {
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
      },
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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

    const settings = await request.json();

    // For now, just return success
    // In a real application, you would store these settings in the database
    console.log("Settings updated for user:", session.user.id, settings);

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
