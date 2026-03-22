import { supabase } from "../../utils/supabase.ts";
import { SystemMeaningRow, SystemWordRow, MeaningInput, UserMeaningRow, UserWordRow } from "./word.types.ts";

export const createUserWord = async (
  wordbookId: string,
  enText: string,
): Promise<UserWordRow> => {
  const { data, error } = await supabase
    .from("user_word")
    .insert({
      wordbook_id: wordbookId,
      en_text: enText,
    })
    .select()
    .single<UserWordRow>();

  if (error) throw error;
  return data;
};

export const createUserMeanings = async (
  wordId: string,
  inputs: MeaningInput[],
): Promise<UserMeaningRow[]> => {
  const payload = inputs.map((r) => ({
    word_id: wordId,
    part_of_speech: r.partOfSpeech,
    meaning: r.meaning,
  }));

  const { data, error } = await supabase
    .from("user_meaning")
    .insert(payload)
    .select()
    .order("order_index", { ascending: true })
    .overrideTypes<UserMeaningRow[], { merge: false }>();

  if (error) throw error;
  return data;
};

/**
 * 논의: get은 wordbookId 검증 없이 조회,
 * update, delete는 wordbookId 검증
 */
export const getUserWord = async (
  wordId: string,
): Promise<UserWordRow> => {
  const { data, error } = await supabase
    .from("user_word")
    .select()
    .eq("id", wordId)
    .single<UserWordRow>();

  if (error) throw error;
  return data;
};

export const getUserMeanings = async (
  wordId: string,
): Promise<UserMeaningRow[]> => {
  const { data, error } = await supabase
    .from("user_meaning")
    .select()
    .eq("word_id", wordId)
    .order("order_index", { ascending: true })
    .overrideTypes<UserMeaningRow[], { merge: false }>();

  if (error) throw error;
  return data;
};

export const getSystemWord = async (
  wordId: string,
): Promise<SystemWordRow> => {
  const { data, error } = await supabase
    .from("system_word")
    .select()
    .eq("id", wordId)
    .single<SystemWordRow>();

  if (error) throw error;
  return data;
};

export const getSystemMeanings = async (
  wordId: string,
): Promise<SystemMeaningRow[]> => {
  const { data, error } = await supabase
    .from("system_meaning")
    .select()
    .eq("word_id", wordId)
    .order("order_index", { ascending: true })
    .overrideTypes<SystemMeaningRow[], { merge: false }>();

  if (error) throw error;
  return data;
};

export const updateUserWord = async (
  wordId: string,
  wordbookId: string,
  enText: string,
): Promise<UserWordRow> => {
  const { data, error } = await supabase
    .from("user_word")
    .update({
      en_text: enText,
    })
    .eq("id", wordId)
    .eq("wordbook_id", wordbookId)
    .select()
    .single<UserWordRow>();

  if (error) throw error;
  return data;
};

export const deleteUserWordWithMeanings = async (
  wordId: string,
  wordbookId: string,
): Promise<void> => {
  const { data, error } = await supabase
    .from("user_word")
    .delete()
    .eq("id", wordId)
    .eq("wordbook_id", wordbookId)
    .select("id");

  // cascade로 meanings도 삭제됨

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error("USER_WORD_NOT_FOUND");
  }
};

export const deleteUserMeanings = async (
  wordId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("user_meaning")
    .delete()
    .eq("word_id", wordId);

  if (error) throw error;
};
