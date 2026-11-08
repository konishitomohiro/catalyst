import { describe, expect, it } from "vitest";
import { cleanReading, MAX_TERMS, parseDetection } from "./detection";

const raw = (terms: unknown) => JSON.stringify({ terms });
const t = (term: string, reading = "") => ({ term, reading });

describe("parseDetection", () => {
  it("発言の中にある用語を、読みと一緒に返す", () => {
    expect(
      parseDetection(
        raw([t("NSAIDs", "えぬせいず"), t("毎食後", "まいしょくご")]),
        "NSAIDsを毎食後に服用",
      ),
    ).toEqual({
      ok: true,
      speaker: "sender",
      terms: [
        { term: "NSAIDs", kind: "word" },
        { term: "毎食後", reading: "まいしょくご", kind: "word" },
      ],
    });
  });

  it.each([
    "",
    "{",
    "null",
    raw("x"),
    raw(["NSAIDs"]),
    JSON.stringify({ words: [] }),
  ])("崩れた出力は弾く: %j", (r) => {
    expect(parseDetection(r, "なにか").ok).toBe(false);
  });

  it("発言にない語（AIが作った語・説明文）は除く", () => {
    const r = parseDetection(
      raw([
        t("NSAIDs"),
        t("非ステロイド性抗炎症薬"),
        t("NSAIDsとは痛み止めのこと"),
      ]),
      "NSAIDsを飲んでください",
    );
    expect(r).toEqual({
      ok: true,
      speaker: "sender",
      terms: [{ term: "NSAIDs", kind: "word" }],
    });
  });

  it("全角・半角や空白の違いは同じ語とみなし、重複を除く", () => {
    const r = parseDetection(
      raw([t("14Fr"), t("１４ Fr"), t(" ")]),
      "チューブは14Frで",
    );
    expect(r).toEqual({
      ok: true,
      speaker: "sender",
      terms: [{ term: "14Fr", kind: "word" }],
    });
  });

  it("件数の上限を守る", () => {
    const words = ["あ", "い", "う", "え", "お", "か", "き"];
    const r = parseDetection(raw(words.map((w) => t(w))), words.join(""));
    expect(r.ok && r.terms).toHaveLength(MAX_TERMS);
  });
});

describe("cleanReading", () => {
  it("漢字を含む語の、かなだけの読みを残す", () => {
    expect(cleanReading("褥瘡", "じょくそう")).toBe("じょくそう");
    expect(cleanReading("胃ろう", "いろう")).toBe("いろう");
  });

  it("漢字のない語には付けない", () => {
    expect(cleanReading("カテーテル", "かてーてる")).toBeUndefined();
  });

  it("説明文や漢字・英字が混じった読みは捨てる", () => {
    expect(cleanReading("褥瘡", "床ずれのこと")).toBeUndefined();
    expect(cleanReading("褥瘡", "jokusou")).toBeUndefined();
    expect(cleanReading("褥瘡", "")).toBeUndefined();
  });

  it("聞き手が話した発言では、言葉を返さない", () => {
    const r = parseDetection(
      JSON.stringify({ speaker: "recipient", terms: [t("頓服", "とんぷく")] }),
      "頓服ってなんですか",
    );
    expect(r).toEqual({ ok: true, speaker: "recipient", terms: [] });
  });

  it("speaker が分からなければ話し手とみなす", () => {
    const r = parseDetection(
      JSON.stringify({ speaker: "?", terms: [] }),
      "なにか",
    );
    expect(r.ok && r.speaker).toBe("sender");
  });

  it("聞き間違いの直しを受け取り、言葉は直した文から探す", () => {
    const r = parseDetection(
      JSON.stringify({
        speaker: "sender",
        corrected: "アゾセミド30mgを1日2錠処方します",
        terms: [t("アゾセミド", "あぞせみど"), t("2錠", "にじょう")],
      }),
      "アゾセミド30mmを1日2畳処方します",
    );
    expect(r).toEqual({
      ok: true,
      speaker: "sender",
      corrected: "アゾセミド30mgを1日2錠処方します",
      terms: [
        { term: "アゾセミド", kind: "word" },
        { term: "2錠", reading: "にじょう", kind: "amount" },
      ],
    });
  });

  it("数字を変える直しは受け取らず、元の文から探す", () => {
    const r = parseDetection(
      JSON.stringify({
        speaker: "sender",
        corrected: "10枚処方します",
        terms: [t("10枚", "じゅうまい")],
      }),
      "20枚処方します",
    );
    expect(r).toEqual({ ok: true, speaker: "sender", terms: [] });
  });
});
