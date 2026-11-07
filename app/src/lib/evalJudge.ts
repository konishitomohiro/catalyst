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
  note?: string;
};

export type EvalResult = {
  pass: boolean;
  /** 満たせなかった mustInclude の組 */
  missing: string[][];
  /** 出てしまった mustExclude の語 */
  unexpected: string[];
};

/** 返った語と期待の語が「同じ言葉」か。どちらかがもう一方を含めば同じとみなす（例：「嚥下機能」と「嚥下」） */
export function sameTerm(found: string, expected: string): boolean {
  const a = normalize(found);
  const b = normalize(expected);
  return a.length > 0 && b.length > 0 && (a.includes(b) || b.includes(a));
}

export function judge(c: EvalCase, terms: string[]): EvalResult {
  const missing = c.mustInclude.filter(
    (group) => !group.some((e) => terms.some((t) => sameTerm(t, e))),
  );
  const unexpected = c.mustExclude.filter((e) =>
    terms.some((t) => sameTerm(t, e)),
  );
  return {
    pass: missing.length === 0 && unexpected.length === 0,
    missing,
    unexpected,
  };
}
