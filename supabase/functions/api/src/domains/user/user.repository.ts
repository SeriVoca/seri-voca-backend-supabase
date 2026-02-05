import { supabase } from "../../utils/supabase.ts";
import { UserProfileRow } from "./user.types.ts";

export const findProfileById = async (userId: string): Promise<UserProfileRow> => {
  const { data, error } = await supabase
    .from("user")
    .select(`id, email, nickname, avatar_url`)
    .eq("id", userId)
    .single()
    .overrideTypes<UserProfileRow>();

  if (error) throw error;

  console.log("[REPO] data: ", data);

  return data;
};
