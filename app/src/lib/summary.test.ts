import { describe, expect, it } from "vitest";
import { MAX_SUMMARY_POINTS, parseSummary } from "./summary";

const lines = [
  "医師：この薬を1日3回、毎食後に飲んでください",
  "患者：食事をとらなかった日はどうしますか",
  "医師：そのときも何か少し食べてから飲んでください",
];

describe("parseSummary", () => {
  it("会話にある元の言葉を持つ要点だけを残す", () => {
    const raw = JSON.stringify({
      overview: "薬の飲み方を確かめた",
      points: [
        {
          text: "薬は1日3回、食後に。食べない日も少し食べてから",
          quotes: ["1日3回、毎食後", "少し食べてから", "会話にない言葉"],
        },
        { text: "痛みが出たら来る", quotes: ["痛みが出たら"] },
      ],
    });
    expect(parseSummary(raw, lines)).toEqual({
      ok: true,
      summary: {
        overview: "薬の飲み方を確かめた",
        points: [
          {
            text: "薬は1日3回、食後に。食べない日も少し食べてから",
            quotes: ["1日3回、毎食後", "少し食べてから"],
          },
        ],
      },
    });
  });

  it("壊れたJSON・違う形は失敗にする", () => {
    expect(parseSummary("x", lines).ok).toBe(false);
    expect(parseSummary('{"points":[]}', lines).ok).toBe(false);
  });

  it("長すぎるものを捨て、上限で絞る", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      text: `要点${i}`,
      quotes: ["毎食後"],
    }));
    const r = parseSummary(
      JSON.stringify({ overview: "あ".repeat(200), points: many }),
      lines,
    );
    expect(r.ok && r.summary.overview).toBe("");
    expect(r.ok && r.summary.points).toHaveLength(MAX_SUMMARY_POINTS);
  });
});
