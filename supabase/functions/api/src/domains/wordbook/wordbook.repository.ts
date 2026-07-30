import { supabase } from "@/utils/supabase.ts";
import { toAppError } from "@/shared/errors/db-error.ts";
import {
  SystemWordbookItemRow,
  UserWordbookItemRow,
  WordbookRow,
  WordbookType,
} from "./wordbook.types.ts";
import { WordSource } from "../word/word.types.ts";

export const findUserWordbooks = async (
  userId: string,
): Promise<WordbookRow[]> => {
  const { data, error } = await supabase
    .from("wordbook")
    .select()
    .eq("owner_id", userId)
    .eq("type", "USER")
    .order("created_at", { ascending: true })
    .overrideTypes<WordbookRow[], { merge: false }>();

  if (error) throw toAppError(error);

  return data;
};

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

  if (error) throw toAppError(error);

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
    .from("user_word")
    .select(`
      id,
      wordbook_id,
      order_index,
      en_text,
      created_at,
      user_meaning (
        id,
        word_id,
        part_of_speech,
        meaning,
        order_index,
        created_at
      )
    `)
    .eq("wordbook_id", wordbookId)
    .order("order_index", { ascending: true })
    .order("order_index", {
      referencedTable: "user_meaning",
      ascending: true,
    });

  if (error) throw toAppError(error);

  return (data || []).map((row) => ({
    source: "USER",
    order_index: row.order_index,
    word: {
      id: row.id,
      wordbook_id: row.wordbook_id,
      en_text: row.en_text,
      order_index: row.order_index,
      created_at: row.created_at,
      meanings: row.user_meaning,
    },
  }));
};

export const getSourceByWordbookId = async (
  wordbookId: string,
): Promise<WordSource | null> => {
  // wordbookId가 존재하지 않을 수 있으므로 0건이 나올 수 있다. 판단은 서비스가 한다
  const { data, error } = await supabase
    .from("wordbook")
    .select(`
      type
      `)
    .eq("id", wordbookId)
    .maybeSingle<{ type: WordSource }>();

  if (error) throw toAppError(error);

  return data?.type ?? null;
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

  if (error) throw toAppError(error);

  return data;
};

// 사용자 단어장 삭제. 없거나 소유자가 아니면 0건이 나올 수 있다.
// 0건을 NOT_FOUND로 볼지는 서비스가 판단하므로 여기서는 삭제된 id만 반환한다
export const deleteUserWordbook = async (
  userId: string,
  wordbookId: string,
): Promise<string[]> => {
  const { data, error } = await supabase
    .from("wordbook")
    .delete()
    .eq("id", wordbookId)
    .eq("owner_id", userId)
    .eq("type", "USER")
    .select("id");

  if (error) throw toAppError(error);

  return (data ?? []).map((row) => row.id as string);
};
