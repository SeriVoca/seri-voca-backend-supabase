import { supabase } from "../../utils/supabase.ts";
import { toAppError } from "@/shared/errors/db-error.ts";
import { UserProfileRow } from "./user.types.ts";

// 인증은 통과했지만 user 행이 없을 수 있으므로 maybeSingle을 쓴다.
// 0건(null)을 어떻게 해석할지는 서비스가 판단한다.
export const findProfileById = async (
  userId: string,
): Promise<UserProfileRow | null> => {
  const { data, error } = await supabase
    .from("user")
    .select(`id, email, nickname, avatar_url`)
    .eq("id", userId)
    .maybeSingle<UserProfileRow>();

  if (error) throw toAppError(error);

  return data;
};
