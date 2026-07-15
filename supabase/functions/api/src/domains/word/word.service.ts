import * as wordRepo from "./word.repository.ts";
import {
  MeaningDTO,
  MeaningInput,
  UserMeaningRow,
  UserWordRow,
  WordDTO,
  PartOfSpeech
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
    order_index: word.order_index,
    meanings: meaningDTOs,
  };
};

export const mapUserMeaningRowsToMeaningDTO = (
  meanings: UserMeaningRow[],
): MeaningDTO[] => {
  const meaningDTOs: MeaningDTO[] = meanings
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => ({
      part_of_speech: m.part_of_speech,
      meaning: m.meaning,
      order_index: m.order_index,
    }));

  return meaningDTOs;
};

// 사용자 단어 생성
export const createUserWordWithMeanings = async (
  wordbookId: string,
  enText: string,
  meanings: MeaningInput[],
): Promise<WordDTO> => {
  // TODO: 실패시 롤백하여 원자성 보장
  const userWord = await wordRepo.createUserWord(wordbookId, enText);
  const userMeanings = await wordRepo.createUserMeanings(userWord.id, meanings);

  return mapUserWordRowsToWordDTO(userWord, userMeanings);
};

// 사용자 단어장에 시스템 단어 생성
export const copySystemWordToUserWordbook = async (
  wordbookId: string,
  systemWordId: string
): Promise<WordDTO> => {
  // 시스템 단어 정보 조회
  const systemWordData = await wordRepo.getSystemWord(systemWordId);
  if (!systemWordData) throw new Error("SYSTEM_WORD_NOT_FOUND");

  const systemMeaningsData = await wordRepo.getSystemMeanings(systemWordId);
  if (!systemMeaningsData) throw new Error("SYSTEM_WORD_MEANINGS_NOT_FOUND");

  // 입력값 세팅
  const enText: string = systemWordData.en_text;
  const meaningInput: MeaningInput[] = systemMeaningsData.map((m) => {
    return { partOfSpeech: m.part_of_speech, meaning: m.meaning };
  })

  // 사용자 단어장에 추가
  const userWord = await wordRepo.createUserWord(wordbookId, enText);
  const userMeanings = await wordRepo.createUserMeanings(userWord.id, meaningInput);

  return mapUserWordRowsToWordDTO(userWord, userMeanings);
}

// 사용자 단어 조회
export const getUserWordWithMeanings = async (
  wordId: string,
): Promise<WordDTO> => {
  const userWord = await wordRepo.getUserWord(wordId);
  const userMeanings = await wordRepo.getUserMeanings(wordId);

  return mapUserWordRowsToWordDTO(userWord, userMeanings);
};

// 사용자 영어 수정
export const updateUserWord = async (
  wordbookId: string,
  wordId: string,
  enText: string,
): Promise<WordDTO> => {
  // 영어 수정 시 update (cascade 방지)
  const userWord = await wordRepo.updateUserWord(wordId, wordbookId, enText);

  const userMeanings = await wordRepo.getUserMeanings(wordId);

  return mapUserWordRowsToWordDTO(userWord, userMeanings);
};

// 사용자 의미 수정
export const updateUserMeanings = async (
  wordId: string,
  meanings: MeaningInput[],
): Promise<MeaningDTO[]> => {
  // 의미 수정 시 replace (delete -> create)
  await wordRepo.deleteUserMeanings(wordId);
  const userMeanings = await wordRepo.createUserMeanings(wordId, meanings);

  return mapUserMeaningRowsToMeaningDTO(userMeanings);
};

// 사용자 단어 삭제
export const deleteUserWordWithMeanings = async (
  wordId: string,
  wordbookId: string,
): Promise<void> => {
  await wordRepo.deleteUserWordWithMeanings(wordId, wordbookId);
};
