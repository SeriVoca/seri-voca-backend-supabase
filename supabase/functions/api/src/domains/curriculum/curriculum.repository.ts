import { supabase } from "../../utils/supabase.ts";
import { CurriculumWordbookWithBookRow } from "./curriculum.types.ts";

export const findHomeCurriculumId = async () => {
  return await supabase
    .from("curriculum")
    .select("id")
    .eq("category", "HOME")
    .maybeSingle();
};

// 커리큘럼 id로 단어장 목록 조회
export const findWordbooksByCurriculumId = async (curriculumId: number) => {
  return await supabase
    .from("curriculum_wordbook")
    .select(`
      order_index,
      wordbook (id, title, description)
    `)
    .eq("curriculum_id", curriculumId)
    .order("order_index", { ascending: true })
    .overrideTypes<CurriculumWordbookWithBookRow[], { merge: false }>();
};
