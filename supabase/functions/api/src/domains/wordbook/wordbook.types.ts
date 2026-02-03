import {
  SystemWordWithMeaningsRow,
  UserWordWithMeaningsRow,
  WordSource,
} from "../word/word.types.ts";

// DB Layer
export type WordbookType = "SYSTEM" | "USER";

export interface WordbookRow {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  type: WordbookType;
  owner_id: string | null;
}

/**
 * SYSTEM 단어장만 사용하는 중간 테이블 (ERD 그대로 유지)
 * - wordbook_word.system_word_id -> system_word.id
 */
export interface WordbookWordRow {
  id: string;
  wordbook_id: string;
  system_word_id: string | null;
  order_index: number;
  created_at: string;
}

// Query Layer
/**
 * SYSTEM 단어장 아이템
 * - order_index: wordbook_word.order_index
 * - word: system_word + system_meaning
 */
export interface SystemWordbookItemRow {
  source: "SYSTEM";
  order_index: number;
  word: SystemWordWithMeaningsRow | null;
}

/**
 * USER 단어장 아이템
 * - order_index: user_word.order_index
 * - word: user_word + user_meaning
 */
export interface UserWordbookItemRow {
  source: "USER";
  order_index: number; // user_word.order_index
  word: UserWordWithMeaningsRow | null;
}

// Domain Layer
export interface Wordbook {
  id: string;
  title: string;
  description: string | null;
  type: WordbookType;
}

export interface WordbookWord {
  source: WordSource;
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

// 어디서 쓰이는지 모르겠음 커리큘럼?
export interface WordbookDTO {
  id: string;
  title: string;
  description: string | null;
  type: WordbookType;
}
