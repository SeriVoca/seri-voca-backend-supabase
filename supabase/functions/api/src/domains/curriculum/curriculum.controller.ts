import { Hono } from "hono";
import * as curriculumService from "./curriculum.service.ts";

export const curriculumController = new Hono();

/*
  # GET
  # /curriculum/default
  # 기본 커리큘럼의 단어장 목록 조회
*/
curriculumController.get("/default", async (c) => {
  try {
    const result = await curriculumService.getDefaultWordbooks();
    return c.json(result);
  } catch (error: any) {
    if (error.message === "DEFAULT_CURRICULUM_NOT_FOUND") {
      return c.json({ error: "기본 커리큘럼을 찾을 수 없습니다." }, 404);
    }
    return c.json({ error: error.message }, 500);
  }
});
