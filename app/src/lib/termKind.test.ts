import { describe, expect, it } from "vitest";
import { decideKind, decideMissing, kindOf, listNote } from "./termKind";

describe("decideKind", () => {
  it("数や量の形はコードが「数」にする", () => {
    expect(decideKind("10枚", "word")).toBe("amount");
    expect(decideKind("10枚", "test")).toBe("amount");
  });
  it("AIの種類を使う。分からない種類は「言葉」", () => {
    expect(decideKind("CT", "test")).toBe("test");
    expect(decideKind("抗がん剤", "treatment")).toBe("treatment");
    expect(decideKind("数値が高い", "result")).toBe("result");
    expect(decideKind("頓服", "?")).toBe("word");
    expect(decideKind("頓服")).toBe("word");
  });
  it("古い記録は語の形から決める", () => {
    expect(kindOf({ term: "14錠" })).toBe("amount");
    expect(kindOf({ term: "CT", kind: "test" })).toBe("test");
  });
});

describe("decideMissing と listNote", () => {
  it("決めた点だけを、決めた順で残す", () => {
    expect(
      decideMissing("treatment", ["side_effects", "x", "purpose", "purpose"]),
    ).toEqual(["purpose", "side_effects"]);
  });
  it("AIが返さなければ、種類ごとの点を出す。言葉・数は出さない", () => {
    expect(decideMissing("test")).toEqual(["purpose", "meaning"]);
    expect(decideMissing("word", ["purpose"])).toEqual([]);
  });
  it("質問リストの文", () => {
    expect(
      listNote({ term: "抗がん剤", kind: "treatment", missing: ["purpose"] }),
    ).toBe("{目的|もくてき}");
    expect(listNote({ term: "10枚" })).toBe(
      "なんでその{量|りょう}を{出|だ}すのか",
    );
    expect(listNote({ term: "頓服" })).toBeUndefined();
  });
});
