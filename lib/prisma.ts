// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { env } from "./env";

declare global {
  var prisma: PrismaClient | undefined;
}

// Ensure DATABASE_URL exists
if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in environment variables");
}

const prisma = global.prisma ?? new PrismaClient();

if (!env.isProduction) global.prisma = prisma;

export default prisma;
