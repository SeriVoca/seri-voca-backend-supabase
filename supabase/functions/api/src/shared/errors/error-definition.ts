import type { ContentfulStatusCode } from "hono/utils/http-status";

// 에러 코드 정의의 공통 형태.
// error-codes.ts가 도메인별 코드 파일을 import하므로, 순환 참조를 피하기 위해
// 도메인 모듈을 참조하지 않는 leaf 모듈로 분리한다.

export interface ErrorDefinition {
  // 본문이 있는 응답에만 쓰이므로 204/304 등은 타입 단계에서 배제된다
  status: ContentfulStatusCode;
  message: string;
}

export type ErrorCodeMap = Record<string, ErrorDefinition>;
