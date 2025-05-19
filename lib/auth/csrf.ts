// lib/auth/csrf.ts
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function validateCsrfToken(
  request: NextRequest
): Promise<boolean> {
  // Get CSRF token from cookie
  const cookieToken = (await cookies()).get("csrf-token")?.value;

  // Get CSRF token from request body or headers
  const requestToken =
    (await request.clone().formData()).get("csrfToken")?.toString() ||
    request.headers.get("X-CSRF-Token");

  if (!cookieToken || !requestToken) {
    return false;
  }

  return cookieToken === requestToken;
}
