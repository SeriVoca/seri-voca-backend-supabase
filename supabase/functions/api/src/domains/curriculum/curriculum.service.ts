import * as curriculumRepo from "@/domains/curriculum/curriculum.repository.ts";
import { AppError } from "@/shared/errors/app-error.ts";
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
  // 정책상 HOME 커리큘럼은 정확히 1건이어야 한다. 0건이든 2건 이상이든 데이터 오류다
  const home_curriculum_ids = await curriculumRepo.findHomeCurriculumIds();
  if (home_curriculum_ids.length !== 1) {
    throw new AppError("DEFAULT_CURRICULUM_MISCONFIGURED", {
      cause: new Error(
        `HOME 커리큘럼이 ${home_curriculum_ids.length}건입니다 (정책: 1건)`,
      ),
    });
  }
  const curriculum_id = home_curriculum_ids[0];

  // 2. 단어장 목록 조회
  const wordbook_list = await curriculumRepo
    .findWordbooksByCurriculumId(curriculum_id);

  // 3. 데이터 변환 (Refine)
  return wordbook_list
    .map((row) => CurriculumMapper.toDomain(row))
    .map((domain) => CurriculumMapper.toDTO(domain));
};
