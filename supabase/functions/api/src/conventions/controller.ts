/*
  export const somethingController = new Hono();

  # Method
  # /something/params
  # description

  somethingController.method("/params", requireAuth, async (c) => {
    const userId = (c as any).get("userId") as string;

    // payload 처리
    let body: SomethingPayload;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "INVALID_JSON" }, 400);
    }

    // payload 추출
    const a = body?.a.trim();
    const b = body?.b ?? null;

    // payload 무결성 검증
    if (!a || !b) {
      return c.json({ error: "INVALID_JSON" }, 400);
    }

    try {
      // call services
      const result = await somethingService.doSomething(a, b);
      
      return c.json(result);
    } catch (error: unknown) {
      return c.json({ error: error }, 500);
    }
  })
*/