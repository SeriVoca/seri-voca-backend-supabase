import * as repo from "@/repositories/wordbookRepository.ts";

export interface CurriculumWordbookRow {
  order_index: number;
  wordbook: {
    id: number;
    title: string;
    description: string | null;
  };
}

export const getDefaultWordbooks = async () => {
  // 1. 커리큘럼 조회
  const { data: curriculum, error: currError } = await repo.findHomeCurriculumId();
  if (currError) throw new Error(currError.message);
  if (!curriculum) throw new Error("DEFAULT_CURRICULUM_NOT_FOUND");

  // 2. 단어장 목록 조회
  const { data: list, error: listError } = await repo.findWordbooksByCurriculumId(curriculum.id);
  if (listError) throw new Error(listError.message);

  // 3. 데이터 변환 (Refine)
  return (list || []).map((row: CurriculumWordbookRow) => ({
    id: row.wordbook.id,
    title: row.wordbook.title,
    description: row.wordbook.description,
    order_index: row.order_index,
  }));
};