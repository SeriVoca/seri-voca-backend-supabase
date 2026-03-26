import { Hono } from "hono";
import * as wordbookService from "./wordbook.service.ts";
import * as wordService from "../word/word.service.ts";
import { requireAuth } from "../../auth/auth.service.ts";
import { MeaningInput } from "../word/word.types.ts";
import {
  isNonEmptyString,
  isUuid,
  isValidMeaningInput,
} from "../../utils/validators.ts";

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
  # /wordbooks/:wordbookId/words/system
  # 사용자 단어장에 시스템 단어 생성
*/
wordbookController.post("/:wordbookId/words/system", requireAuth, async (c) => {
  const wordbookId = c.req.param("wordbookId");

  // 시스템 단어 id 확인
  let body: {
    systemWordId: string;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_JSON" }, 400);
  }

  const { systemWordId } = body;

  if (!isUuid(wordbookId) || !isUuid(systemWordId)) {
    return c.json({ error: "INVALID_ID_FORMAT" }, 400);
  }

  try {
    const result = await wordService.copySystemWordToUserWordbook(
      wordbookId,
      systemWordId,
    );
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
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
    enText: string;
    meanings: MeaningInput[];
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

/**
  # PATCH
  # /wordbooks/:wordbookId/words/user
  # 사용자 단어 수정
 */
wordbookController.patch("/:wordbookId/words/user", requireAuth, async (c) => {
  const wordbookId = c.req.param("wordbookId");

  let body: {
    wordId: string;
    enText?: string;
    meanings?: MeaningInput[];
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_JSON" }, 400);
  }

  const { wordId, enText, meanings } = body;

  // ===== 기본 검증 =====

  // 1. wordId, wordbookId 검증
  if (!isUuid(wordId)) {
    return c.json({ error: "INVALID_WORD_ID" }, 400);
  }
  if (!isUuid(wordbookId)) {
    return c.json({ error: "INVALID_WORDBOOK_ID" }, 400);
  }

  // 2. 수정할 값이 하나도 없는 경우 차단
  if (enText === undefined && meanings === undefined) {
    return c.json({ error: "EMPTY_PATCH_BODY" }, 400);
  }

  // 3. enText 검증
  if (enText !== undefined && !isNonEmptyString(enText)) {
    return c.json({ error: "INVALID_EN_TEXT" }, 400);
  }

  // 4. meanings 검증
  if (meanings !== undefined) {
    if (!Array.isArray(meanings)) {
      return c.json({ error: "INVALID_MEANINGS_TYPE" }, 400);
    }

    const hasInvalidMeaning = meanings.some((item) =>
      !isValidMeaningInput(item)
    );
    if (hasInvalidMeaning) {
      return c.json({ error: "INVALID_MEANINGS_ITEM" }, 400);
    }
  }

  try {
    if (enText !== undefined) {
      await wordService.updateUserWord(
        wordbookId,
        wordId,
        enText.trim(),
      );
    }
    if (meanings !== undefined) {
      await wordService.updateUserMeanings(
        wordId,
        meanings,
      );
    }
    const result = await wordService.getUserWordWithMeanings(wordId);

    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message ?? "INTERNAL_SERVER_ERROR" }, 500);
  }
});

/*
  # DELETE
  # /wordbooks/:wordbookId/words/user
  # 사용자 단어 삭제
 */
wordbookController.delete("/:wordbookId/words/user", requireAuth, async (c) => {
  const wordbookId = c.req.param("wordbookId");

  let body: {
    wordId: string;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_JSON" }, 400);
  }

  const { wordId } = body;

  // ===== 기본 검증 =====

  // wordId, wordbookId 검증
  if (!isUuid(wordId)) {
    return c.json({ error: "INVALID_WORD_ID" }, 400);
  }
  if (!isUuid(wordbookId)) {
    return c.json({ error: "INVALID_WORDBOOK_ID" }, 400);
  }

  try {
    await wordService.deleteUserWordWithMeanings(wordId, wordbookId);
    return c.body(null, 204);
  } catch (error: any) {
    // TODO: 논의 - 커스텀 에러 클래스
    console.error("delete error:", error);
    if (error.message === "USER_WORD_NOT_FOUND") {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: error.message ?? "INTERNAL_SERVER_ERROR" }, 500);
  }
});

/*
  # DELETE
  # /wordbooks/:id
  # 사용자 단어장 삭제
*/

wordbookController.delete("/:wordbookId", requireAuth, async (c) => {
  const userId = (c as any).get("userId") as string;
  const wordbookId = c.req.param("wordbookId");

  try {
    await wordbookService.deleteUserWordbook(userId, wordbookId);
    return c.json("ok");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else return c.json({ error: "알 수 없는 오류가 발생했습니다." }, 500);
  }
});
