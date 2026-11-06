import { describe, expect, it } from "vitest";
import cases from "../../tests/cases.json";
import { RECIPIENTS, VIEWPOINTS, viewpointIds } from "./viewpoints";

describe("観点リスト", () => {
  it("受け手ごとに5つずつ、IDが重複しない", () => {
    for (const r of RECIPIENTS) {
      const ids = viewpointIds(r);
      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("テストケースが観点リストにある観点だけを使っている", () => {
    expect(cases.cases).toHaveLength(10);
    for (const c of cases.cases) {
      expect(RECIPIENTS).toContain(c.recipient);
      const ids = VIEWPOINTS[c.recipient as keyof typeof VIEWPOINTS].map(
        (v) => v.id as string,
      );
      for (const id of [...c.mustInclude, ...c.mustExclude]) {
        expect(ids).toContain(id);
      }
    }
  });
});
