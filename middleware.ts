// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkPermissions } from "@/lib/auth/permissions";
import type { Permission, UserRole } from "@prisma/client";

// Define public routes
const publicRoutes = new Set([
  "/",
  "/about",
  "/contact",
  "/submit-requirement",
  "/auth/login",
  "/auth/register",
]);

// Define protected routes with required permissions
const protectedRoutes: Record<string, Permission[]> = {
  "/dashboard": ["DASHBOARD_ACCESS"],
  "/dashboard/requirements": ["REQUEST_READ"],
  "/dashboard/requirements/new": ["REQUEST_CREATE"],
  "/dashboard/candidates": ["CANDIDATE_READ"],
  "/dashboard/procedures": ["PROCEDURE_READ"],
  "/dashboard/agencies": ["AGENCY_READ"],
  "/dashboard/users": ["USER_READ"],
};

// Dashboard redirects by role
const dashboardRedirects: Record<UserRole, string> = {
  CLIENT_ADMIN: "/dashboard/requirements",
  RECRUITMENT_ADMIN: "/dashboard/candidates",
  RECRUITMENT_AGENCY: "/dashboard/procedures",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static files, image optimization, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/robots.txt")
  ) {
    return NextResponse.next();
  }

  // Allow public routes through
  if (publicRoutes.has(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as UserRole;
  const userId = token.sub as string;

  // Check for route-specific permissions
  const requiredPermissions = protectedRoutes[pathname];
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = await checkPermissions(role, requiredPermissions, {
      userId,
    });

    if (!hasPermission) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Role-based redirect from /dashboard
  if (pathname === "/dashboard") {
    const redirectPath = dashboardRedirects[role] || "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

// Run middleware only on relevant routes and skip static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets|favicon.ico|sw.js|api|sitemap.xml|robots.txt).*)",
  ],
};
