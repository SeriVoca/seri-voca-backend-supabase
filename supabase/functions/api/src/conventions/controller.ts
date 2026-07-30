/*
  컨트롤러는 성공 응답만 작성한다.
  try/catch로 에러를 응답으로 바꾸지 않는다. throw된 AppError는 index.ts의 onError가
  {"error":{"code","message"}} 형태와 상태 코드로 변환한다.

  export const somethingController = new Hono();

  # Method
  # /something/params
  # description

  somethingController.method("/params", requireAuth, async (c) => {
    const userId = (c as any).get("userId") as string;

    // payload 처리. JSON 파싱 실패는 여기서만 catch한다
    let body: SomethingPayload;
    try {
      body = await c.req.json();
    } catch {
      throw new AppError("INVALID_JSON");
    }

    // payload 추출
    const a = body?.a;
    const b = body?.b ?? null;

    // payload 무결성 검증. 실패 사유별로 다른 코드를 던진다
    if (!isUuid(a)) throw new AppError("INVALID_SOMETHING_ID");
    if (!isNonEmptyString(b)) throw new AppError("INVALID_SOMETHING_FIELD");

    // 서비스 호출 후 성공 응답만 작성
    const result = await somethingService.doSomething(a, b);

    return c.json(result);
  })
*/
