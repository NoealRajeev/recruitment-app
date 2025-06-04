// app/api/auth/check-identifier/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { type, value } = await request.json();

    if (!type || !value || !["email", "phone"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    let existingUser;

    if (type === "email") {
      existingUser = await prisma.user.findUnique({
        where: { email: value },
      });
    } else if (type === "phone") {
      existingUser = await prisma.user.findUnique({
        where: { phone: value },
      });
    }

    return NextResponse.json({
      available: !existingUser,
    });
  } catch (error) {
    console.error("Identifier check error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
