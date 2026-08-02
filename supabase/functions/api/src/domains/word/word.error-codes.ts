import type { ErrorCodeMap } from "@/shared/errors/error-definition.ts";

export const WORD_ERROR_CODES = {
  // 400 - ID
  INVALID_WORD_ID: {
    status: 400,
    message: "단어 ID 형식이 올바르지 않습니다.",
  },
  INVALID_USER_WORD_IDS: {
    status: 400,
    message: "단어 ID 목록이 올바르지 않습니다.",
  },
  INVALID_SYSTEM_WORD_ID: {
    status: 400,
    message: "시스템 단어 ID 형식이 올바르지 않습니다.",
  },
  INVALID_SYSTEM_WORD_IDS: {
    status: 400,
    message: "시스템 단어 ID 목록이 올바르지 않습니다.",
  },
  // 400 - 필드
  INVALID_EN_TEXT: { status: 400, message: "영단어를 입력해주세요." },
  INVALID_MEANINGS_TYPE: {
    status: 400,
    message: "뜻 목록 형식이 올바르지 않습니다.",
  },
  EMPTY_MEANINGS: { status: 400, message: "뜻을 하나 이상 입력해주세요." },
  INVALID_MEANING_ITEM: {
    status: 400,
    message: "뜻 항목이 올바르지 않습니다.",
  },
  // 404
  USER_WORD_NOT_FOUND: { status: 404, message: "단어를 찾을 수 없습니다." },
  SYSTEM_WORD_NOT_FOUND: {
    status: 404,
    message: "시스템 단어를 찾을 수 없습니다.",
  },
  // 409
  DUPLICATE_WORD: { status: 409, message: "이미 단어장에 있는 단어입니다." },
  // 500 - 시스템 단어는 뜻이 하나 이상 있어야 하는데 없는 경우 (데이터 오류)
  SYSTEM_WORD_MEANINGS_MISSING: {
    status: 500,
    message: "서버 오류가 발생했습니다.",
  },
} as const satisfies ErrorCodeMap;
