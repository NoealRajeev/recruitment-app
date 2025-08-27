import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id: id },
      select: { userId: true },
    });
    if (!client?.userId) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large (max 10MB)" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const relDir = "/uploads/avatars";
    const outDir = path.join(process.cwd(), "public", relDir);
    await mkdir(outDir, { recursive: true });

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
    const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
    const fullPath = path.join(outDir, name);
    const publicUrl = `${relDir}/${name}`;

    await writeFile(fullPath, bytes);

    const user = await prisma.user.update({
      where: { id: client.userId },
      data: { profilePicture: publicUrl },
      select: { id: true, profilePicture: true },
    });

    return NextResponse.json({ success: true, url: publicUrl, user });
  } catch (err) {
    console.error("Client avatar upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the client's user and current avatar
    const client = await prisma.client.findUnique({
      where: { id: id },
      select: { userId: true, user: { select: { profilePicture: true } } },
    });

    if (!client?.userId) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Attempt to unlink if avatar is within our /public/uploads/avatars
    const currentUrl = client.user?.profilePicture || "";
    if (currentUrl.startsWith("/uploads/avatars/")) {
      const fullPath = path.join(process.cwd(), "public", currentUrl);
      try {
        await unlink(fullPath);
      } catch {
        // Ignore if file missing; we still null out in DB
      }
    }

    // Null out the profilePicture
    await prisma.user.update({
      where: { id: client.userId },
      data: { profilePicture: null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Client avatar delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}
