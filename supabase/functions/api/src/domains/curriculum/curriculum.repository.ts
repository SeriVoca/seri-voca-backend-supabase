import { supabase } from "../../utils/supabase.ts";

export const findHomeCurriculumId = async () => {
  return await supabase
    .from("curriculum")
    .select("id")
    .eq("category", "HOME")
    .maybeSingle();
};
