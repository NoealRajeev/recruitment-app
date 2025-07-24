// lib/auth/session.ts
"use server";

import { User } from "@prisma/client";
import prisma from "@/lib/prisma";
import { authOptions, getCurrentAuth } from "./options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Updates both database and session atomically
 */
export async function updateAuthSession(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: updates,
  });
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clientProfile: true,
      agencyProfile: true,
      adminProfile: true,
    },
  });
}

/**
 * Gets fresh session data from database
 */
export async function refreshSession(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
