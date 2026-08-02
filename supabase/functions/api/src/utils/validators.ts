import {
  MeaningInput,
  PART_OF_SPEECH_VALUES,
  PartOfSpeech,
} from "../domains/word/word.types.ts";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_REGEX.test(value);

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isValidPartOfSpeech = (value: unknown): value is PartOfSpeech => {
  return (
    typeof value === "string" &&
    PART_OF_SPEECH_VALUES.includes(value as PartOfSpeech)
  );
};

export const isValidMeaningInput = (
  value: unknown,
): value is MeaningInput => {
  if (typeof value !== "object" || value === null) return false;

  const v = value as Record<string, unknown>;

  if (typeof v.meaning !== "string" || v.meaning.trim().length === 0) {
    return false;
  }

  // part_of_speech는 NOT NULL이므로 누락을 허용하면 DB에서 500으로 터진다.
  // MeaningInput의 partOfSpeech도 필수 필드라 여기서 걸러야 타입 가드가 성립한다
  if (!isValidPartOfSpeech(v.partOfSpeech)) {
    return false;
  }

  return true;
};

// 저장 전 정규화. isValidMeaningInput이 trim한 값으로 검증하므로
// 저장도 같은 값으로 해야 검증한 것과 저장한 것이 어긋나지 않는다
export const normalizeMeaningInputs = (
  meanings: MeaningInput[],
): MeaningInput[] =>
  meanings.map((m) => ({
    partOfSpeech: m.partOfSpeech,
    meaning: m.meaning.trim(),
  }));
