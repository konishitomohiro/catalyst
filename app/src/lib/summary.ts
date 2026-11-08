// 履歴の要約（2026-11-08、Tomo が決めた）：会話の文字から、聞いた人があとで見返す要点を作る。
// AIが文を書き、コードが確かめる（ルール4）：要点ごとに「会話の中の元の言葉」を返させ、会話にないものは捨てる。
import { z } from "zod";
import { normalize } from "./transcriptCheck";

/** 要点の最大数 */
export const MAX_SUMMARY_POINTS = 5;
/** 要点1つの最大文字数 */
export const MAX_SUMMARY_TEXT = 50;
/** 元の言葉の最大文字数 */
export const MAX_SUMMARY_QUOTE = 40;
/** 要約に送る会話の文字の上限 */
export const MAX_SUMMARY_INPUT = 4000;

export type SummaryPoint = { text: string; quote: string };

const schema = z.object({
  points: z.array(z.object({ text: z.string(), quote: z.string() })),
});

/** Gemini に渡す JSON Schema（schema と同じ形） */
export const summaryJsonSchema = {
  type: "object",
  properties: {
    points: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description:
              "聞いた人があとで見返す要点。会話に出たことだけを、やさしい言葉で短く1文で",
          },
          quote: {
            type: "string",
            description:
              "その要点の元になった、会話の中の言葉。会話の表記のまま、短く",
          },
        },
        required: ["text", "quote"],
      },
    },
  },
  required: ["points"],
} as const;

export type SummaryResult =
  { ok: true; points: SummaryPoint[] } | { ok: false; error: string };

/**
 * - JSONとして読めない・形が違う → ok: false
 * - 元の言葉が会話にないもの（AIが作ったこと）→ 除外
 * - 空・長すぎるもの、同じ元の言葉の重複 → 除外
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
  const seen = new Set<string>();
  const points: SummaryPoint[] = [];
  for (const p of parsed.data.points) {
    const text = p.text.trim();
    const quote = p.quote.trim();
    const key = normalize(quote);
    if (!text || text.length > MAX_SUMMARY_TEXT) continue;
    if (!key || quote.length > MAX_SUMMARY_QUOTE) continue;
    if (!all.includes(key) || seen.has(key)) continue;
    seen.add(key);
    points.push({ text, quote });
  }
  return { ok: true, points: points.slice(0, MAX_SUMMARY_POINTS) };
}
