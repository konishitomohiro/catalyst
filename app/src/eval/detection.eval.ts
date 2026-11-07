// AI評価テスト（ルール5）。本物の Gemini（Vertex AI）に tests/eval-cases.json の発言を渡し、
// 返った言葉が条件を満たすかを確かめる。文章どうしは比べない。
//
// 実行：app/ で `npm run eval`（.env.local の GOOGLE_CLOUD_PROJECT と GEMINI_MODEL、
// `gcloud auth application-default login` が要る）。費用がかかるので、ふだんの `npm test` では動かさない。
// いつ回すか：指示文（prompt.ts）・モデル・検査（detection.ts）を変えたとき（例/Docs/7_テスト.md）。
import { afterAll, describe, expect, it } from "vitest";
import cases from "../../tests/eval-cases.json";
import { detectTerms } from "@/lib/detect";
import { judge, type EvalCase } from "@/lib/evalJudge";

const all = cases.cases as EvalCase[];

// 設定が足りないときは飛ばす（理由は vitest.eval.config.mts が表示する）
const missing = ["GOOGLE_CLOUD_PROJECT", "GEMINI_MODEL"].filter(
  (k) => !process.env[k],
);
const results: { id: string; pass: boolean; terms: string[]; why: string }[] =
  [];

describe.skipIf(missing.length > 0)(
  `AI評価テスト（モデル：${process.env.GEMINI_MODEL ?? "未設定"}）`,
  () => {
    it.each(all.map((c) => [c.id, c] as const))(
      "%s",
      async (_id, c) => {
        const r = await detectTerms({
          sender: c.sender,
          recipient: c.recipient,
          utterance: c.utterance,
          context: "",
        });
        // コード側の検査（形式・発言にある語だけ・読みはかなだけ）を通ること
        expect(r.ok, r.ok ? "" : r.error).toBe(true);
        if (!r.ok) return;
        const terms = r.terms.map((t) => t.term);
        const j = judge(c, terms);
        results.push({
          id: c.id,
          pass: j.pass,
          terms,
          why: [
            j.missing.length
              ? `出なかった：${j.missing.map((g) => g.join("/")).join("、")}`
              : "",
            j.unexpected.length
              ? `出てしまった：${j.unexpected.join("、")}`
              : "",
          ]
            .filter(Boolean)
            .join(" "),
        });
        expect(j, `${c.utterance} → [${terms.join("、")}]`).toMatchObject({
          pass: true,
        });
      },
      60_000,
    );

    afterAll(() => {
      const passed = results.filter((r) => r.pass).length;
      console.log(`\n合格 ${passed} / ${results.length}`);
      for (const r of results) {
        console.log(
          `${r.pass ? "✓" : "✗"} ${r.id}：[${r.terms.join("、")}] ${r.why}`,
        );
      }
    });
  },
);
