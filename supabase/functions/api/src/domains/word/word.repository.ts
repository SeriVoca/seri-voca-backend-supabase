import { supabase } from "../../utils/supabase.ts";
import { toAppError } from "@/shared/errors/db-error.ts";
import {
  MeaningInput,
  SystemMeaningRow,
  SystemWordRow,
  UserMeaningRow,
  UserWordRow,
} from "./word.types.ts";

export const createUserWord = async (
  wordbookId: string,
  enText: string,
): Promise<UserWordRow> => {
  // INSERT ... RETURNING이라 0건이 구조적으로 불가능하다
  const { data, error } = await supabase
    .from("user_word")
    .insert({
      wordbook_id: wordbookId,
      en_text: enText,
    })
    .select()
    .single<UserWordRow>();

  if (error) throw toAppError(error);
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

  if (error) throw toAppError(error);
  return data;
};

/**
 * 논의: get은 wordbookId 검증 없이 조회,
 * update, delete는 wordbookId 검증
 */
export const getUserWord = async (
  wordId: string,
): Promise<UserWordRow | null> => {
  // wordId가 존재하지 않을 수 있으므로 0건이 나올 수 있다. 판단은 서비스가 한다
  const { data, error } = await supabase
    .from("user_word")
    .select()
    .eq("id", wordId)
    .maybeSingle<UserWordRow>();

  if (error) throw toAppError(error);
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

  if (error) throw toAppError(error);
  return data;
};

export const findUserWordEnTextsByWordbookId = async (
  wordbookId: string,
): Promise<string[]> => {
  const { data, error } = await supabase
    .from("user_word")
    .select("en_text")
    .eq("wordbook_id", wordbookId);

  if (error) throw toAppError(error);
  return (data ?? []).map((row) => row.en_text as string);
};

export const getSystemWord = async (
  wordId: string,
): Promise<SystemWordRow | null> => {
  // 0건일 때 에러 대신 null을 반환해 서비스 계층에서 NOT_FOUND 처리
  const { data, error } = await supabase
    .from("system_word")
    .select()
    .eq("id", wordId)
    .maybeSingle<SystemWordRow>();

  if (error) throw toAppError(error);
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

  if (error) throw toAppError(error);
  return data;
};

export const updateUserWord = async (
  wordId: string,
  wordbookId: string,
  enText: string,
): Promise<UserWordRow | null> => {
  // wordId, wordbookId 조합이 일치하지 않으면 0건이 나올 수 있다. 판단은 서비스가 한다
  const { data, error } = await supabase
    .from("user_word")
    .update({
      en_text: enText,
    })
    .eq("id", wordId)
    .eq("wordbook_id", wordbookId)
    .select()
    .maybeSingle<UserWordRow>();

  if (error) throw toAppError(error);
  return data;
};

export const deleteUserWordWithMeanings = async (
  wordId: string,
  wordbookId: string,
): Promise<UserWordRow | null> => {
  // 0건일 때 에러 대신 null을 반환해 서비스 계층에서 NOT_FOUND 처리
  const { data, error } = await supabase
    .from("user_word")
    .delete()
    .eq("id", wordId)
    .eq("wordbook_id", wordbookId)
    .select()
    .maybeSingle<UserWordRow>();

  // cascade로 meanings도 삭제됨

  if (error) throw toAppError(error);
  return data;
};

export const deleteUserMeanings = async (
  wordId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("user_meaning")
    .delete()
    .eq("word_id", wordId);

  if (error) throw toAppError(error);
};
