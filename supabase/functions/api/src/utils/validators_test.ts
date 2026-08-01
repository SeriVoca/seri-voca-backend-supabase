import { assert, assertEquals, assertFalse } from "@std/assert";
import {
  isNonEmptyString,
  isUuid,
  isValidMeaningInput,
  isValidPartOfSpeech,
  normalizeMeaningInputs,
} from "./validators.ts";
import {
  MeaningInput,
  PART_OF_SPEECH_VALUES,
} from "../domains/word/word.types.ts";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

// ===== isUuid =====

Deno.test("isUuid: uuid 형식을 통과시킨다", () => {
  assert(isUuid(UUID));
  assert(isUuid(UUID.toUpperCase()));
});

Deno.test("isUuid: uuid가 아닌 문자열을 거부한다", () => {
  assertFalse(isUuid("not-a-uuid"));
  assertFalse(isUuid(""));
  assertFalse(isUuid(UUID.slice(0, -1)));
  assertFalse(isUuid(` ${UUID} `));
});

Deno.test("isUuid: 문자열이 아닌 값을 거부한다", () => {
  assertFalse(isUuid(undefined));
  assertFalse(isUuid(null));
  assertFalse(isUuid(123));
  assertFalse(isUuid({}));
  assertFalse(isUuid([UUID]));
});

// ===== isNonEmptyString =====

Deno.test("isNonEmptyString: 내용이 있는 문자열만 통과시킨다", () => {
  assert(isNonEmptyString("apple"));
  assert(isNonEmptyString("  apple  "));
});

Deno.test("isNonEmptyString: 비었거나 공백뿐인 문자열을 거부한다", () => {
  assertFalse(isNonEmptyString(""));
  assertFalse(isNonEmptyString("   "));
  assertFalse(isNonEmptyString("\n\t"));
});

Deno.test("isNonEmptyString: 문자열이 아닌 값을 거부한다", () => {
  assertFalse(isNonEmptyString(undefined));
  assertFalse(isNonEmptyString(null));
  assertFalse(isNonEmptyString(0));
  assertFalse(isNonEmptyString(["apple"]));
});

// ===== isValidPartOfSpeech =====

Deno.test("isValidPartOfSpeech: 등록된 품사를 모두 통과시킨다", () => {
  for (const pos of PART_OF_SPEECH_VALUES) {
    assert(isValidPartOfSpeech(pos), `${pos}가 거부됐다`);
  }
});

Deno.test("isValidPartOfSpeech: enum 밖의 값을 거부한다", () => {
  assertFalse(isValidPartOfSpeech("noun")); // 소문자
  assertFalse(isValidPartOfSpeech("명사"));
  assertFalse(isValidPartOfSpeech(""));
  assertFalse(isValidPartOfSpeech(undefined));
  assertFalse(isValidPartOfSpeech(null));
});

// ===== isValidMeaningInput =====

Deno.test("isValidMeaningInput: 품사와 뜻이 모두 있으면 통과시킨다", () => {
  assert(isValidMeaningInput({ partOfSpeech: "NOUN", meaning: "사과" }));
  assert(isValidMeaningInput({ partOfSpeech: "VERB", meaning: "  먹다  " }));
});

// 5a96e99 회귀: value is MeaningInput을 주장하면서 필수 필드인 partOfSpeech가
// 없어도 true를 반환했다. part_of_speech가 NOT NULL이고 PATCH의 뜻 수정은
// delete 후 insert하는 전체 교체라, 통과시키면 삭제만 커밋되고 뜻이 전부 사라진다
Deno.test("isValidMeaningInput: partOfSpeech가 없거나 잘못되면 거부한다", () => {
  assertFalse(isValidMeaningInput({ meaning: "사과" }));
  assertFalse(
    isValidMeaningInput({ partOfSpeech: undefined, meaning: "사과" }),
  );
  assertFalse(isValidMeaningInput({ partOfSpeech: null, meaning: "사과" }));
  assertFalse(isValidMeaningInput({ partOfSpeech: "", meaning: "사과" }));
  assertFalse(isValidMeaningInput({ partOfSpeech: "noun", meaning: "사과" }));
  assertFalse(isValidMeaningInput({ partOfSpeech: "명사", meaning: "사과" }));
});

Deno.test("isValidMeaningInput: meaning이 없거나 공백뿐이면 거부한다", () => {
  assertFalse(isValidMeaningInput({ partOfSpeech: "NOUN" }));
  assertFalse(isValidMeaningInput({ partOfSpeech: "NOUN", meaning: "" }));
  assertFalse(isValidMeaningInput({ partOfSpeech: "NOUN", meaning: "   " }));
  assertFalse(isValidMeaningInput({ partOfSpeech: "NOUN", meaning: 123 }));
  assertFalse(isValidMeaningInput({ partOfSpeech: "NOUN", meaning: null }));
});

Deno.test("isValidMeaningInput: 객체가 아닌 값을 거부한다", () => {
  assertFalse(isValidMeaningInput(null));
  assertFalse(isValidMeaningInput(undefined));
  assertFalse(isValidMeaningInput("사과"));
  assertFalse(isValidMeaningInput(123));
});

// ===== normalizeMeaningInputs =====

// cfd204a 회귀: meaning의 trim이 POST 라우트에만 있어서 같은 " 사과 "를 보내도
// 생성이냐 수정이냐에 따라 다르게 저장됐다
Deno.test("normalizeMeaningInputs: meaning의 양끝 공백을 제거한다", () => {
  const inputs: MeaningInput[] = [
    { partOfSpeech: "NOUN", meaning: "  사과  " },
    { partOfSpeech: "VERB", meaning: "\t먹다\n" },
  ];

  assertEquals(normalizeMeaningInputs(inputs), [
    { partOfSpeech: "NOUN", meaning: "사과" },
    { partOfSpeech: "VERB", meaning: "먹다" },
  ]);
});

Deno.test("normalizeMeaningInputs: partOfSpeech와 순서를 보존한다", () => {
  const inputs: MeaningInput[] = [
    { partOfSpeech: "VERB", meaning: "먹다" },
    { partOfSpeech: "NOUN", meaning: "사과" },
  ];

  assertEquals(normalizeMeaningInputs(inputs), inputs);
});

Deno.test("normalizeMeaningInputs: 원본 배열을 변경하지 않는다", () => {
  const inputs: MeaningInput[] = [{ partOfSpeech: "NOUN", meaning: "  사과  " }];

  normalizeMeaningInputs(inputs);

  assertEquals(inputs[0].meaning, "  사과  ");
});

Deno.test("normalizeMeaningInputs: 빈 배열은 빈 배열로 둔다", () => {
  assertEquals(normalizeMeaningInputs([]), []);
});

// 검증과 저장이 같은 값을 보게 하려고 정규화를 검증과 같은 계층에 뒀다.
// 검증을 통과한 입력이 정규화 후 빈 문자열이 되면 그 전제가 깨진다
Deno.test("normalizeMeaningInputs: 검증을 통과한 값은 정규화 후에도 비지 않는다", () => {
  const inputs: MeaningInput[] = [
    { partOfSpeech: "NOUN", meaning: "  사과  " },
    { partOfSpeech: "VERB", meaning: "먹다" },
  ];

  assert(inputs.every(isValidMeaningInput));

  for (const m of normalizeMeaningInputs(inputs)) {
    assert(m.meaning.length > 0, `"${m.meaning}"가 비었다`);
  }
});
