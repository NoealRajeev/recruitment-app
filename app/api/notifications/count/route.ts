import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { NotificationService } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await NotificationService.getUnreadCount(session.user.id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification count" },
      { status: 500 }
    );
  }
}
