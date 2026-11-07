import { describe, expect, it } from "vitest";
import cases from "../../tests/eval-cases.json";
import { judge, sameTerm, type EvalCase } from "./evalJudge";
import { ROLES } from "./roles";

const base: EvalCase = {
  id: "x",
  sender: "医師",
  recipient: "患者",
  utterance: "NSAIDsを毎食後に服用してください",
  mustInclude: [["NSAIDs"]],
  mustExclude: ["毎食後"],
};

describe("sameTerm", () => {
  it("どちらかがもう一方を含めば同じ言葉とみなす", () => {
    expect(sameTerm("嚥下機能", "嚥下")).toBe(true);
    expect(sameTerm("ＮＳＡＩＤｓ", "NSAIDs")).toBe(true);
    expect(sameTerm("頓服", "褥瘡")).toBe(false);
    expect(sameTerm("", "頓服")).toBe(false);
  });
});

describe("judge", () => {
  it("必要な語が出て、出てはいけない語が出なければ合格", () => {
    expect(judge(base, ["NSAIDs", "服用"]).pass).toBe(true);
  });

  it("必要な語が出なければ不合格", () => {
    expect(judge(base, ["服用"])).toEqual({
      pass: false,
      missing: [["NSAIDs"]],
      unexpected: [],
    });
  });

  it("出てはいけない語が出れば不合格", () => {
    expect(judge(base, ["NSAIDs", "毎食後"])).toEqual({
      pass: false,
      missing: [],
      unexpected: ["毎食後"],
    });
  });

  it("組の中はどれか1つでよい", () => {
    const c = { ...base, mustInclude: [["2本", "チューブ"]], mustExclude: [] };
    expect(judge(c, ["チューブ"]).pass).toBe(true);
  });
});

describe("tests/eval-cases.json", () => {
  it("形が正しく、期待する語は発言の中にある", () => {
    const ids = new Set<string>();
    for (const c of cases.cases as EvalCase[]) {
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
      expect(ROLES).toContain(c.sender);
      expect(ROLES).toContain(c.recipient);
      for (const e of [...c.mustInclude.flat(), ...c.mustExclude]) {
        expect(sameTerm(c.utterance, e), `${c.id}: ${e}`).toBe(true);
      }
    }
  });
});
