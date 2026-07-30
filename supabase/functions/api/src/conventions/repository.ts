/*
  레포지토리는 DB 에러를 AppError로 번역해서 throw한다.
  PostgrestError가 이 계층 밖으로 나가지 않게 항상 toAppError를 거친다.
  0건을 404로 볼지 건너뛸지는 호출부마다 다르므로 여기서 판단하지 않는다.

  단건 조회 기준
  - 조회 조건에 따라 0건이 나올 수 있으면 → maybeSingle() + 반환 타입 T | null
  - 0건이 구조적으로 불가능하면(INSERT ... RETURNING 등) → single()

  // 목록 조회
  export const findSomethings = async (ownerId: string): Promise<SomethingRow[]> => {
    const { data, error } = await supabase
      .from("something")
      .select()
      .eq("owner_id", ownerId)
      .overrideTypes<SomethingRow[], { merge: false }>();

    if (error) throw toAppError(error);

    return data;
  };

  // 0건이 나올 수 있는 단건 조회
  export const findSomethingById = async (id: string): Promise<SomethingRow | null> => {
    const { data, error } = await supabase
      .from("something")
      .select()
      .eq("id", id)
      .maybeSingle<SomethingRow>();

    if (error) throw toAppError(error);

    return data;
  };

  // 0건이 구조적으로 불가능한 단건 (INSERT ... RETURNING)
  export const createSomething = async (a: string): Promise<SomethingRow> => {
    const { data, error } = await supabase
      .from("something")
      .insert({ a })
      .select()
      .single<SomethingRow>();

    if (error) throw toAppError(error);

    return data;
  };
*/
