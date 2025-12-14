// deno-lint-ignore-file
// supabase/functions/api-server/index.ts

// 1. Hono 프레임워크 가져오기 (Deno는 npm install 없이 URL로 가져옵니다)
import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { createClient } from "jsr:@supabase/supabase-js";

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

/*
  # GET
  # /wordbooks/default
  # 전체 게시물 조회
*/

interface CurriculumResponse {
  order_index: number; // or any based on your DB
  wordbook: {
    id: number;
    title: string;
    description: string | null;
  }; // ⭐ 배열[]이 아니라 단일 객체로 선언
}

app.get("/wordbooks/default", async (c) => {
  // 1. 카테고리가 'HOME'인 커리큘럼의 ID 조회
  const { data: curriculum_data, error: curriculum_error } = await supabase
    .from("curriculum")
    .select("id")
    .eq("category", "HOME") // ⭐ [추가됨] category가 'HOME'인 것만 필터링
    .maybeSingle(); // ⭐ single() 대신 maybeSingle() 사용 (데이터 없으면 null 반환)

  // DB 에러 처리
  if (curriculum_error) {
    return c.json({ error: curriculum_error.message }, 500);
  }

  // 'HOME' 커리큘럼이 없는 경우 처리
  if (!curriculum_data) {
    return c.json({ error: "Default curriculum not found" }, 404);
  }

  const curriculum_id = curriculum_data.id;

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
    `,
    )
    .eq("curriculum_id", curriculum_id)
    .order("order_index", { ascending: true })
    .overrideTypes<CurriculumResponse[], { merge: false }>();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  // refine
  const result = data.map((row) => ({
    id: row.wordbook.id,
    title: row.wordbook.title,
    description: row.wordbook.description,
    order_index: row.order_index,
  }));

  return c.json(result);
});

// 런타임 환경에서 서빙
Deno.serve(app.fetch);
