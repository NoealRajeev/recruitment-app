import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { NotificationType } from "@prisma/client";

function mapTypeToCategory(t: NotificationType) {
  if (
    t === "REQUIREMENT_CREATED" ||
    t === "REQUIREMENT_UPDATED" ||
    t === "REQUIREMENT_STATUS_CHANGED" ||
    t === "REQUIREMENT_FORWARDED_TO_AGENCY"
  )
    return "requirement";
  if (
    t === "LABOUR_PROFILE_CREATED" ||
    t === "LABOUR_PROFILE_STATUS_CHANGED" ||
    t === "STAGE_COMPLETED" ||
    t === "STAGE_FAILED" ||
    t === "STAGE_PENDING_ACTION" ||
    t === "TRAVEL_CONFIRMED" ||
    t === "ARRIVAL_CONFIRMED" ||
    t === "ASSIGNMENT_CREATED" ||
    t === "ASSIGNMENT_STATUS_CHANGED" ||
    t === "ASSIGNMENT_FEEDBACK_RECEIVED"
  )
    return "labour";
  if (
    t === "DOCUMENT_UPLOADED" ||
    t === "DOCUMENT_VERIFIED" ||
    t === "DOCUMENT_REJECTED" ||
    t === "OFFER_LETTER_SIGNED" ||
    t === "VISA_UPLOADED" ||
    t === "TRAVEL_DOCUMENTS_UPLOADED"
  )
    return "document";
  return "system";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ notifications: [] });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 100);
  const includeRead = url.searchParams.get("includeRead") !== "false";
  const archived = url.searchParams.get("archived") === "true";
  const category = url.searchParams.get("category") as
    | null
    | "requirement"
    | "labour"
    | "document"
    | "system";
  const priority = url.searchParams.get("priority") as
    | null
    | "LOW"
    | "NORMAL"
    | "HIGH"
    | "URGENT";
  const q = url.searchParams.get("q") || "";
  const cursor = url.searchParams.get("cursor");

  const where: any = {
    recipientId: session.user.id,
    ...(archived ? {} : { isArchived: false }),
    ...(includeRead ? {} : { isRead: false }),
  };

  if (priority) where.priority = priority;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  // filter by category by mapping types
  const allTypes = Object.keys(
    NotificationType
  ) as (keyof typeof NotificationType)[];
  if (category) {
    const types = allTypes.filter(
      (t) => mapTypeToCategory(t as any) === category
    );
    where.type = { in: types };
  }

  const data = await prisma.notification.findMany({
    where,
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = data.length > limit;
  const page = hasMore ? data.slice(0, -1) : data;

  return NextResponse.json({
    notifications: page.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      isArchived: n.isArchived,
      priority: n.priority,
      createdAt: n.createdAt,
      actionUrl: n.actionUrl || undefined,
      sender: n.sender ? { name: n.sender.name ?? "" } : null,
    })),
    nextCursor: hasMore ? data[data.length - 1].id : null,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: true });

  const body = await req.json();
  const { action, notificationId } = body as {
    action:
      | "markAllAsRead"
      | "markAsRead"
      | "markAsUnread"
      | "archive"
      | "unarchive";
    notificationId?: string;
  };

  const whereBase = { recipientId: session.user.id };

  if (action === "markAllAsRead") {
    await prisma.notification.updateMany({
      where: { ...whereBase, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  } else if (action === "markAsRead" && notificationId) {
    await prisma.notification.updateMany({
      where: { ...whereBase, id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  } else if (action === "markAsUnread" && notificationId) {
    await prisma.notification.updateMany({
      where: { ...whereBase, id: notificationId },
      data: { isRead: false, readAt: null },
    });
  } else if (
    (action === "archive" || action === "unarchive") &&
    notificationId
  ) {
    const isArchive = action === "archive";
    await prisma.notification.updateMany({
      where: { ...whereBase, id: notificationId },
      data: {
        isArchived: isArchive,
        archivedAt: isArchive ? new Date() : null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
