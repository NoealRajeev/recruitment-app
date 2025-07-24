// app/api/agencies/[id]/documents/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  // pull the id out of the promised params
  const { id } = await context.params;
  try {
    const agency = await prisma.agency.findUnique({
      where: { id: id },
      include: { user: true },
    });

    if (!agency) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const documents = await prisma.document.findMany({
      where: { ownerId: agency.user.id },
      select: {
        id: true,
        type: true,
        url: true,
        status: true,
        category: true,
        uploadedAt: true,
      },
    });

    const verifiedDocuments = await Promise.all(
      documents.map(async (doc) => {
        try {
          if (doc.url.startsWith("/uploads/")) {
            const filePath = path.join(process.cwd(), "public", doc.url);
            await fs.access(filePath);
            console.log(`File exists: ${filePath}`);
            return { ...doc, exists: true };
          }
          return { ...doc, exists: true };
        } catch (error) {
          console.error(`File not found: ${doc.url}`, error);
          return { ...doc, exists: false };
        }
      })
    );

    return NextResponse.json(verifiedDocuments.filter((doc) => doc.exists));
  } catch (error) {
    console.error("Error fetching agency documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
