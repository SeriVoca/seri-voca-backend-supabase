import * as repo from "./wordbook.repository.ts";

export const getWordsInWordbook = async (wordbook_id: string) => {
  // 단어장 id 로 단어 조회
  const { data, error } = await repo.findWordsByWordbookId(wordbook_id);
  if (error) throw new Error(error.message);

  // refine
  return (data || []).map((row) => ({
    id: row.word.id,
    en_text: row.word.en_text,
    order_index: row.order_index,
    meanings: row.word.meaning
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => ({
        part_of_speech: m.part_of_speech,
        meaning: m.meaning,
        order_index: m.order_index,
      })),
  }));
}