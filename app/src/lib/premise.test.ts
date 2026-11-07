import { describe, expect, it } from "vitest";
import { MAX_POINTS, parsePremises, splitByQuotes } from "./premise";

const raw = (points: unknown) => JSON.stringify({ points });
const msg = "来週の訪問のとき、胃ろうのチューブを2本持ってきてください";

describe("parsePremises", () => {
  it("文の中にある場所と、問いの組を返す", () => {
    expect(
      parsePremises(raw([{ quote: "2本", question: "なぜ2本なのか？" }]), msg),
    ).toEqual({
      ok: true,
      points: [{ quote: "2本", question: "なぜ2本なのか？" }],
    });
  });

  it.each(["", "{", "null", raw("x"), JSON.stringify({ items: [] })])(
    "崩れた出力は弾く: %j",
    (r) => {
      expect(parsePremises(r, msg).ok).toBe(false);
    },
  );

  it("文の中にない場所は捨てる", () => {
    const r = parsePremises(
      raw([{ quote: "3本", question: "なぜ3本なのか？" }]),
      msg,
    );
    expect(r).toEqual({ ok: true, points: [] });
  });

  it("問いの形でないもの（答えや説明）は捨てる", () => {
    const r = parsePremises(
      raw([
        { quote: "2本", question: "1本は交換用、もう1本は予備です。" },
        { quote: "チューブ", question: "どのサイズのチューブか？" },
      ]),
      msg,
    );
    expect(r).toEqual({
      ok: true,
      points: [{ quote: "チューブ", question: "どのサイズのチューブか？" }],
    });
  });

  it("長すぎる問いは捨てる（説明を書き込ませない）", () => {
    const long = "なぜ" + "あ".repeat(50) + "？";
    expect(parsePremises(raw([{ quote: "2本", question: long }]), msg)).toEqual(
      { ok: true, points: [] },
    );
  });

  it("同じ場所の重複を除き、上限件数に絞る", () => {
    const r = parsePremises(
      raw([
        { quote: "2本", question: "なぜ2本か？" },
        { quote: "２本", question: "何に使うか？" },
        { quote: "来週", question: "来週の何曜日か？" },
        { quote: "訪問", question: "誰の訪問か？" },
        { quote: "胃ろう", question: "どの患者か？" },
      ]),
      msg,
    );
    expect(r.ok && r.points.map((p) => p.quote)).toEqual([
      "2本",
      "来週",
      "訪問",
    ]);
    expect(r.ok && r.points.length).toBeLessThanOrEqual(MAX_POINTS);
  });
});

describe("splitByQuotes", () => {
  it("見つかった場所に印をつけて、文を分ける", () => {
    expect(splitByQuotes("チューブを2本ください", ["2本", "チューブ"])).toEqual(
      [
        { text: "チューブ", mark: true },
        { text: "を", mark: false },
        { text: "2本", mark: true },
        { text: "ください", mark: false },
      ],
    );
  });

  it("重なる場所や、ない場所は無視する", () => {
    expect(splitByQuotes("2本ください", ["2本", "本", "3本"])).toEqual([
      { text: "2本", mark: true },
      { text: "ください", mark: false },
    ]);
  });
});
