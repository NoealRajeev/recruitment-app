import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteLocalFile } from "@/lib/local-storage";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (
    request.method === "DELETE" &&
    request.nextUrl.pathname.includes("/documents")
  ) {
    const body = await request.json();
    if (body.url) {
      deleteLocalFile(body.url);
    }
  }

  return response;
}
