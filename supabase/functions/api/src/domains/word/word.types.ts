export type PartOfSpeech =
  | "NOUN"
  | "PRONOUN"
  | "VERB"
  | "ADJECTIVE"
  | "ADVERB"
  | "PREPOSITION"
  | "CONJUNCTION"
  | "INTERJECTION";

export const PART_OF_SPEECH_VALUES: PartOfSpeech[] = [
  "NOUN",
  "PRONOUN",
  "VERB",
  "ADJECTIVE",
  "ADVERB",
  "PREPOSITION",
  "CONJUNCTION",
  "INTERJECTION",
];

export type WordSource = "SYSTEM" | "USER";

// DB Layer
export interface SystemWordRow {
  id: string;
  en_text: string;
  created_at: string;
}

export interface UserWordRow {
  id: string;
  wordbook_id: string;
  en_text: string;
  order_index: number;
  created_at: string;
}

export interface SystemMeaningRow {
  id: string;
  word_id: string; // references system_word.id
  part_of_speech: PartOfSpeech;
  meaning: string;
  order_index: number;
  created_at: string;
}

export interface UserMeaningRow {
  id: string;
  word_id: string; // references user_word.id
  part_of_speech: PartOfSpeech;
  meaning: string;
  order_index: number;
  created_at: string;
}

// Query Layer
export interface SystemWordWithMeaningsRow extends SystemWordRow {
  meanings: SystemMeaningRow[];
}

export interface UserWordWithMeaningsRow extends UserWordRow {
  meanings: UserMeaningRow[];
}

// DTO Layer
export interface MeaningDTO {
  part_of_speech: PartOfSpeech;
  meaning: string;
  order_index: number;
}

export interface WordDTO {
  id: string;
  en_text: string;
  meanings: MeaningDTO[];
}

export type MeaningInput = {
  partOfSpeech: PartOfSpeech;
  meaning: string;
};
