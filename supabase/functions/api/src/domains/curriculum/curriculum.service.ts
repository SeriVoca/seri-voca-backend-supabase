import * as curriculumRepo from "@/domains/curriculum/curriculum.repository.ts";
import {
  CurriculumWordbook,
  CurriculumWordbookDTO,
  CurriculumWordbookWithBookRow,
} from "./curriculum.types.ts";

export class CurriculumMapper {
  static toDomain(row: CurriculumWordbookWithBookRow): CurriculumWordbook {
    return {
      orderIndex: row.order_index,
      wordbookId: row.wordbook.id,
      title: row.wordbook.title,
      description: row.wordbook.description,
    };
  }

  static toDTO(domain: CurriculumWordbook): CurriculumWordbookDTO {
    return {
      order_index: domain.orderIndex,
      id: domain.wordbookId,
      title: domain.title,
      description: domain.description,
    };
  }
}

// 기본 커리큘럼의 단어장 목록 조회
export const getDefaultWordbooks = async (): Promise<
  CurriculumWordbookDTO[]
> => {
  // 1. 커리큘럼 id 조회
  const { data: curriculum, error: currError } = await curriculumRepo
    .findHomeCurriculumId();
  if (currError) throw new Error(currError.message);
  if (!curriculum) throw new Error("DEFAULT_CURRICULUM_NOT_FOUND");

  // 2. 단어장 목록 조회
  const { data: list, error: listError } = await curriculumRepo
    .findWordbooksByCurriculumId(curriculum.id);
  if (listError) throw new Error(listError.message);

  // 3. 데이터 변환 (Refine)
  return (list || [])
    .map((row) => CurriculumMapper.toDomain(row))
    .map((domain) => CurriculumMapper.toDTO(domain));
};
