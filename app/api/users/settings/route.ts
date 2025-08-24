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

    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: session.user.id },
      });
    }

    return NextResponse.json({
      settings: {
        notifications: {
          email: settings.notifyEmail,
          push: settings.notifyPush,
          requirementUpdates: settings.notifyRequirement,
          labourUpdates: settings.notifyLabour,
          documentUpdates: settings.notifyDocument,
          systemAlerts: settings.notifySystem,
        },
        security: {
          twoFactorAuth: settings.twoFactorAuth,
          sessionTimeout: settings.sessionTimeoutMins,
        },
        preferences: {
          language: settings.language,
          timezone: settings.timezone,
          dateFormat: settings.dateFormat,
        },
      },
    });
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

    const payload = await request.json();

    const updated = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        notifyEmail: !!payload?.notifications?.email,
        notifyPush: !!payload?.notifications?.push,
        notifyRequirement: !!payload?.notifications?.requirementUpdates,
        notifyLabour: !!payload?.notifications?.labourUpdates,
        notifyDocument: !!payload?.notifications?.documentUpdates,
        notifySystem: !!payload?.notifications?.systemAlerts,
        twoFactorAuth: !!payload?.security?.twoFactorAuth,
        sessionTimeoutMins: Number(payload?.security?.sessionTimeout ?? 30),
        language: String(payload?.preferences?.language ?? "en"),
        timezone: String(payload?.preferences?.timezone ?? "UTC"),
        dateFormat: String(payload?.preferences?.dateFormat ?? "MM/DD/YYYY"),
      },
      create: {
        userId: session.user.id,
        notifyEmail: !!payload?.notifications?.email,
        notifyPush: !!payload?.notifications?.push,
        notifyRequirement: !!payload?.notifications?.requirementUpdates,
        notifyLabour: !!payload?.notifications?.labourUpdates,
        notifyDocument: !!payload?.notifications?.documentUpdates,
        notifySystem: !!payload?.notifications?.systemAlerts,
        twoFactorAuth: !!payload?.security?.twoFactorAuth,
        sessionTimeoutMins: Number(payload?.security?.sessionTimeout ?? 30),
        language: String(payload?.preferences?.language ?? "en"),
        timezone: String(payload?.preferences?.timezone ?? "UTC"),
        dateFormat: String(payload?.preferences?.dateFormat ?? "MM/DD/YYYY"),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings: {
        notifications: {
          email: updated.notifyEmail,
          push: updated.notifyPush,
          requirementUpdates: updated.notifyRequirement,
          labourUpdates: updated.notifyLabour,
          documentUpdates: updated.notifyDocument,
          systemAlerts: updated.notifySystem,
        },
        security: {
          twoFactorAuth: updated.twoFactorAuth,
          sessionTimeout: updated.sessionTimeoutMins,
        },
        preferences: {
          language: updated.language,
          timezone: updated.timezone,
          dateFormat: updated.dateFormat,
        },
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
