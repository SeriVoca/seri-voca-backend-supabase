import { supabase } from "../../utils/supabase.ts";
import { toAppError } from "@/shared/errors/db-error.ts";
import { CurriculumWordbookWithWordbookRow } from "./curriculum.types.ts";

// "HOME 커리큘럼은 정확히 1건"은 도메인 규칙이므로 조회 결과를 그대로 넘기고
// 건수 판단은 서비스가 한다. (0건과 2건 이상을 같은 규칙 위반으로 다루기 위함)
export const findHomeCurriculumIds = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("curriculum")
    .select("id")
    .eq("category", "HOME")
    .overrideTypes<{ id: string }[], { merge: false }>();

  if (error) throw toAppError(error);

  return data.map((row) => row.id);
};

// 커리큘럼 id로 단어장 목록 조회
export const findWordbooksByCurriculumId = async (
  curriculumId: string,
): Promise<CurriculumWordbookWithWordbookRow[]> => {
  const { data, error } = await supabase
    .from("curriculum_wordbook")
    .select(`
      order_index,
      wordbook (id, title, description, type)
    `)
    .eq("curriculum_id", curriculumId)
    .order("order_index", { ascending: true })
    .overrideTypes<CurriculumWordbookWithWordbookRow[], { merge: false }>();

  if (error) throw toAppError(error);

  return data;
};
