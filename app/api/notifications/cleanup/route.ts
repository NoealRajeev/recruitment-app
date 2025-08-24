// app/api/notifications/cleanup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { env } from "@/lib/env.server";

export async function POST(req: Request) {
  const secret = (req.headers.get("x-cron-secret") || "").trim();
  if (!secret || secret !== env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await prisma.notification.deleteMany({
    where: {
      isArchived: true,
      archivedAt: { lt: cutoff },
    },
  });

  return NextResponse.json({ ok: true, deleted: result.count });
}
