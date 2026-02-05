import { supabase } from "../../utils/supabase.ts";
import { CurriculumWordbookWithWordbookRow } from "./curriculum.types.ts";

export const findHomeCurriculumId = async (): Promise<string> => {
  const { data, error } = await supabase
    .from("curriculum")
    .select("id")
    .eq("category", "HOME")
    .maybeSingle<{ id: string }>();

  if (error) throw error;
  if (!data) throw new Error("HOME 커리큘럼이 존재하지 않습니다.");

  return data.id;
};

// 커리큘럼 id로 단어장 목록 조회
export const findWordbooksByCurriculumId = async (curriculumId: string): Promise<CurriculumWordbookWithWordbookRow[]> => {
  const { data, error } = await supabase
    .from("curriculum_wordbook")
    .select(`
      order_index,
      wordbook (id, title, description, type)
    `)
    .eq("curriculum_id", curriculumId)
    .order("order_index", { ascending: true })
    .overrideTypes<CurriculumWordbookWithWordbookRow[], { merge: false }>();

  if (error) throw error;

  return data;
};
