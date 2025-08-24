import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // basic constraints (same as UI)
    const tooShort = newPassword.length < 8;
    const noLower = !/[a-z]/.test(newPassword);
    const noUpper = !/[A-Z]/.test(newPassword);
    const noNum = !/[0-9]/.test(newPassword);
    if (tooShort || noLower || noUpper || noNum) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 chars and include lowercase, uppercase, and a number.",
        },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hash,
          resetRequired: false,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "PASSWORD_CHANGE",
          entityType: "User",
          entityId: user.id,
          description: "User changed password from settings",
          affectedFields: ["password"],
          performedById: user.id,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Password changed" });
  } catch (err) {
    console.error("change-password error:", err);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
