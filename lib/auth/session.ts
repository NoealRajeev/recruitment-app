// lib/auth/session.ts
"use server";

import { User } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentAuth } from "./options";

/**
 * Updates both database and session atomically
 */
export async function updateAuthSession(
  userId: string,
  updates: Partial<User>
) {
  try {
    const dbUpdate = prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    const sessionUpdate = getCurrentAuth().then((auth) =>
      auth?.update({ user: updates })
    );

    await Promise.all([dbUpdate, sessionUpdate]);
  } catch (error) {
    console.error("Session update failed:", error);
    throw new Error("Failed to update session");
  }
}

/**
 * Gets fresh session data from database
 */
export async function refreshSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return user;
}
