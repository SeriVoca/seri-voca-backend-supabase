import { supabase } from "../../utils/supabase.ts";
import {
  CreateUserMeaningInput,
  UserMeaningRow,
  UserWordRow,
} from "./word.types.ts";

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
  inputs: CreateUserMeaningInput[],
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
