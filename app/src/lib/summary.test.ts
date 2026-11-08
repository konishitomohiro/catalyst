import { describe, expect, it } from "vitest";
import { MAX_SUMMARY_POINTS, parseSummary } from "./summary";

const lines = [
  "この薬を1日3回、毎食後に飲んでください",
  "次は2週間後に来てください",
];

describe("parseSummary", () => {
  it("会話にある元の言葉の要点だけを残す", () => {
    const raw = JSON.stringify({
      points: [
        { text: "薬は1日3回、食後に飲む", quote: "1日3回、毎食後に" },
        { text: "痛みが出たら来る", quote: "痛みが出たら" },
      ],
    });
    expect(parseSummary(raw, lines)).toEqual({
      ok: true,
      points: [{ text: "薬は1日3回、食後に飲む", quote: "1日3回、毎食後に" }],
    });
  });

  it("壊れたJSON・違う形は失敗にする", () => {
    expect(parseSummary("x", lines).ok).toBe(false);
    expect(parseSummary('{"items":[]}', lines).ok).toBe(false);
  });

  it("長すぎる要点・重複を捨て、上限で絞る", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      text: `要点${i}`,
      quote: i % 2 ? "次は2週間後" : "毎食後",
    }));
    const long = { text: "あ".repeat(80), quote: "毎食後" };
    const r = parseSummary(JSON.stringify({ points: [long, ...many] }), lines);
    expect(r.ok && r.points.map((p) => p.quote)).toEqual([
      "毎食後",
      "次は2週間後",
    ]);
    expect(r.ok && r.points.length).toBeLessThanOrEqual(MAX_SUMMARY_POINTS);
  });
});
