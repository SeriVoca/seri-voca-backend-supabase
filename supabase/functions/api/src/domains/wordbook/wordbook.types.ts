import { WordWithMeaningsRow } from "../word/word.types.ts";

// DB Layer
export type WordbookType = "DEFAULT" | "USER";

export interface WordbookRow {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  type: WordbookType;
  owner_id: string | null;
}

// Query Layer
export interface WordbookWordWithDetailRow {
  order_index: number;
  word: WordWithMeaningsRow | null;
}

// Domain Layer
export interface Wordbook {
  id: string;
  title: string;
  description: string | null;
  type: WordbookType;
}

export interface WordbookWord {
  orderIndex: number;
  word: {
    id: string;
    text: string;
    meanings: {
      partOfSpeech: string;
      meaning: string;
      orderIndex: number;
    }[];
  };
}

// DTO Layer
export interface WordbookWordDTO {
  id: string;
  en_text: string;
  order_index: number;
  meanings: {
    part_of_speech: string;
    meaning: string;
    order_index: number;
  }[];
}
