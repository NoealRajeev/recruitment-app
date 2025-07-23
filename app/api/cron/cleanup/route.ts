// app/api/cron/cleanup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    console.log(`Running cleanup at ${now.toISOString()}`);

    // Delete accounts marked for immediate deletion (1 hour window)
    const immediateDeletions = await prisma.user.deleteMany({
      where: {
        deleteAt: { lte: now },
        deletionType: "IMMEDIATE",
      },
    });

    // Delete accounts marked for scheduled deletion (24 hours)
    const scheduledDeletions = await prisma.user.deleteMany({
      where: {
        deleteAt: { lte: now },
        deletionType: "SCHEDULED",
      },
    });

    // Delete expired password reset tokens
    const expiredTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: { lte: now },
      },
    });

    console.log(
      `Deleted ${immediateDeletions.count} immediate and ${scheduledDeletions.count} scheduled accounts, ${expiredTokens.count} expired password reset tokens`
    );

    return NextResponse.json({
      immediateDeletions: immediateDeletions.count,
      scheduledDeletions: scheduledDeletions.count,
      expiredTokens: expiredTokens.count,
    });
  } catch (error) {
    console.error("Error in cleanup cron job:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
