import { supabase } from "@/utils/supabase.ts";
import {
  SystemWordbookItemRow,
  UserWordbookItemRow,
  WordbookRow,
  WordbookType,
} from "./wordbook.types.ts";
import { WordSource } from "../word/word.types.ts";

// 단어장 id로 단어 조회
export const findSystemWordsByWordbookId = async (
  wordbookId: string,
): Promise<SystemWordbookItemRow[]> => {
  const { data, error } = await supabase
    .from("wordbook_word")
    .select(`
      order_index,
      system_word (
        id,
        en_text,
        created_at,
        system_meaning (
          part_of_speech,
          meaning,
          order_index
        )
      )`)
    .eq("wordbook_id", wordbookId)
    .order("order_index", { ascending: true })
    .order("order_index", {
      referencedTable: "system_word.system_meaning",
      ascending: true,
    });

  if (error) throw error;

  // 에러 없이 깔끔하게 가공하기
  return (data || []).map((row) => {
    // system_word가 배열로 올 경우 첫 번째 요소를 선택
    const rawWord = Array.isArray(row.system_word)
      ? row.system_word[0]
      : row.system_word;

    return {
      source: "SYSTEM",
      order_index: row.order_index,
      system_word: rawWord
        ? {
          id: rawWord.id,
          en_text: rawWord.en_text,
          created_at: rawWord.created_at,
          // system_meaning을 인터페이스에서 기대하는 meanings로 이름 변경
          meanings: rawWord.system_meaning,
        }
        : null,
    };
  }) as SystemWordbookItemRow[];
};

export const findUserWordByWordbookId = async (
  wordbookId: string,
): Promise<UserWordbookItemRow[]> => {
  const { data, error } = await supabase
    .from("wordbook")
    .select(`
      user_word (
        id,  
        order_index,
        en_text
        user_meaning (
          part_of_speech,
          meaning,
          order_index
        )
      )`)
    .eq("wordbook_id", wordbookId)
    .order("order_index", { ascending: true })
    .overrideTypes<UserWordbookItemRow[], { merge: false }>();

  if (error) throw error;

  return data;
};

export const getSourceByWordbookId = async (
  wordbookId: string,
): Promise<WordSource> => {
  const { data, error } = await supabase
    .from("wordbook")
    .select(`
      type
      `)
    .eq("id", wordbookId)
    .single<{ type: WordSource }>();

  if (error) throw error;

  return data.type;
};

export const createWordbook = async (
  userId: string,
  title: string,
  description: string | null,
  type: WordbookType,
): Promise<WordbookRow> => {
  const { data, error } = await supabase
    .from("wordbook")
    .insert({
      owner_id: userId,
      title: title,
      description: description,
      type: type,
    })
    .select()
    .single<WordbookRow>();

  if (error) throw error;

  return data;
};

/*
  # 사용자 단어장 삭제

  > 논의
   - cascade 설정 조정하기
   - soft delete 고려하기

  > AI prompting
   - types
   - DB schema
   - code conventions
    - query
    - exception handling
    - return type
*/

export const deleteUserWordbook = async (
  userId: string,
  wordbookId: string,
) => {
  const { data, error } = await supabase
    .from("wordbook")
    .delete()
    .eq("id", wordbookId)
    .eq("owner_id", userId)
    .select("id");

  // 삭제 실패 했을 때
  if (error) throw error;

  // 삭제된 row 가 없을 때
  if (!data || data.length === 0) {
    throw new Error("Wordbook not found or not authorized");
  }

  return true;
};
