import { supabase } from "@/utils/supabase.ts";
import { WordbookWordWithDetailRow } from "./wordbook.types.ts";

// 단어장 id로 단어 조회
export const findWordsByWordbookId = async (wordbookId: string) => {
  return await supabase
    .from("wordbook_word")
    .select(`
      order_index,
      word (
        id,
        en_text,
        meaning (
          part_of_speech,
          meaning,
          order_index
        )
      )`)
    .eq("wordbook_id", wordbookId)
    .order("order_index", { ascending: true })
    .overrideTypes<WordbookWordWithDetailRow[], { merge: false }>();
};
