import { Hono } from "hono";
import * as wordbookService from "./wordbook.service.ts";

export const wordbookController = new Hono();

/*
  # GET
  # /wordbook/:id
  # 단어장의 단어 조회
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