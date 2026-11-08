import { describe, expect, it } from "vitest";
import { decideKind, kindOf } from "./termKind";

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
