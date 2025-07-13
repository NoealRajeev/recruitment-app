import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { NotificationService } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message = "Test notification" } = await request.json();

    // Create a test notification
    const notification = await NotificationService.createNotification({
      type: "SYSTEM_UPDATE",
      title: "Test Notification",
      message: message,
      recipientId: session.user.id,
      priority: "NORMAL",
    });

    return NextResponse.json({
      success: true,
      message: "Test notification created",
      notification,
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json(
      { error: "Failed to create test notification" },
      { status: 500 }
    );
  }
}
