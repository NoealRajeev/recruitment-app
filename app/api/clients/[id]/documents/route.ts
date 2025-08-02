// app/api/clients/[id]/documents/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await context.params;

  try {
    // First get the client to verify it exists
    const client = await prisma.client.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Fetch documents for the client's user ID
    const documents = await prisma.document.findMany({
      where: { ownerId: client.userId },
      select: {
        id: true,
        type: true,
        url: true, // This now contains the local file path
        status: true,
        category: true,
        uploadedAt: true,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error in documents route:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
