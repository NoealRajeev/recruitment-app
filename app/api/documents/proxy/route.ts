// /api/documents/proxy
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    // Security: Ensure the path is within the uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const fullPath = path.resolve(path.join(uploadsDir, filePath));
    console.log("[Proxy API] Resolved fullPath:", fullPath);
    console.log("[Proxy API] Uploads dir:", uploadsDir);

    if (!fullPath.startsWith(uploadsDir)) {
      console.error("[Proxy API] Invalid file path (outside uploads dir)");
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
      console.log("[Proxy API] File exists:", fullPath);
    } catch {
      console.error("[Proxy API] File not found:", fullPath);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    console.log("[Proxy API] File extension:", ext);

    // Set appropriate content type
    let contentType = "application/octet-stream";
    if (ext === ".pdf") {
      contentType = "application/pdf";
    } else if ([".jpg", ".jpeg"].includes(ext)) {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    }

    // Return the file with appropriate headers
    const response = new NextResponse(new Uint8Array(fileBuffer));
    response.headers.set("Content-Type", contentType);
    response.headers.set(
      "Content-Disposition",
      `inline; filename="${path.basename(fullPath)}"`
    );
    response.headers.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    console.log("[Proxy API] File served successfully:", fullPath);
    return response;
  } catch (error) {
    console.error("[Proxy API] Document proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
