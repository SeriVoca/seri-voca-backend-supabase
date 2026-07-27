import type { ErrorCodeMap } from "./error-definition.ts";
import { CURRICULUM_ERROR_CODES } from "@/domains/curriculum/curriculum.error-codes.ts";
import { WORD_ERROR_CODES } from "@/domains/word/word.error-codes.ts";
import { WORDBOOK_ERROR_CODES } from "@/domains/wordbook/wordbook.error-codes.ts";

// 특정 도메인에 속하지 않는 공통 코드
const COMMON_ERROR_CODES = {
  // 400
  INVALID_JSON: { status: 400, message: "요청 본문이 올바른 JSON이 아닙니다." },
  EMPTY_PATCH_BODY: { status: 400, message: "수정할 값이 없습니다." },
  // 401 / 403
  UNAUTHORIZED: { status: 401, message: "인증이 필요합니다." },
  FORBIDDEN: { status: 403, message: "권한이 없습니다." },
  // 409 - DB unique 위반. 도메인별 구체적인 문구가 필요하면 서비스에서 판단해 던진다
  DUPLICATE_RESOURCE: { status: 409, message: "이미 존재하는 데이터입니다." },
  // 500
  INVALID_REFERENCE: { status: 500, message: "서버 오류가 발생했습니다." },
  INTERNAL_SERVER_ERROR: { status: 500, message: "서버 오류가 발생했습니다." },
} as const satisfies ErrorCodeMap;

// 도메인별 코드를 합쳐 단일 레지스트리로 노출한다.
// 키가 겹치면 뒤쪽 spread가 조용히 덮어쓰므로 도메인 간 코드명 중복은 금지한다.
export const ERROR_CODES = {
  ...COMMON_ERROR_CODES,
  ...CURRICULUM_ERROR_CODES,
  ...WORD_ERROR_CODES,
  ...WORDBOOK_ERROR_CODES,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
