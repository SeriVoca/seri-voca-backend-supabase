export const ERROR_CODES = {
  // 400
  INVALID_JSON: { status: 400, message: "요청 본문이 올바른 JSON이 아닙니다." },
  VALIDATION_FAILED: { status: 400, message: "요청 값이 올바르지 않습니다." },
  EMPTY_PATCH_BODY: { status: 400, message: "수정할 값이 없습니다." },
  // 401 / 403
  UNAUTHORIZED: { status: 401, message: "인증이 필요합니다." },
  FORBIDDEN: { status: 403, message: "권한이 없습니다." },
  // 404
  WORDBOOK_NOT_FOUND: { status: 404, message: "단어장을 찾을 수 없습니다." },
  USER_WORD_NOT_FOUND: { status: 404, message: "단어를 찾을 수 없습니다." },
  SYSTEM_WORD_NOT_FOUND: { status: 404, message: "시스템 단어를 찾을 수 없습니다." },
  DEFAULT_CURRICULUM_NOT_FOUND: {
    status: 404,
    message: "기본 커리큘럼을 찾을 수 없습니다.",
  },
  // 409
  DUPLICATE_WORD: { status: 409, message: "이미 단어장에 있는 단어입니다." },
  // 500
  INVALID_REFERENCE: { status: 500, message: "서버 오류가 발생했습니다." },
  INTERNAL_SERVER_ERROR: { status: 500, message: "서버 오류가 발생했습니다." },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
