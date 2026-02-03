// deno-lint-ignore-file
// supabase/functions/api/index.ts

// 1. Hono 프레임워크 가져오기 (Deno는 npm install 없이 URL로 가져옵니다)
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "supabase";
import { curriculumController } from "@/domains/curriculum/curriculum.controller.ts";
import { wordbookController } from "@/domains/wordbook/wordbook.controller.ts";
import { userController } from "@/domains/user/user.controller.ts";

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

// 런타임 환경에서 서빙
Deno.serve(app.fetch);
