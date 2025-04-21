import { ConvexError } from "convex/values";

export class BadRequestError extends ConvexError<{
  code: string;
  message?: string;
}> {
  constructor(message?: string) {
    super({
      code: "BAD_REQUEST",
      message,
    });
  }
}
export class UnauthorizedError extends ConvexError<{
  code: string;
  message?: string;
}> {
  constructor(message?: string) {
    super({
      code: "UNAUTHORIZED",
      message,
    });
  }
}

export class NotFoundError extends ConvexError<{
  code: string;
  message?: string;
}> {
  constructor(message?: string) {
    super({
      code: "NOT_FOUND",
      message,
    });
  }
}

export class ForbiddenError extends ConvexError<{
  code: string;
  message?: string;
}> {
  constructor(message?: string) {
    super({
      code: "FORBIDDEN",
      message,
    });
  }
}

export class InternalServerError extends ConvexError<{
  code: string;
  message?: string;
}> {
  constructor(message?: string) {
    super({
      code: "INTERNAL_SERVER_ERROR",
      message,
    });
  }
}

export class ConflictError extends ConvexError<{
  code: string;
  message?: string;
}> {
  constructor(message?: string) {
    super({
      code: "CONFLICT",
      message,
    });
  }
}
