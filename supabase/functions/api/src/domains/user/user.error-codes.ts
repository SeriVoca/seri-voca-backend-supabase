import type { ErrorCodeMap } from "@/shared/errors/error-definition.ts";

export const USER_ERROR_CODES = {
  // 500 - 가입 시 user 행이 자동 생성되므로, 인증을 통과한 사용자에게 행이 없다면
  // 클라이언트 요청 문제가 아니라 서버 데이터 오류다.
  USER_PROFILE_MISSING: { status: 500, message: "서버 오류가 발생했습니다." },
} as const satisfies ErrorCodeMap;
