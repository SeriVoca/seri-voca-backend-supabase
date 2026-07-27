import type { ErrorCodeMap } from "@/shared/errors/error-definition.ts";

export const CURRICULUM_ERROR_CODES = {
  // 500 - 기본 커리큘럼은 정책상 정확히 1건 존재해야 한다.
  // 없거나 2건 이상이면 클라이언트 요청 문제가 아니라 서버 데이터 오류이므로 5xx로 다룬다.
  DEFAULT_CURRICULUM_NOT_FOUND: {
    status: 500,
    message: "서버 오류가 발생했습니다.",
  },
} as const satisfies ErrorCodeMap;
