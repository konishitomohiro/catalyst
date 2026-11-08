// 見つけたものの種類と、種類ごとの聞き方（2026-11-08、Tomo：「あとでなしにするかもしれないが、とりあえず作る」）。
// AIが種類を返し、コードが決める（ルール4）：数や量はコードで見分け、分からない種類は「言葉」にする。
import { isAmount } from "./amount";

export const KINDS = [
  "word",
  "amount",
  "test",
  "result",
  "treatment",
  "prognosis",
] as const;
export type Kind = (typeof KINDS)[number];

/** 種類を決める。数や量の形ならコードが「数」にする */
export function decideKind(term: string, aiKind?: string): Kind {
  if (isAmount(term)) return "amount";
  if (
    aiKind === "test" ||
    aiKind === "result" ||
    aiKind === "treatment" ||
    aiKind === "prognosis"
  )
    return aiKind;
  return "word";
}

/**
 * 検査・結果・治療・見通しで、まだ話されていない点（2026-11-08、Tomo：案A）。
 * カードは短く「〇〇について、分かりますか？」と聞き、「いいえ」なら質問リストにこの点を並べる。
 */
export const MISSING = {
  purpose: "{目的|もくてき}",
  meaning: "{意味|いみ}",
  duration: "{期間|きかん}・スケジュール",
  caution: "{気|き}をつけること",
  side_effects: "{副作用|ふくさよう}の{種類|しゅるい}と{重|おも}さ",
  options: "ほかの{方法|ほうほう}と、{良|よ}い{点|てん}・{悪|わる}い{点|てん}",
  outlook: "これからの{見通|みとお}し",
} as const;
export type Missing = keyof typeof MISSING;
const MISSING_KEYS = Object.keys(MISSING) as Missing[];

/** AIが返さなかったときに出す点 */
const DEFAULT_MISSING: Partial<Record<Kind, Missing[]>> = {
  test: ["purpose", "meaning"],
  result: ["meaning"],
  treatment: ["purpose", "duration"],
  prognosis: ["meaning"],
};

/** まだ話されていない点を決める。決めた点だけを、決めた順で、重複なく */
export function decideMissing(kind: Kind, ai?: string[]): Missing[] {
  if (kind === "word" || kind === "amount") return [];
  const got = MISSING_KEYS.filter((k) => ai?.includes(k));
  return got.length > 0 ? got : (DEFAULT_MISSING[kind] ?? []);
}

/** 種類ごとの聞き方。card は「〇〇」のあとに続く文、list は質問リストに添える短い文（ふりがな記法） */
export const ASK: Record<Kind, { card: string; list?: string }> = {
  word: { card: "は{分|わ}かりますか？" },
  amount: {
    card: "なんでその{量|りょう}を{出|だ}すのか、{分|わ}かりますか？",
    list: "なんでその{量|りょう}を{出|だ}すのか",
  },
  test: { card: "について、{分|わ}かりますか？" },
  result: { card: "について、{分|わ}かりますか？" },
  treatment: { card: "について、{分|わ}かりますか？" },
  prognosis: { card: "について、{分|わ}かりますか？" },
};

/** 質問リストに添える文。検査・結果・治療・見通しは、まだ話されていない点を並べる */
export function listNote(x: {
  term: string;
  kind?: Kind;
  missing?: Missing[];
}): string | undefined {
  const kind = kindOf(x);
  const missing = x.missing ?? decideMissing(kind);
  if (missing.length > 0) return missing.map((m) => MISSING[m]).join("・");
  return ASK[kind].list;
}

/** 記録に種類がない（古い）ときも、数や量は見分ける */
export const kindOf = (x: { term: string; kind?: Kind }) =>
  x.kind ?? decideKind(x.term);
