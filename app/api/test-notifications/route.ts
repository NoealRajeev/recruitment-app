import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  NotificationService,
  NotificationTemplates,
} from "@/lib/notifications";
import { NotificationType, NotificationPriority } from "@prisma/client";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { testType } = await request.json();

    switch (testType) {
      case "welcome":
        await NotificationService.createNotification({
          ...NotificationTemplates.WELCOME_MESSAGE(session.user.name || "User"),
          recipientId: session.user.id,
        });
        break;

      case "requirement":
        await NotificationService.createNotification({
          ...NotificationTemplates.REQUIREMENT_CREATED(
            "test-123",
            "Test Company"
          ),
          recipientId: session.user.id,
        });
        break;

      case "travel":
        await NotificationService.createNotification({
          ...NotificationTemplates.TRAVEL_CONFIRMED(
            "Test Labour",
            "2024-01-15"
          ),
          recipientId: session.user.id,
        });
        break;

      case "custom":
        await NotificationService.createNotification({
          type: NotificationType.SYSTEM_MAINTENANCE,
          title: "Test Notification",
          message:
            "This is a test notification to verify the system is working",
          recipientId: session.user.id,
          priority: NotificationPriority.HIGH,
          actionUrl: "/dashboard",
          actionText: "Go to Dashboard",
        });
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid test type. Use: welcome, requirement, travel, or custom",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test notification sent: ${testType}`,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
