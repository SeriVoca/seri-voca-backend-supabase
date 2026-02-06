import { Hono } from "hono";
import * as wordbookService from "./wordbook.service.ts";
import { supabase } from "../../utils/supabase.ts";
import { requireAuth } from "../../auth/auth.service.ts";

export const wordbookController = new Hono();

/*
  # GET
  # /wordbook/:id
  # 단어장 id로 단어 조회
*/
wordbookController.get("/:id", async (c) => {
  const wordbook_id = c.req.param("id");
  try {
    const result = await wordbookService.getWordsInWordbook(wordbook_id);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/*
  # POST
  # /wordbooks
  # 사용자 단어장 생성
*/
wordbookController.post("/", requireAuth, async (c) => {
  // 서비스 로직 호출
  const user_id = (c as any).get("userId");

  const body = await c.req.json<{
    title: string;
    description: string | null;
  }>();

  const { title, description } = body;

  try {
    const wordbook = await wordbookService.createUserWordbook(
      user_id,
      title,
      description,
    );
    return c.json(wordbook);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
