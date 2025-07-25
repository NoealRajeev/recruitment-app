// pages/api/healthcheck.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/lib/env";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    return res.status(200).json({ ok: true, users });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[HEALTHCHECK ERROR]", errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
}
