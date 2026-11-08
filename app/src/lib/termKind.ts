// 見つけたものの種類と、種類ごとの聞き方（2026-11-08、Tomo：「あとでなしにするかもしれないが、とりあえず作る」）。
// AIが種類を返し、コードが決める（ルール4）：数や量はコードで見分け、分からない種類は「言葉」にする。
import { isAmount } from "./amount";

export const KINDS = ["word", "amount", "test", "result", "treatment"] as const;
export type Kind = (typeof KINDS)[number];

/** 種類を決める。数や量の形ならコードが「数」にする */
export function decideKind(term: string, aiKind?: string): Kind {
  if (isAmount(term)) return "amount";
  if (aiKind === "test" || aiKind === "result" || aiKind === "treatment")
    return aiKind;
  return "word";
}

/** 種類ごとの聞き方。card は「〇〇」のあとに続く文、list は質問リストに添える短い文（ふりがな記法） */
export const ASK: Record<Kind, { card: string; list?: string }> = {
  word: { card: "は{分|わ}かりますか？" },
  amount: {
    card: "なんでその{量|りょう}を{出|だ}すのか、{分|わ}かりますか？",
    list: "なんでその{量|りょう}を{出|だ}すのか",
  },
  test: {
    card: "{何|なん}のための{検査|けんさ}か、{分|わ}かりますか？",
    list: "{何|なん}のための{検査|けんさ}か",
  },
  result: {
    card: "それが{何|なに}を{意味|いみ}するか、{分|わ}かりますか？",
    list: "それが{何|なに}を{意味|いみ}するか",
  },
  treatment: {
    card: "{何|なん}のためか、どれくらい{続|つづ}くか、{分|わ}かりますか？",
    list: "{何|なん}のためか・どれくらい{続|つづ}くか",
  },
};

/** 記録に種類がない（古い）ときも、数や量は見分ける */
export const kindOf = (x: { term: string; kind?: Kind }) =>
  x.kind ?? decideKind(x.term);
