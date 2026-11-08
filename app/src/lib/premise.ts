// 送り手の確認（伝える前）：AIが返した「受け手が分からなそうな点」をコードで検査する（ルール4・5）。
// 形は例/Docs/3_仕組み.md「送り手の確認」。AIは根拠や答えを書かない。問いだけを返す。
import { z } from "zod";
import { normalize } from "./transcriptCheck";

/** 1回の確認で出す点の最大数 */
export const MAX_POINTS = 2;
/** 文の中の場所の最大文字数 */
export const MAX_QUOTE_LENGTH = 30;
/** 問いの最大文字数（説明や答えを書き込ませない） */
export const MAX_QUESTION_LENGTH = 40;
/** 取り違えの最大文字数 */
export const MAX_RISK_LENGTH = 40;

export const premiseSchema = z.object({
  points: z.array(
    z.object({
      quote: z.string(),
      question: z.string(),
      risk: z.string().optional(),
    }),
  ),
});

/** Gemini に渡す JSON Schema（premiseSchema と同じ形） */
export const premiseJsonSchema = {
  type: "object",
  properties: {
    points: {
      type: "array",
      items: {
        type: "object",
        properties: {
          quote: {
            type: "string",
            description:
              "受け手が取り違えそうな、文の中の一部。文に出てきた表記のまま、短く",
          },
          risk: {
            type: "string",
            description:
              "受け手が取り違えて、違うことをしてしまうおそれ。「〜と受け取るかもしれない」の形で短く。答えは書かない",
          },
          question: {
            type: "string",
            description:
              "受け手が抱きそうな問い。「〜？」の形で短く。答えや説明は書かない",
          },
        },
        required: ["quote", "risk", "question"],
      },
    },
  },
  required: ["points"],
} as const;

export type PremisePoint = { quote: string; question: string; risk: string };

export type PremiseResult =
  { ok: true; points: PremisePoint[] } | { ok: false; error: string };

const QUESTION_END = /[？?]$/;

/**
 * - JSONとして読めない・形が違う → ok: false
 * - 文の中にない場所（AIが作った文）、空・長すぎる場所 → 除外
 * - 問いの形（「？」で終わる）でないもの、長すぎるもの → 除外（答えや説明を画面に出さない）
 * - 取り違え（risk）が書けていないもの → 除外（具体的な取り違えのない指摘は、揚げ足取りになるため。2026-11-08）
 * - 同じ場所の重複を除き、MAX_POINTS 件までに絞る
 */
export function parsePremises(raw: string, message: string): PremiseResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "JSONとして読めない" };
  }
  const parsed = premiseSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: "決めた形式と違う" };

  const text = normalize(message);
  const seen = new Set<string>();
  const points: PremisePoint[] = [];
  for (const p of parsed.data.points) {
    const quote = p.quote.trim();
    const question = p.question.trim();
    const risk = (p.risk ?? "").trim();
    const key = normalize(quote);
    if (!key || quote.length > MAX_QUOTE_LENGTH) continue;
    if (!text.includes(key) || seen.has(key)) continue;
    if (!question || question.length > MAX_QUESTION_LENGTH) continue;
    if (!QUESTION_END.test(question)) continue;
    if (!risk || risk.length > MAX_RISK_LENGTH) continue;
    seen.add(key);
    points.push({ quote, question, risk });
  }
  return { ok: true, points: points.slice(0, MAX_POINTS) };
}

/** 文を、見つかった場所とそれ以外に分ける（画面で印をつけるため）。最初に出てきた位置だけに印をつける */
export function splitByQuotes(
  message: string,
  quotes: string[],
): { text: string; mark: boolean }[] {
  const ranges: [number, number][] = [];
  for (const q of quotes) {
    const i = message.indexOf(q);
    if (i < 0) continue;
    const r: [number, number] = [i, i + q.length];
    if (ranges.some(([a, b]) => r[0] < b && a < r[1])) continue;
    ranges.push(r);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const out: { text: string; mark: boolean }[] = [];
  let pos = 0;
  for (const [a, b] of ranges) {
    if (pos < a) out.push({ text: message.slice(pos, a), mark: false });
    out.push({ text: message.slice(a, b), mark: true });
    pos = b;
  }
  if (pos < message.length) out.push({ text: message.slice(pos), mark: false });
  return out;
}
