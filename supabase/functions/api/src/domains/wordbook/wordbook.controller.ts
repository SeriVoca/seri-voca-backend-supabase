import { Hono } from "hono";
import * as wordbookService from "./wordbook.service.ts";
import * as wordService from "../word/word.service.ts";
import { supabase } from "../../utils/supabase.ts";
import { requireAuth } from "../../auth/auth.service.ts";
import { CreateUserMeaningInput } from "../word/word.types.ts";

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
  # POST
  # /wordbooks/:wordbookId/words/user
  # 사용자 단어장에 사용자 단어 생성
*/
wordbookController.post("/:wordbookId/words/user", requireAuth, async (c) => {
  const wordbookId = c.req.param("wordbookId");

  let body: {
    enText?: string;
    meanings?: CreateUserMeaningInput[];
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_JSON" }, 400);
  }

  const { enText, meanings } = body;

  // ===== 기본 검증 =====

  if (!wordbookId || typeof wordbookId !== "string") {
    return c.json({ error: "INVALID_WORDBOOK_ID" }, 400);
  }
  if (!enText || typeof enText !== "string" || enText.trim().length === 0) {
    return c.json({ error: "INVALID_EN_TEXT" }, 400);
  }
  if (!Array.isArray(meanings) || meanings.length === 0) {
    return c.json({ error: "INVALID_MEANINGS_ARRAY" }, 400);
  }

  for (const m of meanings) {
    if (
      !m ||
      typeof m.partOfSpeech !== "string" ||
      typeof m.meaning !== "string" ||
      m.meaning.trim().length === 0
    ) {
      return c.json({ error: "INVALID_MEANING_ITEM" }, 400);
    }
  }

  try {
    const result = await wordService.createUserWordWithMeanings(
      wordbookId,
      enText.trim(),
      meanings.map((m) => ({
        partOfSpeech: m.partOfSpeech,
        meaning: m.meaning.trim(),
      })),
    );

    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
