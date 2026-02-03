import * as curriculumRepo from "@/domains/curriculum/curriculum.repository.ts";
import {
  CurriculumWordbook,
  CurriculumWordbookDTO,
  CurriculumWordbookWithWordbookRow,
} from "./curriculum.types.ts";

export class CurriculumMapper {
  static toDomain(row: CurriculumWordbookWithWordbookRow): CurriculumWordbook {
    return {
      orderIndex: row.order_index,
      wordbook: {
        id: row.wordbook.id,
        title: row.wordbook.title,
        description: row.wordbook.description,
        type: row.wordbook.type,
      },
    };
  }

  static toDTO(domain: CurriculumWordbook): CurriculumWordbookDTO {
    return {
      order_index: domain.orderIndex,
      wordbook: {
        id: domain.wordbook.id,
        title: domain.wordbook.title,
        description: domain.wordbook.description,
        type: domain.wordbook.type,
      },
    };
  }
}

// 기본 커리큘럼의 단어장 목록 조회
export const getDefaultWordbooks = async (): Promise<
  CurriculumWordbookDTO[]
> => {
  // 1. 커리큘럼 id 조회
  const curriculum_id = await curriculumRepo
    .findHomeCurriculumId();

  // 2. 단어장 목록 조회
  const wordbook_list = await curriculumRepo
    .findWordbooksByCurriculumId(curriculum_id);

  // 3. 데이터 변환 (Refine)
  return (wordbook_list || [])
    .map((row) => CurriculumMapper.toDomain(row))
    .map((domain) => CurriculumMapper.toDTO(domain));
};
