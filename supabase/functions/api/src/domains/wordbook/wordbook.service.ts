import * as wordbookRepo from "../wordbook/wordbook.repository.ts";
import {
  WordbookWord,
  WordbookWordDTO,
  WordbookWordWithDetailRow,
} from "./wordbook.types.ts";

export class WordbookMapper {
  static toDomain(row: WordbookWordWithDetailRow): WordbookWord | null {
    if (!row.word) return null;
    const { word } = row;
    return {
      orderIndex: row.order_index,
      word: {
        id: word.id,
        text: word.en_text,
        meanings: word.meaning.map((m) => ({
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
  const { data, error } = await wordbookRepo.findWordsByWordbookId(wordbook_id);
  if (error) throw new Error(error.message);

  // refine
  return (data || [])
    .map((row) => WordbookMapper.toDomain(row))
    .filter((domain) => domain !== null)
    .map((domain) => WordbookMapper.toDTO(domain!));
};
