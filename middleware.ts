// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@prisma/client";
// import { refreshSession } from "@/lib/auth/session";
import { validateCsrfToken } from "@/lib/auth/csrf";
import { refreshSession } from "./lib/auth/session";

const publicRoutes = new Set([
  "/",
  "/about",
  "/contact",
  "/submit-requirement",
  "/auth/login",
  "/auth/register",
  "/auth/verify-account",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

const authRoutes = new Set(["/auth/login", "/auth/register"]);
const sensitiveRoutes = new Set([
  "/dashboard/admin",
  "/dashboard/client",
  "/dashboard/agency",
]);

const roleRoutes: Record<UserRole, string> = {
  RECRUITMENT_ADMIN: "/dashboard/admin",
  CLIENT_ADMIN: "/dashboard/client",
  RECRUITMENT_AGENCY: "/dashboard/agency",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public and static routes
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Handle authenticated users trying to access auth routes
  if (token && authRoutes.has(pathname)) {
    return redirectToRoleDashboard(token.role as UserRole, request);
  }

  // Handle unauthenticated users
  if (!token) {
    return redirectToLogin(request, pathname);
  }

  // CSRF protection for sensitive POST requests
  if (request.method === "POST" && sensitiveRoutes.has(pathname)) {
    const csrfValid = await validateCsrfToken(request);
    if (!csrfValid) {
      return new NextResponse("Invalid CSRF token", { status: 403 });
    }
  }

  // Session validation and expiration check
  // try {
  //   await refreshSession(token.id);

  //   // Type-safe expiration check
  //   if (typeof token.exp === "number" && isSessionExpired(token.exp)) {
  //     return redirectToLogin(request, pathname, "SessionExpired");
  //   }
  // } catch (error) {
  //   console.error("Session validation failed:", error);
  //   return redirectToLogin(request, pathname, "SessionError");
  // }

  // Handle unverified accounts
  if (token.status !== "VERIFIED") {
    return redirectToVerification(request, pathname);
  }

  // Handle password reset requirement
  if (token.resetRequired && pathname !== "/auth/reset-password") {
    return redirectToPasswordReset(request, pathname);
  }

  // Role-based routing
  return handleRoleBasedRouting(token.role as UserRole, pathname, request);
}

// Helper functions
function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/robots.txt") ||
    publicRoutes.has(pathname)
  );
}

function isSessionExpired(expiration: number): boolean {
  return Date.now() > expiration * 1000;
}

function redirectToRoleDashboard(
  role: UserRole,
  request: NextRequest
): NextResponse {
  const roleBasePath = roleRoutes[role];
  return NextResponse.redirect(new URL(roleBasePath, request.url));
}

function redirectToLogin(
  request: NextRequest,
  pathname: string,
  error?: string
): NextResponse {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  if (error) loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}

function redirectToVerification(
  request: NextRequest,
  pathname: string
): NextResponse {
  const verifyUrl = new URL("/auth/verify-account", request.url);
  verifyUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(verifyUrl);
}

function redirectToPasswordReset(
  request: NextRequest,
  pathname: string
): NextResponse {
  const resetUrl = new URL("/auth/reset-password", request.url);
  resetUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(resetUrl);
}

function handleRoleBasedRouting(
  role: UserRole,
  pathname: string,
  request: NextRequest
): NextResponse {
  const roleBasePath = roleRoutes[role];
  const response = NextResponse.next();

  // Set security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Handle dashboard routing
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(roleBasePath, request.url));
  }

  if (pathname.startsWith("/dashboard") && !pathname.startsWith(roleBasePath)) {
    return NextResponse.redirect(new URL(roleBasePath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets|favicon.ico|sw.js|api|sitemap.xml|robots.txt).*)",
  ],
};
