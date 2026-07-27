import { supabase } from "../utils/supabase.ts";
import { AppError } from "@/shared/errors/app-error.ts";

export const getUserId = async (token: string): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  // 원본 인증 오류는 cause에만 담고 응답에는 노출하지 않는다
  if (error || !user) {
    throw new AppError("UNAUTHORIZED", { cause: error });
  }

  return user.id;
};

// middleware
export const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED");
  }

  const token = authHeader.slice("Bearer ".length);

  const userId = await getUserId(token);
  c.set("userId", userId);

  await next();
};
