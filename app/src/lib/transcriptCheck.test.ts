import { describe, expect, it } from "vitest";
import { checkWords, normalize } from "./transcriptCheck";

describe("normalize", () => {
  it("全角・半角、大文字・小文字、空白をそろえる", () => {
    expect(normalize("ＮＳＡＩＤｓ を 飲む")).toBe("nsaidsを飲む");
    expect(normalize("14 Fr")).toBe("14fr");
  });
});

describe("checkWords", () => {
  const expected = [
    { word: "NSAIDs", accept: ["NSAIDs", "エヌセイズ"] },
    { word: "頓服", accept: ["頓服"] },
  ];

  it("どれかの書き方が含まれていれば、その書き方を返す", () => {
    expect(checkWords("エヌセイズを毎食後に", expected)).toEqual([
      { word: "NSAIDs", matched: "エヌセイズ" },
      { word: "頓服", matched: null },
    ]);
  });

  it("全角や空白が混ざっていても見つける", () => {
    expect(checkWords("ＮＳＡＩＤ s と とん服、頓服", expected)).toEqual([
      { word: "NSAIDs", matched: "NSAIDs" },
      { word: "頓服", matched: "頓服" },
    ]);
  });
});
