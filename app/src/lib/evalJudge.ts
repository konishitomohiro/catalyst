// AI評価テストの合否判定（ルール5：文章を比べず、条件を検査する）。
// ケースは tests/eval-cases.json、実行は `npm run eval`（例/Docs/7_テスト.md）。
import type { Role } from "./roles";
import { normalize } from "./transcriptCheck";

export type EvalCase = {
  id: string;
  sender: Role;
  recipient: Role;
  utterance: string;
  /** どれか1つ以上が見つかってほしい語の組（組ごとに判定。組の中はどれか1つでよい） */
  mustInclude: string[][];
  /** 見つかってはいけない語（受け手が分かるはずの語、文中で説明済みの語） */
  mustExclude: string[];
  /**
   * 検査・結果・治療で並べる「まだ話されていない点」（missing）の条件（2026-11-08 追加）。
   * mustHave は入っていてほしい点、mustNotHave は入っていてはいけない点
   */
  points?: { term: string; mustHave?: string[]; mustNotHave?: string[] }[];
  note?: string;
};

export type EvalResult = {
  pass: boolean;
  /** 満たせなかった mustInclude の組 */
  missing: string[][];
  /** 出てしまった mustExclude の語 */
  unexpected: string[];
  /** points の条件を満たさなかった理由 */
  pointIssues: string[];
};

/** 返った語と期待の語が「同じ言葉」か。どちらかがもう一方を含めば同じとみなす（例：「嚥下機能」と「嚥下」） */
export function sameTerm(found: string, expected: string): boolean {
  const a = normalize(found);
  const b = normalize(expected);
  return a.length > 0 && b.length > 0 && (a.includes(b) || b.includes(a));
}

export function judge(
  c: EvalCase,
  terms: string[],
  details: { term: string; missing?: string[] }[] = [],
): EvalResult {
  const missing = c.mustInclude.filter(
    (group) => !group.some((e) => terms.some((t) => sameTerm(t, e))),
  );
  const unexpected = c.mustExclude.filter((e) =>
    terms.some((t) => sameTerm(t, e)),
  );
  const pointIssues: string[] = [];
  for (const p of c.points ?? []) {
    const d = details.find((x) => sameTerm(x.term, p.term));
    if (!d) continue; // 語そのものが出なかったときは mustInclude で落ちる
    const got = d.missing ?? [];
    const lack = (p.mustHave ?? []).filter((m) => !got.includes(m));
    const extra = (p.mustNotHave ?? []).filter((m) => got.includes(m));
    if (lack.length)
      pointIssues.push(`${p.term}に足りない点：${lack.join("・")}`);
    if (extra.length)
      pointIssues.push(`${p.term}に余計な点：${extra.join("・")}`);
  }
  return {
    pass:
      missing.length === 0 &&
      unexpected.length === 0 &&
      pointIssues.length === 0,
    missing,
    unexpected,
    pointIssues,
  };
}
