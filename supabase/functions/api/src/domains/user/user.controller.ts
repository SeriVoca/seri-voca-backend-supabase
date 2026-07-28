import { Hono } from "hono";
import * as userService from "./user.service.ts";
import { requireAuth } from "../../auth/auth.service.ts";

export const userController = new Hono();

/*
  # GET
  # /user/profile
  # profile image url, user name, email 조회
*/

// 에러는 throw만 하고 index.ts의 onError가 응답으로 변환한다
userController.get("/profile", requireAuth, async (c) => {
  // requireAuth에서 인증 및 userId 추출
  const userId = (c as any).get("userId") as string;

  const profile = await userService.getUserProfile(userId);
  return c.json(profile);
});
