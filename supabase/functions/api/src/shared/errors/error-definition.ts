// 에러 코드 정의의 공통 형태.
// error-codes.ts가 도메인별 코드 파일을 import하므로, 순환 참조를 피하기 위해
// 아무것도 import하지 않는 leaf 모듈로 분리한다.

export interface ErrorDefinition {
  status: number;
  message: string;
}

export type ErrorCodeMap = Record<string, ErrorDefinition>;
