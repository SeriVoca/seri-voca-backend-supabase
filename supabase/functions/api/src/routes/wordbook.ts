import { Hono } from "hono";
import * as wordbookService from "@/services/wordbookService.ts";

export const wordbookRouter = new Hono();

wordbookRouter.get("/default", async (c) => {
  try {
    const result = await wordbookService.getDefaultWordbooks();
    return c.json(result);
  } catch (error: any) {
    if (error.message === "DEFAULT_CURRICULUM_NOT_FOUND") {
      return c.json({ error: "기본 커리큘럼을 찾을 수 없습니다." }, 404);
    }
    return c.json({ error: error.message }, 500);
  }
});