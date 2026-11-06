import { describe, expect, it } from "vitest";
import { MAX_ITEMS, parseAiOutput } from "./prediction";

const item = (viewpointId: string, likelyUnclear = true) => ({
  viewpointId,
  likelyUnclear,
  question: `${viewpointId} について質問`,
});

describe("parseAiOutput", () => {
  it("正しいJSONを読める", () => {
    const raw = JSON.stringify({ items: [item("quantity_reason")] });
    const r = parseAiOutput(raw, "pharmacist");
    expect(r.ok && r.items.map((i) => i.viewpointId)).toEqual([
      "quantity_reason",
    ]);
  });

  it.each(["", "{", "not json", '{"items": "x"}', "[]"])(
    "崩れた出力は弾く: %j",
    (raw) => {
      expect(parseAiOutput(raw, "pharmacist").ok).toBe(false);
    },
  );

  it("観点リストにない観点は除く", () => {
    const raw = JSON.stringify({
      items: [item("made_up"), item("jargon"), item("purpose")],
    });
    const r = parseAiOutput(raw, "pharmacist");
    expect(r.ok && r.items.map((i) => i.viewpointId)).toEqual(["purpose"]);
  });

  it("分からなそうでない項目は除く", () => {
    const raw = JSON.stringify({ items: [item("jargon", false)] });
    const r = parseAiOutput(raw, "patient");
    expect(r.ok && r.items).toEqual([]);
  });

  it("観点リストの順に並べ、上限件数に絞り、重複を除く", () => {
    const raw = JSON.stringify({
      items: [
        item("contact"),
        item("jargon"),
        item("dont"),
        item("jargon"),
        item("why_needed"),
      ],
    });
    const r = parseAiOutput(raw, "patient");
    expect(r.ok && r.items.map((i) => i.viewpointId)).toEqual([
      "jargon",
      "why_needed",
      "dont",
    ]);
    expect(r.ok && r.items.length).toBeLessThanOrEqual(MAX_ITEMS);
  });
});
