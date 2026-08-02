/*
  서비스는 도메인 판단을 전담한다.
  레포지토리가 돌려준 0건(null / 빈 배열)을 404로 볼지 500으로 볼지, 규칙 위반인지를
  여기서 정하고 AppError로 throw한다. rethrow만 하는 try/catch는 쓰지 않는다.

  const mapRowToDTO = (row: SomethingRow): SomethingDTO => {
    return {
      a: row.a,
      b: row.b
    };
  }

  export const doSomething = async (id: string): Promise<SomethingDTO> => {
    const row = await somethingRepo.findSomethingById(id);

    // 없을 수 있는 리소스 → 404
    if (!row) throw new AppError("SOMETHING_NOT_FOUND");

    return mapRowToDTO(row);
  };

  export const doPolicyBoundThing = async (): Promise<SomethingDTO> => {
    const rows = await somethingRepo.findAll();

    // 정책상 반드시 존재해야 하는 데이터가 없으면 4xx가 아니라 5xx다.
    // 구체적인 사유는 cause에 담아 서버 로그에만 남긴다
    if (rows.length !== 1) {
      throw new AppError("SOMETHING_MISCONFIGURED", {
        cause: new Error(`정책상 1건이어야 하는데 ${rows.length}건입니다`),
      });
    }

    return mapRowToDTO(rows[0]);
  };
*/
