interface MeaningRow {
  part_of_speech: string;
  meaning: string;
  order_index: number;
}

interface WordRow {
  id: string;
  en_text: string;
  meaning: MeaningRow[];
}

export interface WordbookWordRow {
  order_index: number;
  word: WordRow;
}