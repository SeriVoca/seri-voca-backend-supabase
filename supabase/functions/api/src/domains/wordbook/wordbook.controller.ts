import { Hono } from "hono";
import * as wordbookService from "./wordbook.service.ts";
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
  const user_id = (c as any).get("userId") as string;

  let body: { title: string; description: string | null };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_JSON" }, 400);
  }

  const title = body.title?.trim();
  const description = body.description ?? null;

  if (!title) {
    return c.json({ error: "TITLE_REQUIRED" }, 400);
  }

  try {
    const wordbook = await wordbookService.createUserWordbook(
      user_id,
      title,
      description,
    );
    return c.json(wordbook);
  } catch (_error: unknown) {
    return c.json({ error: "INTERNAL_SERVER_ERROR" }, 500);
  }
});

/*
  # DELETE
  # /wordbooks/:id
  # 사용자 단어장 삭제
*/

wordbookController.delete("/:wordbookId", requireAuth, async (c) => {
  const user_id = (c as any).get("userId") as string;

  try {
    // service 호출 - user_id 전달
    // repository 에게 삭제 요청
    // 해당 wordbook 이 요청한 user 가 게시한 것이 맞는지 확인 필요
    return c.json("ok");
  } catch (_error: unknown) {
    return c.json({ error: "INTERNAL_SERVER_ERROR" }, 500);
  }
});
