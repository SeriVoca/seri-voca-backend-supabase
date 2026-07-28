// deno-lint-ignore-file
// supabase/functions/api/index.ts

// 1. Hono 프레임워크 가져오기 (Deno는 npm install 없이 URL로 가져옵니다)
import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "supabase";
import { curriculumController } from "@/domains/curriculum/curriculum.controller.ts";
import { wordbookController } from "@/domains/wordbook/wordbook.controller.ts";
import { userController } from "@/domains/user/user.controller.ts";
import { AppError } from "@/shared/errors/app-error.ts";
import { ERROR_CODES } from "@/shared/errors/error-codes.ts";

// supabase 통신 인스턴스 생성
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const app = new Hono().basePath("/api");

// cors 미들웨어 설정
app.use(
  "/*",
  cors({
    origin: "*", // 실제 배포 시에는 프론트엔드 도메인으로 변경 권장
    allowHeaders: ["authorization", "x-client-info", "apikey", "content-type"],
  }),
);

// ✔ OPTIONS 직접 처리 (Preflight 처리 필수!)
app.options("/*", (c) => {
  return c.text("ok");
});

// controller 등록
app.route("curriculums", curriculumController);
app.route("wordbooks", wordbookController);
app.route("user", userController);

// 에러 응답은 AppError 하나만 보고 만든다. code/status/message가 항상 같은 정의에서 나온다
const errorResponse = (c: Context, error: AppError) =>
  c.json({ error: { code: error.code, message: error.message } }, error.status);

// 등록되지 않은 경로
app.notFound((c) => errorResponse(c, new AppError("ROUTE_NOT_FOUND")));

// 에러 응답 단일 창구. 핸들러에서 throw된 에러는 모두 여기로 모인다
app.onError((err, c) => {
  if (err instanceof AppError) {
    // 5xx만 원본을 로그에 남긴다. 4xx는 클라이언트 입력 문제라 로그가 불필요하다
    if (err.status >= 500) {
      console.error(`[${err.code}]`, err.cause ?? err);
    }
    return errorResponse(c, err);
  }

  // AppError가 아니면 예상하지 못한 버그. 내부 정보는 응답에 싣지 않고 로그로만 남긴다
  console.error("[UNHANDLED]", err);
  return errorResponse(c, new AppError("INTERNAL_SERVER_ERROR"));
});

// 런타임 환경에서 서빙
Deno.serve(app.fetch);
