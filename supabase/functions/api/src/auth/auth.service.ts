import { supabase } from "../utils/supabase.ts";

export const getUserId = async (token: string): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  return user.id;
};

// middleware
export const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "UNAUTHORIZED" }, 401);
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const userId = await getUserId(token);
    c.set("userId", userId);
    await next();
  } catch (error: any) {
    console.error("requireAuth error:", error);
    return c.json({ error: "UNAUTHORIZED" }, 401);
  }
};
