// deno-lint-ignore-file
// supabase/functions/api-server/index.ts

// 1. Hono 프레임워크 가져오기 (Deno는 npm install 없이 URL로 가져옵니다)
import { Hono } from 'jsr:@hono/hono';
import { cors } from 'jsr:@hono/hono/cors';
import { createClient } from "jsr:@supabase/supabase-js";

// supabase 통신 인스턴스 생성
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const app = new Hono().basePath('/api');

// cors 미들웨어 설정
app.use(
  '/*',
  cors({
    origin: '*', // 실제 배포 시에는 프론트엔드 도메인으로 변경 권장
    allowHeaders: ['authorization', 'x-client-info', 'apikey', 'content-type'],
  })
);

// ✔ OPTIONS 직접 처리 (Preflight 처리 필수!)
app.options('/*', (c) => {
  return c.text('ok');
});

/*
  # GET
  # /posts
  # 전체 게시물 조회
*/
app.get('/posts', async (c) => {

  const category = c.req.query("category");

  // query 객체 생성
  let query = supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// 런타임 환경에서 서빙
Deno.serve(app.fetch);