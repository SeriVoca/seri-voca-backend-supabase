import { WordbookRow } from "../wordbook/wordbook.types.ts";

// Query Layer
export interface CurriculumWordbookWithBookRow {
  order_index: number;
  wordbook: Pick<WordbookRow, "id" | "title" | "description">;
}

// Domain Layer
export interface CurriculumWordbook {
  orderIndex: number;
  wordbookId: string;
  title: string;
  description: string | null;
}

// DTO Layer
export interface CurriculumWordbookDTO {
  order_index: number;
  id: string;
  title: string;
  description: string | null;
}
