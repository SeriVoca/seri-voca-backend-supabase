// TODO: 도메인에 따른 분리, 도메인 내부에서 DB/DTO/서비스 레이어 계층으로 분리

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

export interface CurriculumWordbookRow {
  order_index: number;
  wordbook: {
    id: number;
    title: string;
    description: string | null;
  };
}
