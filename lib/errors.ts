// lib/errors.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(entity: string, id?: string) {
    super(`${entity}${id ? ` with ID ${id}` : ""} not found`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends ApiError {
  constructor(details: any) {
    super("Validation failed", 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super("Unauthorized", 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super("Forbidden", 403, "FORBIDDEN");
  }
}
