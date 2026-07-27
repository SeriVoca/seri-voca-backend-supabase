import type { PostgrestError } from "supabase";
import { AppError } from "./app-error.ts";
import type { ErrorCode } from "./error-codes.ts";

const PG_ERROR_MAP: Record<string, ErrorCode> = {
  "23503": "INVALID_REFERENCE", // FK 위반
  "23505": "DUPLICATE_RESOURCE", // unique 위반
};

// 레포지토리 경계에서 PostgrestError를 AppError로 변환. 매핑에 없는 코드는 500으로 처리
export const toAppError = (error: PostgrestError): AppError =>
  new AppError(PG_ERROR_MAP[error.code] ?? "INTERNAL_SERVER_ERROR", {
    cause: error,
  });
