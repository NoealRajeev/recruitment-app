"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function resetPassword(newPassword: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Not authenticated" };
  }

  try {
    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        password: hashedPassword,
        resetRequired: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password" };
  }
}
