import { describe, expect, it } from "vitest";
import { RECIPIENTS, viewpointIds } from "./viewpoints";

// これまでの案（薬剤師・患者向け）の観点リスト。今の対面の流れでは使っていない。
// 5職種ぶんの観点リストが決まったら、作り直す（例/Docs/3_仕組み.md「観点リスト」）。
describe("観点リスト", () => {
  it("受け手ごとに5つずつ、IDが重複しない", () => {
    for (const r of RECIPIENTS) {
      const ids = viewpointIds(r);
      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
