import { createClient } from "supabase";

export const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // 서버 측 로직이므로 Service Role 사용
);