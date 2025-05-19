// lib/auth/actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import { hash } from "bcryptjs";
import { updateAuthSession } from "./session";

export async function resetPassword(newPassword: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Not authenticated" };
  }

  try {
    const hashedPassword = await hash(newPassword, 12);

    await updateAuthSession(session.user.id, {
      password: hashedPassword,
      resetRequired: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password" };
  }
}
