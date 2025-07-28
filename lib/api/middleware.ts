// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { ZodError, ZodTypeAny } from "zod";
import { UserRole } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import {
  AuthenticatedRequest,
  AuthenticatedHandler,
  ValidatedRequest,
  ValidatedHandler,
  Handler,
} from "@/types";
import { env } from "../env.server";

export function withAdminAuth<Params = unknown>(
  handler: AuthenticatedHandler<Params>
): Handler<Params> {
  return async (req: NextRequest, params?: Params) => {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.RECRUITMENT_ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Create authenticated request by properly extending NextRequest
    const authenticatedReq: AuthenticatedRequest = Object.assign(
      new NextRequest(req.url, {
        body: req.body,
        headers: req.headers,
        method: req.method,
        redirect: req.redirect,
      }),
      {
        user: session.user,
        // Copy all other properties from req
        ...Object.fromEntries(
          Object.entries(req).filter(
            ([key]) => !["body", "headers", "method", "redirect"].includes(key)
          )
        ),
      }
    );

    return handler(authenticatedReq, params);
  };
}

export function withValidation<Schema extends ZodTypeAny, Params = unknown>(
  schema: Schema,
  handler: ValidatedHandler<Schema, Params>
): Handler<Params> {
  return async (req: NextRequest, params?: Params) => {
    try {
      let body = {};
      if (req.method !== "GET" && req.method !== "HEAD") {
        try {
          body = await req.clone().json();
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: "Validation failed",
                details: error.errors.map((e) => ({
                  path: e.path.join("."),
                  message: e.message,
                })),
              },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
          );
        }
      }

      const validatedData = schema.parse(body);

      // Create validated request by properly extending NextRequest
      const validatedReq: ValidatedRequest<Schema> = Object.assign(
        new NextRequest(req.url, {
          body: req.body,
          headers: req.headers,
          method: req.method,
          redirect: req.redirect,
        }),
        {
          data: validatedData,
          // Copy all other properties from req
          ...Object.fromEntries(
            Object.entries(req).filter(
              ([key]) =>
                !["body", "headers", "method", "redirect"].includes(key)
            )
          ),
        }
      );

      return handler(validatedReq, params);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Invalid request", details: String(error) },
        { status: 400 }
      );
    }
  };
}

export function handleApiErrors<Params = unknown>(
  handler: Handler<Params>
): Handler<Params> {
  return async (req: NextRequest, params?: Params) => {
    try {
      return await handler(req, params);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            ...(error.details && { details: error.details }),
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          ...(env.isDevelopment && {
            details: String(error),
          }),
        },
        { status: 500 }
      );
    }
  };
}
