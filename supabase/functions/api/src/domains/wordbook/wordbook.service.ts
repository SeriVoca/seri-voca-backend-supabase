import * as wordbookRepo from "../wordbook/wordbook.repository.ts";
import { AppError } from "@/shared/errors/app-error.ts";
import {
  SystemWordbookItemRow,
  UserWordbookItemRow,
  WordbookDTO,
  WordbookRow,
  WordbookWord,
} from "./wordbook.types.ts";
import { WordDTO } from "../word/word.types.ts";

export class SystemWordbookMapper {
  static toDomain(row: SystemWordbookItemRow): WordbookWord | null {
    if (!row.system_word) return null;
    const { system_word: word } = row;
    return {
      source: row.source,
      orderIndex: row.order_index,
      word: {
        id: word.id,
        text: word.en_text,
        meanings: word.meanings.map((m) => ({
          partOfSpeech: m.part_of_speech,
          meaning: m.meaning,
          orderIndex: m.order_index,
        })),
      },
    };
  }

  static toDTO(domain: WordbookWord): WordDTO {
    return {
      id: domain.word.id,
      en_text: domain.word.text,
      order_index: domain.orderIndex,
      meanings: domain.word.meanings
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((m) => ({
          part_of_speech: m.partOfSpeech,
          meaning: m.meaning,
          order_index: m.orderIndex,
        })),
    };
  }
}

export class UserWordbookMapper {
  static toDomain(row: UserWordbookItemRow): WordbookWord | null {
    if (!row.word) return null;
    const { word } = row;
    return {
      source: row.source,
      orderIndex: row.order_index,
      word: {
        id: word.id,
        text: word.en_text,
        meanings: word.meanings.map((m) => ({
          partOfSpeech: m.part_of_speech,
          meaning: m.meaning,
          orderIndex: m.order_index,
        })),
      },
    };
  }

  static toDTO(domain: WordbookWord): WordDTO {
    return {
      id: domain.word.id,
      en_text: domain.word.text,
      order_index: domain.orderIndex,
      meanings: domain.word.meanings
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((m) => ({
          part_of_speech: m.partOfSpeech,
          meaning: m.meaning,
          order_index: m.orderIndex,
        })),
    };
  }

  static mapWordbookRowToWordbookDTO(row: WordbookRow): WordbookDTO {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
    };
  }
}

export const mapWordbookDtoToWordbookRow = (
  wordbookRow: WordbookRow,
): WordbookDTO => {
  return {
    id: wordbookRow.id,
    title: wordbookRow.title,
    description: wordbookRow.description,
    type: wordbookRow.type,
  };
};

// 사용자 단어장 목록 조회
export const getUserWordbooks = async (
  user_id: string,
): Promise<WordbookDTO[]> => {
  const wordbookRows = await wordbookRepo.findUserWordbooks(user_id);

  return wordbookRows.map(mapWordbookDtoToWordbookRow);
};

// 단어장 id로 단어 조회
export const getWordsInWordbook = async (
  wordbook_id: string,
): Promise<WordDTO[]> => {
  const source = await wordbookRepo.getSourceByWordbookId(wordbook_id);
  if (!source) throw new AppError("WORDBOOK_NOT_FOUND");

  if (source === "SYSTEM") {
    const words = await wordbookRepo.findSystemWordsByWordbookId(wordbook_id);

    return words.map((row) => SystemWordbookMapper.toDomain(row))
      .filter((domain) => domain !== null).map((domain) =>
        SystemWordbookMapper.toDTO(domain!)
      );
  } else if (source === "USER") {
    const words = await wordbookRepo.findUserWordByWordbookId(wordbook_id);

    return words.map((row) => UserWordbookMapper.toDomain(row))
      .filter((domain) => domain !== null).map((domain) =>
        UserWordbookMapper.toDTO(domain!)
      );
  } else {
    // type이 SYSTEM/USER 외의 값인 경우. 스키마상 있어선 안 되는 데이터 오류다
    throw new AppError("WORDBOOK_TYPE_MISCONFIGURED", {
      cause: new Error(
        `단어장(${wordbook_id})의 type이 올바르지 않습니다: ${source}`,
      ),
    });
  }
};

// 사용자 단어장 생성
export const createUserWordbook = async (
  user_id: string,
  title: string,
  description: string | null,
): Promise<WordbookDTO> => {
  const wordbook = await wordbookRepo.createWordbook(
    user_id,
    title,
    description,
    "USER",
  );

  return UserWordbookMapper.mapWordbookRowToWordbookDTO(wordbook);
};

// 사용자 단어장 삭제
export const deleteUserWordbook = async (
  userId: string,
  wordbookId: string,
): Promise<void> => {
  const deletedIds = await wordbookRepo.deleteUserWordbook(userId, wordbookId);
  if (deletedIds.length === 0) throw new AppError("WORDBOOK_NOT_FOUND");
};
