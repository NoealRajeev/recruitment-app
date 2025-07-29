import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@prisma/client";
import { validateCsrfToken } from "@/lib/auth/csrf";
import { env } from "./lib/env.server";

const publicRoutes = new Set([
  "/",
  "/about",
  "/contact",
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

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }
  const cronSecret = request.headers.get("x-cron-secret");
  if (
    request.nextUrl.pathname.startsWith("/api/reminders") &&
    cronSecret !== env.CRON_SECRET
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let token;
  try {
    token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return redirectToLogin(request, "TokenError");
  }

  if (!token && (publicRoutes.has(pathname) || authRoutes.has(pathname))) {
    return NextResponse.next(); // Public access for unauthenticated users
  }

  if (!token) {
    return redirectToLogin(request, "NoSession");
  }

  if (!token.sub) {
    return redirectToLogin(request, "InvalidSession");
  }

  // Prevent authenticated users from accessing login/register
  if (isAuthRoute(pathname) && token) {
    return redirectToRoleDashboard(token.role as UserRole, request);
  }

  if (typeof token.exp === "number" && isSessionExpired(token.exp)) {
    return redirectToLogin(request, "SessionExpired");
  }

  if (token.status !== "VERIFIED") {
    return redirectToVerification(request);
  }

  if (token.resetRequired && pathname !== "/auth/reset-password") {
    return redirectToPasswordReset(request);
  }

  if (request.method === "POST" && sensitiveRoutes.has(pathname)) {
    const csrfValid = await validateCsrfToken(request);
    if (!csrfValid) {
      return new NextResponse("Invalid CSRF token", { status: 403 });
    }
  }

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
    pathname.startsWith("/.well-known")
  );
}

function isSessionExpired(expiration: number): boolean {
  return Date.now() > expiration * 1000;
}

function isAuthRoute(pathname: string): boolean {
  return [...authRoutes].some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function redirectToRoleDashboard(
  role: UserRole,
  request: NextRequest
): NextResponse {
  const roleBasePath = roleRoutes[role];
  return NextResponse.redirect(new URL(roleBasePath, request.url));
}

function redirectToLogin(request: NextRequest, error?: string): NextResponse {
  const loginUrl = new URL("/auth/login", request.url);
  const callbackUrl = request.nextUrl.href;
  console.log("Redirecting to login with callback URL:", callbackUrl);
  console.log("Request URL:", request.url);
  console.log("Next URL:", request.nextUrl.href);
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  if (error) loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}

function redirectToVerification(request: NextRequest): NextResponse {
  const verifyUrl = new URL("/auth/verify-account", request.url);
  verifyUrl.searchParams.set("callbackUrl", request.nextUrl.href);
  return NextResponse.redirect(verifyUrl);
}

function redirectToPasswordReset(request: NextRequest): NextResponse {
  const resetUrl = new URL("/auth/reset-password", request.url);
  resetUrl.searchParams.set("callbackUrl", request.nextUrl.href);
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
