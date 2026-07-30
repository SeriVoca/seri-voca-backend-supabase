import { Hono } from "hono";
import * as wordbookService from "./wordbook.service.ts";
import * as wordService from "../word/word.service.ts";
import { requireAuth } from "../../auth/auth.service.ts";
import { AppError } from "@/shared/errors/app-error.ts";
import { MeaningInput } from "../word/word.types.ts";
import {
  isNonEmptyString,
  isUuid,
  isValidMeaningInput,
} from "../../utils/validators.ts";

export const wordbookController = new Hono();

// 에러는 throw만 하고 index.ts의 onError가 응답으로 변환한다

/**
  # GET
  # /wordbooks/user
  # 사용자 단어장 목록 조회
 */
wordbookController.get("/user", requireAuth, async (c) => {
  const user_id = (c as any).get("userId") as string;

  const wordbooks = await wordbookService.getUserWordbooks(user_id);
  return c.json(wordbooks);
});

/*
  # GET
  # /wordbooks/:id
  # 단어장 id로 단어 조회
*/
wordbookController.get("/:id", async (c) => {
  const wordbook_id = c.req.param("id");

  if (!isUuid(wordbook_id)) {
    throw new AppError("INVALID_WORDBOOK_ID");
  }

  const result = await wordbookService.getWordsInWordbook(wordbook_id);
  return c.json(result);
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
    throw new AppError("INVALID_JSON");
  }

  const title = body.title?.trim();
  const description = body.description ?? null;

  if (!title) {
    throw new AppError("TITLE_REQUIRED");
  }

  const wordbook = await wordbookService.createUserWordbook(
    user_id,
    title,
    description,
  );
  return c.json(wordbook);
});

/*
  # POST
  # /wordbooks/:wordbookId/words/system
  # 사용자 단어장에 시스템 단어 생성
*/
wordbookController.post("/:wordbookId/words/system", requireAuth, async (c) => {
  const wordbookId = c.req.param("wordbookId");

  let body: {
    systemWordId: string;
  };

  try {
    body = await c.req.json();
  } catch {
    throw new AppError("INVALID_JSON");
  }

  const { systemWordId } = body;

  if (!isUuid(wordbookId)) {
    throw new AppError("INVALID_WORDBOOK_ID");
  }
  if (!isUuid(systemWordId)) {
    throw new AppError("INVALID_SYSTEM_WORD_ID");
  }

  const result = await wordService.copySystemWordToUserWordbook(
    wordbookId,
    systemWordId,
  );
  return c.json(result, 201);
});

/*
  # POST
  # /wordbooks/:wordbookId/words/system/bulk
  # 사용자 단어장에 시스템 단어 여러 개 생성
*/
wordbookController.post(
  "/:wordbookId/words/system/bulk",
  requireAuth,
  async (c) => {
    const wordbookId = c.req.param("wordbookId");

    let body: {
      systemWordIds: string[];
    };

    try {
      body = await c.req.json();
    } catch {
      throw new AppError("INVALID_JSON");
    }

    const { systemWordIds } = body;

    if (!isUuid(wordbookId)) {
      throw new AppError("INVALID_WORDBOOK_ID");
    }
    if (
      !Array.isArray(systemWordIds) ||
      systemWordIds.length === 0 ||
      systemWordIds.some((id) => !isUuid(id))
    ) {
      throw new AppError("INVALID_SYSTEM_WORD_IDS");
    }

    const results = await wordService.copySystemWordsToUserWordbook(
      wordbookId,
      systemWordIds,
    );
    return c.json(results, 201);
  },
);

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
    throw new AppError("INVALID_JSON");
  }

  const { enText, meanings } = body;

  // ===== 기본 검증 =====

  if (!isUuid(wordbookId)) {
    throw new AppError("INVALID_WORDBOOK_ID");
  }
  if (!isNonEmptyString(enText)) {
    throw new AppError("INVALID_EN_TEXT");
  }
  if (!Array.isArray(meanings)) {
    throw new AppError("INVALID_MEANINGS_TYPE");
  }
  if (meanings.length === 0) {
    throw new AppError("EMPTY_MEANINGS");
  }
  if (meanings.some((m) => !isValidMeaningInput(m))) {
    throw new AppError("INVALID_MEANING_ITEM");
  }

  const result = await wordService.createUserWordWithMeanings(
    wordbookId,
    enText.trim(),
    meanings.map((m) => ({
      partOfSpeech: m.partOfSpeech,
      meaning: m.meaning.trim(),
    })),
  );

  return c.json(result, 201);
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
    throw new AppError("INVALID_JSON");
  }

  const { wordId, enText, meanings } = body;

  // ===== 기본 검증 =====

  // 1. wordId, wordbookId 검증
  if (!isUuid(wordId)) {
    throw new AppError("INVALID_WORD_ID");
  }
  if (!isUuid(wordbookId)) {
    throw new AppError("INVALID_WORDBOOK_ID");
  }

  // 2. 수정할 값이 하나도 없는 경우 차단
  if (enText === undefined && meanings === undefined) {
    throw new AppError("EMPTY_PATCH_BODY");
  }

  // 3. enText 검증
  if (enText !== undefined && !isNonEmptyString(enText)) {
    throw new AppError("INVALID_EN_TEXT");
  }

  // 4. meanings 검증
  if (meanings !== undefined) {
    if (!Array.isArray(meanings)) {
      throw new AppError("INVALID_MEANINGS_TYPE");
    }

    const hasInvalidMeaning = meanings.some((item) =>
      !isValidMeaningInput(item)
    );
    if (hasInvalidMeaning) {
      throw new AppError("INVALID_MEANING_ITEM");
    }
  }

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
    throw new AppError("INVALID_JSON");
  }

  const { wordId } = body;

  // ===== 기본 검증 =====

  if (!isUuid(wordId)) {
    throw new AppError("INVALID_WORD_ID");
  }
  if (!isUuid(wordbookId)) {
    throw new AppError("INVALID_WORDBOOK_ID");
  }

  await wordService.deleteUserWordWithMeanings(wordId, wordbookId);
  return c.body(null, 204);
});

/*
  # DELETE
  # /wordbooks/:wordbookId/words/user/bulk
  # 사용자 단어 여러 개 삭제
 */
wordbookController.delete(
  "/:wordbookId/words/user/bulk",
  requireAuth,
  async (c) => {
    const wordbookId = c.req.param("wordbookId");

    let body: {
      wordIds: string[];
    };

    try {
      body = await c.req.json();
    } catch {
      throw new AppError("INVALID_JSON");
    }

    const { wordIds: userWordIds } = body;

    if (!isUuid(wordbookId)) {
      throw new AppError("INVALID_WORDBOOK_ID");
    }
    if (
      !Array.isArray(userWordIds) ||
      userWordIds.length === 0 ||
      userWordIds.some((id) => !isUuid(id))
    ) {
      throw new AppError("INVALID_USER_WORD_IDS");
    }

    const deletedWordIds = await wordService.deleteUserWordsWithMeanings(
      userWordIds,
      wordbookId,
    );
    return c.json({ wordIds: deletedWordIds }, 200);
  },
);

/*
  # DELETE
  # /wordbooks/:id
  # 사용자 단어장 삭제
*/
wordbookController.delete("/:wordbookId", requireAuth, async (c) => {
  const userId = (c as any).get("userId") as string;
  const wordbookId = c.req.param("wordbookId");

  if (!isUuid(wordbookId)) {
    throw new AppError("INVALID_WORDBOOK_ID");
  }

  await wordbookService.deleteUserWordbook(userId, wordbookId);
  return c.json("ok");
});
