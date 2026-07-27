import type { ErrorCodeMap } from "@/shared/errors/error-definition.ts";

export const CURRICULUM_ERROR_CODES = {
  // 404
  DEFAULT_CURRICULUM_NOT_FOUND: {
    status: 404,
    message: "기본 커리큘럼을 찾을 수 없습니다.",
  },
} as const satisfies ErrorCodeMap;
