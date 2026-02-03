import { Hono } from "hono";
import * as userService from "./user.service.ts";

export const userController = new Hono();

/*
  # GET
  # /user/profile
  # profile image url, user name, email 조회
*/

userController.get("/profile", async (c) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "authorization 헤더가 올바르지 않습니다." }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const profile = await userService.getUserProfile(token);
    return c.json(profile);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZATION") {
      return c.json({ error: "access token 이 유효하지 않습니다." }, 404);
    }
    return c.json({ error: error.message }, 500);
  }
});
