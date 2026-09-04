import { Hono } from "hono";
import * as curriculumService from "./curriculum.service.ts";
import { requireAuth } from "../../auth/auth.service.ts";

export const curriculumController = new Hono();

/*
  # GET
  # /curriculum/default
  # 기본 커리큘럼의 단어장 목록 조회
*/

// 에러는 throw만 하고 index.ts의 onError가 응답으로 변환한다
curriculumController.get("/default", requireAuth, async (c) => {
  const result = await curriculumService.getDefaultWordbooks();
  return c.json(result);
});
