import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { NotificationService } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const includeArchived = searchParams.get("includeArchived") === "true";
    const includeRead = searchParams.get("includeRead") !== "false";

    const notifications = await NotificationService.getUserNotifications(
      session.user.id,
      {
        limit,
        offset,
        includeArchived,
        includeRead,
      }
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationId } = body;

    switch (action) {
      case "markAsRead":
        if (!notificationId) {
          return NextResponse.json(
            { error: "Notification ID is required" },
            { status: 400 }
          );
        }
        await NotificationService.markAsRead(notificationId, session.user.id);
        break;

      case "markAllAsRead":
        await NotificationService.markAllAsRead(session.user.id);
        break;

      case "archive":
        if (!notificationId) {
          return NextResponse.json(
            { error: "Notification ID is required" },
            { status: 400 }
          );
        }
        await NotificationService.archiveNotification(
          notificationId,
          session.user.id
        );
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
