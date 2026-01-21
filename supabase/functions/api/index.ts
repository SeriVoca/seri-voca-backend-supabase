// deno-lint-ignore-file
// supabase/functions/api/index.ts

// 1. Hono 프레임워크 가져오기 (Deno는 npm install 없이 URL로 가져옵니다)
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "supabase";
import { curriculumController } from "@/domains/curriculum/curriculum.controller.ts";
import { wordbookController } from "@/domains/wordbook/wordbook.controller.ts";

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

/*
  # GET
  # /user/profile
  # profile image url, user name, email 조회
*/

app.get("/user/profile", async (c) => {
  // Authorization 헤더에서 token 파싱
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "authorization 헤더가 올바르지 않습니다." }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  // token 으로 user 조회
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    token,
  ); // supabase 로 user 확인

  if (authError || !user) {
    return c.json({ error: "access token 이 유효하지 않습니다." }, 401);
  }

  // user table 에서 프로필 정보 조회
  const { data: profile, error: profileError } = await supabase
    .from("user")
    .select(`
      email,
      nickname,
      avatar_url
      `)
    .eq("id", user.id)
    .single();

  if (profileError) {
    return c.json({ error: profileError.message }, 500);
  }

  // 응답
  return c.json({
    email: profile.email,
    name: profile.nickname,
    profile_image_url: profile.avatar_url,
  });
});

// 런타임 환경에서 서빙
Deno.serve(app.fetch);
