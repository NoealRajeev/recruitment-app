import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@prisma/client";

// Define public routes
const publicRoutes = new Set([
  "/",
  "/about",
  "/contact",
  "/submit-requirement",
  "/auth/login",
  "/auth/register",
]);

// Role-based route mapping
const roleRoutes: Record<UserRole, string> = {
  RECRUITMENT_ADMIN: "/dashboard/admin",
  CLIENT_ADMIN: "/dashboard/client",
  RECRUITMENT_AGENCY: "/dashboard/agency",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public and static routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/robots.txt") ||
    publicRoutes.has(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect unverified accounts
  if (token.status !== "VERIFIED") {
    const verifyUrl = new URL("/auth/verify-account", request.url);
    verifyUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(verifyUrl);
  }

  const role = token.role as UserRole;
  const roleBasePath = roleRoutes[role];

  // Redirect to role-specific dashboard if accessing generic /dashboard
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(roleBasePath, request.url));
  }

  // Block access to other role's dashboard routes
  if (pathname.startsWith("/dashboard") && !pathname.startsWith(roleBasePath)) {
    return NextResponse.redirect(new URL(roleBasePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets|favicon.ico|sw.js|api|sitemap.xml|robots.txt).*)",
  ],
};
