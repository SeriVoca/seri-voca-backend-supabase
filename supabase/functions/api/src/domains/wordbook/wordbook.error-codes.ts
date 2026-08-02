import type { ErrorCodeMap } from "@/shared/errors/error-definition.ts";

export const WORDBOOK_ERROR_CODES = {
  // 400
  INVALID_WORDBOOK_ID: {
    status: 400,
    message: "단어장 ID 형식이 올바르지 않습니다.",
  },
  TITLE_REQUIRED: { status: 400, message: "단어장 제목을 입력해주세요." },
  // 404
  WORDBOOK_NOT_FOUND: { status: 404, message: "단어장을 찾을 수 없습니다." },
  // 500 - type은 스키마상 SYSTEM/USER 중 하나여야 한다. 그 외의 값이 들어있다면
  // 클라이언트 요청 문제가 아니라 서버 데이터 오류다.
  WORDBOOK_TYPE_MISCONFIGURED: {
    status: 500,
    message: "서버 오류가 발생했습니다.",
  },
} as const satisfies ErrorCodeMap;
