import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024)
    return NextResponse.json(
      { error: "Image too large (max 10MB)" },
      { status: 400 }
    );

  const bytes = Buffer.from(await file.arrayBuffer());
  const relDir = "/uploads/avatars";
  const outDir = path.join(process.cwd(), "public", relDir);
  await mkdir(outDir, { recursive: true });

  const ext = file.name?.split(".").pop() || "png";
  const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const fullPath = path.join(outDir, name);
  const publicUrl = `${relDir}/${name}`;
  await writeFile(fullPath, bytes);

  // update agency.user.profilePicture
  const agency = await prisma.agency.update({
    where: { id: params.id },
    data: { user: { update: { profilePicture: publicUrl } } },
    select: { id: true },
  });

  return NextResponse.json({
    success: true,
    url: publicUrl,
    agencyId: agency.id,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agency = await prisma.agency.update({
    where: { id: params.id },
    data: { user: { update: { profilePicture: null } } },
    select: { id: true },
  });

  return NextResponse.json({ success: true, agencyId: agency.id });
}
