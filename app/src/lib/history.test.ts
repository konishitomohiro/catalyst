import { describe, expect, it } from "vitest";
import {
  isEmptyRecord,
  MAX_RECORDS,
  parseHistory,
  removeRecord,
  upsertRecord,
  type HistoryRecord,
} from "./history";
import { parseSettings } from "./settings";

const rec = (id: string, startedAt: number): HistoryRecord => ({
  id,
  startedAt,
  endedAt: startedAt,
  sender: "医師",
  recipient: "患者",
  items: [],
  lines: ["こんにちは"],
});

describe("履歴", () => {
  it("壊れた文字列は空にする", () => {
    expect(parseHistory("{")).toEqual([]);
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory('[{"id":1}]')).toEqual([]);
  });

  it("同じ id は置き換え、新しい順に並べる", () => {
    let list = upsertRecord([], rec("a", 1));
    list = upsertRecord(list, rec("b", 2));
    list = upsertRecord(list, { ...rec("a", 1), lines: ["x"] });
    expect(list.map((r) => r.id)).toEqual(["b", "a"]);
    expect(list[1].lines).toEqual(["x"]);
  });

  it("上限を超えたら古いものから消える", () => {
    let list: HistoryRecord[] = [];
    for (let i = 0; i < MAX_RECORDS + 3; i++)
      list = upsertRecord(list, rec(`r${i}`, i));
    expect(list).toHaveLength(MAX_RECORDS);
    expect(list.at(-1)?.id).toBe("r3");
  });

  it("消せる", () => {
    expect(
      removeRecord([rec("a", 1), rec("b", 2)], "a").map((r) => r.id),
    ).toEqual(["b"]);
  });

  it("空の会話は残さない", () => {
    expect(isEmptyRecord({ ...rec("a", 1), lines: [] })).toBe(true);
  });
});

describe("設定", () => {
  it("壊れていたら初期値", () => {
    expect(parseSettings("x")).toEqual({
      fontSize: "medium",
      furigana: "terms",
    });
    expect(parseSettings('{"fontSize":"large","furigana":"terms"}')).toEqual({
      fontSize: "large",
      furigana: "terms",
    });
  });
});

describe("テスト用の入力", () => {
  it("開発中か TEST_INPUT=1 のときだけ出す", async () => {
    const { testInputEnabled } = await import("./testInput");
    const env = (e: Record<string, string>) =>
      e as unknown as NodeJS.ProcessEnv;
    expect(testInputEnabled(env({ NODE_ENV: "production" }))).toBe(false);
    expect(
      testInputEnabled(env({ NODE_ENV: "production", TEST_INPUT: "1" })),
    ).toBe(true);
    expect(testInputEnabled(env({ NODE_ENV: "development" }))).toBe(true);
  });
});

describe("upsertRecord と要約", () => {
  const base = {
    id: "a",
    startedAt: 1,
    endedAt: 2,
    sender: "医師" as const,
    recipient: "患者" as const,
    items: [],
    lines: ["一"],
  };
  const summary = { overview: "まとめ", points: [] };
  it("会話の文字が同じなら、要約を残す", () => {
    const list = upsertRecord([], { ...base, summary });
    expect(upsertRecord(list, { ...base, endedAt: 3 })[0].summary).toEqual(
      summary,
    );
  });
  it("会話の文字が増えたら、要約は作り直す", () => {
    const list = upsertRecord([], { ...base, summary });
    expect(
      upsertRecord(list, { ...base, lines: ["一", "二"] })[0].summary,
    ).toBeUndefined();
  });
});
