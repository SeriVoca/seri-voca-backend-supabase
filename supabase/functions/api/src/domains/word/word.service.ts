import * as wordRepo from "./word.repository.ts";
import {
  MeaningDTO,
  UserMeaningInput,
  UserMeaningRow,
  UserWordRow,
  WordDTO,
} from "./word.types.ts";

export const mapUserWordRowsToWordDTO = (
  word: UserWordRow,
  meanings: UserMeaningRow[],
): WordDTO => {
  const meaningDTOs: MeaningDTO[] = meanings
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => ({
      part_of_speech: m.part_of_speech,
      meaning: m.meaning,
      order_index: m.order_index,
    }));

  return {
    id: word.id,
    en_text: word.en_text,
    meanings: meaningDTOs,
  };
};

// 사용자 단어 생성
export const createUserWordWithMeanings = async (
  wordbookId: string,
  enText: string,
  meanings: UserMeaningInput[],
): Promise<WordDTO> => {
  // TODO: 실패시 롤백하여 원자성 보장
  const userWord = await wordRepo.createUserWord(wordbookId, enText);
  const userMeanings = meanings.length
    ? await wordRepo.createUserMeanings(userWord.id, meanings)
    : [];

  return mapUserWordRowsToWordDTO(userWord, userMeanings);
};
