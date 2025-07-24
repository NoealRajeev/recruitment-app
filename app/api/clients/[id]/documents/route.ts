// app/api/clients/[id]/documents/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  // pull the id out of the promised params
  const { id } = await context.params;
  try {
    // First get the client to verify it exists
    const client = await prisma.client.findUnique({
      where: { id: id },
      select: { userId: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Now fetch documents for the client's user ID
    const documents = await prisma.document.findMany({
      where: { ownerId: client.userId },
      select: {
        id: true,
        type: true,
        url: true,
        status: true,
        category: true,
        uploadedAt: true,
      },
    });

    // Verify files exist on server
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
    console.error("Error in documents route:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
