import { WordbookType } from "../wordbook/wordbook.types.ts";

// DB Layer
export type CurriculumCategory = "HOME";

export interface CurriculumRow {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  category: CurriculumCategory | null; // ERD 상 NULL 가능
}

export interface CurriculumWordbookRow {
  id: string;
  curriculum_id: string;
  wordbook_id: string;
  order_index: number;
  created_at: string;
}

// Query Layer
export interface CurriculumWordbookWithBookRow {
  order_index: number;
  wordbook: {
    id: string;
    title: string;
    description: string | null;
    type: WordbookType; // wordbook.type enum (SYSTEM | USER)
  } | null;
}

// Domain Layer
export interface CurriculumWordbook {
  orderIndex: number;
  wordbook: {
    id: string;
    title: string;
    description: string | null;
    type: WordbookType;
  };
}

// DTO Layer
export interface CurriculumWordbookDTO {
  order_index: number;
  wordbook: {
    id: string;
    title: string;
    description: string | null;
    type: WordbookType;
  };
}
