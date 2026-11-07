import { describe, expect, it } from "vitest";
import {
  initialSession,
  sessionReducer,
  type SessionAction,
  type SessionState,
} from "./session";

const run = (...actions: SessionAction[]): SessionState =>
  actions.reduce(sessionReducer, initialSession);
const detected = (...terms: string[]): SessionAction => ({
  type: "detected",
  terms: terms.map((term) => ({ term })),
});
const no = (key: string): SessionAction => ({
  type: "answer",
  key,
  understood: false,
});
const yes = (key: string): SessionAction => ({
  type: "answer",
  key,
  understood: true,
});
const toggle = (key: string): SessionAction => ({ type: "toggle", key });
const order = (s: SessionState) =>
  s.list.map((x) => `${x.checked ? "✓" : "・"}${x.term}`);

describe("分かりますか？", () => {
  it("見つけた語を古い順に並べ、答えていないものは残す", () => {
    const s = run(detected("NSAIDs", "頓服"), detected("胃ろう"));
    expect(s.pending.map((p) => p.term)).toEqual(["NSAIDs", "頓服", "胃ろう"]);
  });

  it("はい → 何もしない。いいえ → 質問リストのいちばん下に足す", () => {
    const s = run(detected("a", "b", "c"), no("a"), yes("b"), no("c"));
    expect(s.pending).toEqual([]);
    expect(order(s)).toEqual(["・a", "・c"]);
  });

  it("一度答えた語・答え待ちの語は聞き直さない", () => {
    const s = run(detected("a", "b"), yes("a"), detected("a", "b", "A"));
    expect(s.pending.map((p) => p.term)).toEqual(["b"]);
  });

  it("質問リストにある語がまた出たら、その項目を知らせるだけ", () => {
    const s = run(detected("a"), no("a"), detected("a"), detected("a"));
    expect(s.pending).toEqual([]);
    expect(s.list).toHaveLength(1);
    expect(s.highlight).toEqual({ key: "a", n: 2 });
  });
});

describe("質問リストのチェック", () => {
  const base = [detected("a", "b", "c"), no("a"), no("b"), no("c")];

  it("チェックした項目は上のほうへ移す", () => {
    expect(order(run(...base, toggle("b")))).toEqual(["✓b", "・a", "・c"]);
    expect(order(run(...base, toggle("b"), toggle("c")))).toEqual([
      "✓b",
      "✓c",
      "・a",
    ]);
  });

  it("チェックを外した項目は、いちばん下へ戻す", () => {
    expect(order(run(...base, toggle("a"), toggle("b"), toggle("a")))).toEqual([
      "✓b",
      "・c",
      "・a",
    ]);
  });

  it("新しい語は、チェック済みがあってもいちばん下に足す", () => {
    expect(order(run(...base, toggle("c"), detected("d"), no("d")))).toEqual([
      "✓c",
      "・a",
      "・b",
      "・d",
    ]);
  });

  it("チェック済みの項目も消さない", () => {
    const s = run(...base, toggle("a"), toggle("b"), toggle("c"));
    expect(s.list).toHaveLength(3);
  });
});

describe("取り消す", () => {
  it("「いいえ」を取り消すと、リストから外れて「分かりますか？」の先頭に戻る", () => {
    const s = run(detected("a", "b"), no("a"), { type: "undo" });
    expect(s.list).toEqual([]);
    expect(s.pending.map((p) => p.term)).toEqual(["a", "b"]);
    expect(s.lastAnswer).toBeNull();
  });

  it("「はい」を取り消すと、また聞かれるようになる", () => {
    const s = run(detected("a"), yes("a"), { type: "undo" });
    expect(s.understood).toEqual([]);
    expect(s.pending.map((p) => p.term)).toEqual(["a"]);
  });

  it("時間が過ぎたら取り消せない", () => {
    const s = run(
      detected("a"),
      no("a"),
      { type: "undoExpired" },
      {
        type: "undo",
      },
    );
    expect(order(s)).toEqual(["・a"]);
  });

  it("取り消せるのは直前の1件だけ", () => {
    const s = run(detected("a", "b"), no("a"), no("b"), { type: "undo" });
    expect(order(s)).toEqual(["・a"]);
    expect(s.pending.map((p) => p.term)).toEqual(["b"]);
  });

  it("読みも一緒に持ち回る", () => {
    const s = run(
      { type: "detected", terms: [{ term: "褥瘡", reading: "じょくそう" }] },
      no("褥瘡"),
    );
    expect(s.list[0]).toMatchObject({ term: "褥瘡", reading: "じょくそう" });
  });
});
