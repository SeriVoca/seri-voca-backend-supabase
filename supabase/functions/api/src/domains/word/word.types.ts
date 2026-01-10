export type PartOfSpeech = string;

// DB Layer
export interface MeaningRow {
  id: string;
  word_id: string;
  part_of_speech: string;
  meaning: string;
  order_index: number;
  created_at: string;
}

// Query Layer
export interface WordWithMeaningsRow {
  id: string;
  en_text: string;
  created_at: string;
  meaning: MeaningRow[];
}
