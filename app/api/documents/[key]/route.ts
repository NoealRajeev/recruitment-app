// app/api/documents/[key]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFileUrl } from "@/lib/s3";
import { env } from "@/lib/env.server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
): Promise<NextResponse> {
  try {
    const { key } = await context.params;
    console.log("[API] Document GET request for key:", key);

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Invalid document key" },
        { status: 400 }
      );
    }

    const decodedKey = decodeURIComponent(key)
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");

    // Get the presigned URL from S3
    const url = await getFileUrl(decodedKey);
    console.log("[API] Generated signed URL:", url);

    return NextResponse.json({
      url,
      key: decodedKey,
    });
  } catch (error) {
    console.error("Error generating S3 URL:", error);
    return NextResponse.json(
      { error: "Failed to generate document URL" },
      { status: 500 }
    );
  }
}
