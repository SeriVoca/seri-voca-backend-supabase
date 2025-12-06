// deno-lint-ignore-file
// supabase/functions/api-server/index.ts

// 1. Hono 프레임워크 가져오기 (Deno는 npm install 없이 URL로 가져옵니다)
import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { createClient } from "jsr:@supabase/supabase-js";

// supabase 통신 인스턴스 생성
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const app = new Hono().basePath("/api");

// cors 미들웨어 설정
app.use(
  "/*",
  cors({
    origin: "*", // 실제 배포 시에는 프론트엔드 도메인으로 변경 권장
    allowHeaders: ["authorization", "x-client-info", "apikey", "content-type"],
  })
);

// ✔ OPTIONS 직접 처리 (Preflight 처리 필수!)
app.options("/*", (c) => {
  return c.text("ok");
});

/*
  # GET
  # /wordbooks/default
  # 전체 게시물 조회
*/
app.get("/wordbooks/default", async (c) => {
  // 1번 커리큘럼에 포함된 단어장 리스트 반환
  const { data: curriculum_data, error: curriculum_error } = await supabase
    .from("curriculum")
    .select("id")
    .single(); // 결과가 딱 1개일 때 사용 (0개거나 2개 이상이면 에러 발생)

  // 예외처리
  if (curriculum_error) {
    return c.json({ error: curriculum_error.message }, 500);
  }

  // curriculum data 가 없을 경우 예외 처리
  if (!curriculum_data.id) {
    return c.json([]);
  }

  const curriuclum_id = curriculum_data?.id;

  const { data, error } = await supabase
    .from("curriculum_wordbook")
    .select(
      `
      order_index,
      wordbook (
        id,
        title,
        description
      )
    `
    )
    .eq("curriculum_id", curriuclum_id)
    .order("order_index", { ascending: true });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  const result = data.map((row) => ({
    wordbook: row.wordbook,
    order_index: row.order_index,
  }));

  return c.json(result);
});

// 런타임 환경에서 서빙
Deno.serve(app.fetch);
