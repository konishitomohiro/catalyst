import { describe, expect, it } from "vitest";
import { MAX_TERMS, parseDetection } from "./detection";

const raw = (terms: unknown) => JSON.stringify({ terms });

describe("parseDetection", () => {
  it("発言の中にある用語を返す", () => {
    expect(
      parseDetection(raw(["NSAIDs", "毎食後"]), "NSAIDsを毎食後に服用"),
    ).toEqual({ ok: true, terms: ["NSAIDs", "毎食後"] });
  });

  it.each(["", "{", "null", raw("x"), JSON.stringify({ words: [] })])(
    "崩れた出力は弾く: %j",
    (r) => {
      expect(parseDetection(r, "なにか").ok).toBe(false);
    },
  );

  it("発言にない語（AIが作った語・説明文）は除く", () => {
    const r = parseDetection(
      raw(["NSAIDs", "非ステロイド性抗炎症薬", "NSAIDsとは痛み止めのこと"]),
      "NSAIDsを飲んでください",
    );
    expect(r).toEqual({ ok: true, terms: ["NSAIDs"] });
  });

  it("全角・半角や空白の違いは同じ語とみなし、重複を除く", () => {
    const r = parseDetection(raw(["14Fr", "１４ Fr", " "]), "チューブは14Frで");
    expect(r).toEqual({ ok: true, terms: ["14Fr"] });
  });

  it("件数の上限を守る", () => {
    const words = ["あ", "い", "う", "え", "お", "か", "き"];
    const r = parseDetection(raw(words), words.join(""));
    expect(r.ok && r.terms).toHaveLength(MAX_TERMS);
  });
});
