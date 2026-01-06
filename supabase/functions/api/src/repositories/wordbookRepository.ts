import { supabase } from "@/utils/supabase.ts";
import { CurriculumWordbookRow } from "../services/wordbookService.ts";

export const findHomeCurriculumId = async () => {
  return await supabase
    .from("curriculum")
    .select("id")
    .eq("category", "HOME")
    .maybeSingle();
};

export const findWordbooksByCurriculumId = async (curriculumId: number) => {
  return await supabase
    .from("curriculum_wordbook")
    .select(`
      order_index,
      wordbook (id, title, description)
    `)
    .eq("curriculum_id", curriculumId)
    .order("order_index", { ascending: true })
    .overrideTypes<CurriculumWordbookRow[], { merge: false }>();
};