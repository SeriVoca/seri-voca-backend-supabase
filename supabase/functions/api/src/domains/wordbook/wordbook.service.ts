import * as wordbookRepo from "../wordbook/wordbook.repository.ts";
import {
  SystemWordbookItemRow,
  UserWordbookItemRow,
  WordbookWord,
  WordbookWordDTO,
} from "./wordbook.types.ts";

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

  static toDTO(domain: WordbookWord): WordbookWordDTO {
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

  static toDTO(domain: WordbookWord): WordbookWordDTO {
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

// 단어장 id로 단어 조회
export const getWordsInWordbook = async (
  wordbook_id: string,
): Promise<WordbookWordDTO[]> => {
  const source = await wordbookRepo.getSourceByWordbookId(wordbook_id);

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
    throw new Error("올바르지 않은 단어장 유형입니다.");
  }
};
