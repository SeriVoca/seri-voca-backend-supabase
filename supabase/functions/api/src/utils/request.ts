import type { Context } from "hono";
import { AppError } from "@/shared/errors/app-error.ts";

/**
 * JSON 본문을 파싱한다. 파싱 실패와 객체가 아닌 본문을 모두 INVALID_JSON으로 막는다.
 *
 * c.req.json()은 "null" / "123" / "\"str\"" 같은 JSON 스칼라에서는 throw하지 않는다.
 * 가드가 없으면 파싱은 통과하고 그다음 프로퍼티 접근(body.title, 구조분해)에서
 * TypeError가 나 [UNHANDLED] 500으로 샌다.
 */
export const parseJsonBody = async <T>(c: Context): Promise<T> => {
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    throw new AppError("INVALID_JSON");
  }

  if (typeof body !== "object" || body === null) {
    throw new AppError("INVALID_JSON");
  }

  return body as T;
};
