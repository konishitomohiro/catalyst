// 履歴の要約（2026-11-08、Tomo が決めた）：会話全体から、聞いた人があとで見返す要約を作る。
// 1行ずつ言い直すのではなく、会話全体をまとめる（2026-11-08、Tomo）。
// AIが文を書き、コードが確かめる（ルール4）：要点ごとに「元になった会話の言葉」を返させ、会話にないものは捨てる。
import { z } from "zod";
import { normalize } from "./transcriptCheck";

/** 要点の最大数 */
export const MAX_SUMMARY_POINTS = 4;
/** 全体のまとめの最大文字数 */
export const MAX_SUMMARY_OVERVIEW = 80;
/** 要点1つの最大文字数 */
export const MAX_SUMMARY_TEXT = 60;
/** 元の言葉1つの最大文字数 */
export const MAX_SUMMARY_QUOTE = 40;
/** 要約に送る会話の文字の上限 */
export const MAX_SUMMARY_INPUT = 4000;

export type SummaryPoint = { text: string; quotes: string[] };
export type Summary = { overview: string; points: SummaryPoint[] };

const schema = z.object({
  overview: z.string(),
  points: z.array(z.object({ text: z.string(), quotes: z.array(z.string()) })),
});

/** Gemini に渡す JSON Schema（schema と同じ形） */
export const summaryJsonSchema = {
  type: "object",
  properties: {
    overview: {
      type: "string",
      description:
        "会話全体で、何について話し、どうすることになったかを1〜2文で",
    },
    points: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description:
              "あとで見返す要点。関係する発言をまとめて、やさしい言葉で1文で",
          },
          quotes: {
            type: "array",
            items: { type: "string" },
            description:
              "その要点の元になった会話の中の言葉（1つ以上）。会話の表記のまま、短く",
          },
        },
        required: ["text", "quotes"],
      },
    },
  },
  required: ["overview", "points"],
} as const;

export type SummaryResult =
  { ok: true; summary: Summary } | { ok: false; error: string };

/**
 * - JSONとして読めない・形が違う → ok: false
 * - 元の言葉が1つも会話にない要点（AIが作ったこと）→ 除外。会話にない元の言葉は捨てる
 * - 空・長すぎる要点 → 除外。全体のまとめが長すぎるときは空にする
 * - MAX_SUMMARY_POINTS 件までに絞る
 */
export function parseSummary(raw: string, lines: string[]): SummaryResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "JSONとして読めない" };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { ok: false, error: "決めた形式と違う" };

  const all = normalize(lines.join("\n"));
  const points: SummaryPoint[] = [];
  for (const p of parsed.data.points) {
    const text = p.text.trim();
    if (!text || text.length > MAX_SUMMARY_TEXT) continue;
    const quotes = p.quotes
      .map((q) => q.trim())
      .filter(
        (q) => q && q.length <= MAX_SUMMARY_QUOTE && all.includes(normalize(q)),
      );
    if (quotes.length === 0) continue;
    points.push({ text, quotes });
  }
  const overview = parsed.data.overview.trim();
  return {
    ok: true,
    summary: {
      overview: overview.length <= MAX_SUMMARY_OVERVIEW ? overview : "",
      points: points.slice(0, MAX_SUMMARY_POINTS),
    },
  };
}
