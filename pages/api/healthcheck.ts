// pages/api/healthcheck.ts
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    return res.status(200).json({ ok: true, users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
