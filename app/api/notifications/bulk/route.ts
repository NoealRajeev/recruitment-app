import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ ok: false }, { status: 401 });

  const { action, ids } = (await req.json()) as {
    action: "read" | "unread" | "archive" | "unarchive";
    ids: string[];
  };
  if (!ids?.length) return NextResponse.json({ ok: true });

  if (action === "read" || action === "unread") {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, recipientId: session.user.id },
      data: {
        isRead: action === "read",
        readAt: action === "read" ? new Date() : null,
      },
    });
  } else if (action === "archive" || action === "unarchive") {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, recipientId: session.user.id },
      data: {
        isArchived: action === "archive",
        archivedAt: action === "archive" ? new Date() : null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
