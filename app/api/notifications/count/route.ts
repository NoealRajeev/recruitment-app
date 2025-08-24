import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await prisma.notification.count({
    where: { recipientId: session.user.id, isRead: false, isArchived: false },
  });

  return NextResponse.json({ count });
}
