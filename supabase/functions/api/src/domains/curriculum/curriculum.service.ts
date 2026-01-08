import * as curriculumRepo from "@/domains/curriculum/curriculum.repository.ts";
import * as wordbookRepo from "@/domains/wordbook/wordbook.repository.ts";
import { CurriculumWordbookRow } from "../wordbook/wordbook.types.ts";

// 기본 커리큘럼의 단어장 목록 조회
export const getDefaultWordbooks = async () => {
  // 1. 커리큘럼 id 조회
  const { data: curriculum, error: currError } = await curriculumRepo
    .findHomeCurriculumId();
  if (currError) throw new Error(currError.message);
  if (!curriculum) throw new Error("DEFAULT_CURRICULUM_NOT_FOUND");

  // 2. 단어장 목록 조회
  const { data: list, error: listError } = await wordbookRepo
    .findWordbooksByCurriculumId(curriculum.id);
  if (listError) throw new Error(listError.message);

  // 3. 데이터 변환 (Refine)
  return (list || []).map((row: CurriculumWordbookRow) => ({
    id: row.wordbook.id,
    title: row.wordbook.title,
    description: row.wordbook.description,
    order_index: row.order_index,
  }));
};
