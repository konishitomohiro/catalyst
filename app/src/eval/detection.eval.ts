// AI評価テスト（ルール5）。本物の Gemini（Vertex AI）に tests/eval-cases.json の発言を渡し、
// 返った言葉が条件を満たすかを確かめる。文章どうしは比べない。
//
// 実行：app/ で `npm run eval`（.env.local の GOOGLE_CLOUD_PROJECT と GEMINI_MODEL、
// `gcloud auth application-default login` が要る）。費用がかかるので、ふだんの `npm test` では動かさない。
// いつ回すか：指示文（prompt.ts）・モデル・検査（detection.ts）を変えたとき（例/Docs/7_テスト.md）。
import { afterAll, describe, expect, it } from "vitest";
import cases from "../../tests/eval-cases.json";
import premiseCases from "../../tests/premise-cases.json";
import { checkPremises, detectTerms } from "@/lib/detect";
import { judge, sameTerm, type EvalCase } from "@/lib/evalJudge";
import type { Role } from "@/lib/roles";

const all = cases.cases as EvalCase[];

// 設定が足りないときは飛ばす（理由は vitest.eval.config.mts が表示する）
const missing = ["GOOGLE_CLOUD_PROJECT", "GEMINI_MODEL"].filter(
  (k) => !process.env[k],
);
const results: { id: string; pass: boolean; terms: string[]; why: string }[] =
  [];

/** 権限・設定の問題で止まったときの短い説明。1件目で分かれば、残りは同じ理由で落ちるので飛ばす */
let fatal: string | null = null;

/** Google Cloud のエラーを、直し方つきの短い文にする */
function explain(e: unknown): string | null {
  const status = (e as { status?: number }).status;
  const text = String((e as Error).message ?? e);
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (status === 403 || /PERMISSION_DENIED/.test(text)) {
    return [
      `権限がないか、モデルが使えません（403）。プロジェクト：${project}、モデル：${process.env.GEMINI_MODEL}`,
      "  よくある原因と直し方（app/README.md「うまくいかないとき」）：",
      "  1. モデルの提供が終わっている（エラーに「or it may not exist」とあるとき）→ .env.local の GEMINI_MODEL を、",
      "     今使えるモデル名にする（例：gemini-3.8-flash、gemini-3.5-flash-lite）",
      `  2. Vertex AI の API が有効でない → gcloud services enable aiplatform.googleapis.com --project ${project}`,
      "  3. ログインしたアカウントに権限がない → gcloud auth list でアカウントを確かめ、",
      `     そのプロジェクトのオーナーか「Vertex AI ユーザー」にする（gcloud auth application-default login もそのアカウントで）`,
    ].join("\n");
  }
  if (status === 401 || /default credentials|UNAUTHENTICATED/.test(text)) {
    return "認証がありません。gcloud auth application-default login を実行してください。";
  }
  if (status === 404 || /NOT_FOUND/.test(text)) {
    return `モデルが見つかりません（${process.env.GEMINI_MODEL}）。モデル名と GOOGLE_CLOUD_LOCATION を確かめてください。`;
  }
  return null;
}

describe.skipIf(missing.length > 0)(
  `AI評価テスト（モデル：${process.env.GEMINI_MODEL ?? "未設定"}）`,
  () => {
    it.for(all)("$id", { timeout: 60_000 }, async (c, ctx) => {
      if (fatal) ctx.skip();
      let r;
      try {
        r = await detectTerms({
          sender: c.sender,
          recipient: c.recipient,
          utterance: c.utterance,
          context: "",
        });
      } catch (e) {
        const why = explain(e);
        if (!why) throw e;
        // 元のエラー文も短く添える（原因を見分けるため）
        const raw = String((e as Error).message ?? e)
          .replace(/\s+/g, " ")
          .slice(0, 400);
        fatal = `${why}\n  Google からのエラー：${raw}`;
        throw new Error(fatal);
      }
      // コード側の検査（形式・発言にある語だけ・読みはかなだけ）を通ること
      expect(r.ok, r.ok ? "" : r.error).toBe(true);
      if (!r.ok) return;
      const terms = r.terms.map((t) => t.term);
      const j = judge(c, terms, r.terms);
      results.push({
        id: c.id,
        pass: j.pass,
        terms: r.terms.map((t) =>
          t.missing?.length ? `${t.term}（${t.missing.join("・")}）` : t.term,
        ),
        why: [
          j.missing.length
            ? `出なかった：${j.missing.map((g) => g.join("/")).join("、")}`
            : "",
          j.unexpected.length ? `出てしまった：${j.unexpected.join("、")}` : "",
          j.pointIssues.join("、"),
        ]
          .filter(Boolean)
          .join(" "),
      });
      expect(j, `${c.utterance} → [${terms.join("、")}]`).toMatchObject({
        pass: true,
      });
    });

    afterAll(() => {
      if (fatal) return;
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

// 送り手の確認（伝える前）。文の中の場所（quote）で判定する。問いの文章は比べない（ルール5）
type PremiseCase = {
  id: string;
  sender: Role;
  recipient: Role;
  message: string;
  mustQuote: string[][];
  mustNotQuote: string[];
  /** 返してよい点の最大数（0＝何も返さないでほしい） */
  maxPoints?: number;
};

describe.skipIf(missing.length > 0)("AI評価テスト：伝える前に確かめる", () => {
  it.for(premiseCases.cases as PremiseCase[])(
    "$id",
    { timeout: 60_000 },
    async (c, ctx) => {
      if (fatal) ctx.skip();
      const r = await checkPremises(c);
      expect(r.ok, r.ok ? "" : r.error).toBe(true);
      if (!r.ok) return;
      const quotes = r.points.map((p) => p.quote);
      const missingGroups = c.mustQuote.filter(
        (g) => !g.some((e) => quotes.some((q) => sameTerm(q, e))),
      );
      const unexpected = c.mustNotQuote.filter((e) =>
        quotes.some((q) => sameTerm(q, e)),
      );
      const tooMany =
        c.maxPoints !== undefined && r.points.length > c.maxPoints;
      const shown = r.points
        .map((p) => `${p.quote}：${p.question}${p.risk ? `（${p.risk}）` : ""}`)
        .join("、");
      console.log(
        `${missingGroups.length || unexpected.length || tooMany ? "✗" : "✓"} ${c.id}：[${shown}]`,
      );
      expect(
        { missingGroups, unexpected, tooMany },
        `${c.message} → [${shown}]`,
      ).toEqual({ missingGroups: [], unexpected: [], tooMany: false });
    },
  );
});
