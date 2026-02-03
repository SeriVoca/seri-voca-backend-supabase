import { supabase } from "../../utils/supabase.ts";

export const findProfileById = async (userId: string) => {
  return await supabase
    .from("user")
    .select(`email, nickname, avatar_url`)
    .eq("id", userId)
    .single();
};
