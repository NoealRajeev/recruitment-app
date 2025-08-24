import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // buffer the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ensure output dir
    const relDir = "/uploads/avatars";
    const outDir = path.join(process.cwd(), "public", relDir);
    await mkdir(outDir, { recursive: true });

    // unique name
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
    const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
    const fullPath = path.join(outDir, name);
    const publicUrl = `${relDir}/${name}`; // e.g. /uploads/avatars/abc.png

    // write to disk
    await writeFile(fullPath, buffer);

    // Update User.profilePicture
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { profilePicture: publicUrl },
      select: { id: true, profilePicture: true, role: true, status: true },
    });

    // Save into Document table for traceability (status: VERIFIED or SUBMITTED—pick your flow)
    await prisma.document.create({
      data: {
        ownerId: session.user.id,
        type: "PROFILE_IMAGE",
        url: publicUrl,
        status: "VERIFIED", // or "SUBMITTED" if you verify later
        category: "IMPORTANT",
      },
    });

    return NextResponse.json({ success: true, url: publicUrl, user });
  } catch (err) {
    console.error("Avatar upload error:", err);
    // If you still hit body limit, ensure next.config.js serverActions.bodySizeLimit is set.
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
