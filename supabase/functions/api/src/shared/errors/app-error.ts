import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ERROR_CODES, type ErrorCode } from "./error-codes.ts";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: ContentfulStatusCode;

  constructor(code: ErrorCode, options?: { cause?: unknown }) {
    super(ERROR_CODES[code].message, options);
    this.name = "AppError";
    this.code = code;
    this.status = ERROR_CODES[code].status;
  }
}
