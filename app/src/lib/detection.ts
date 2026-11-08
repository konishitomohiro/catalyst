// AIが返した「前提が必要な用語」をコードで検査する（ルール4・5）。
// 形は例/Docs/3_仕組み.md「AIの出力の形」。
import { z } from "zod";
import { normalize } from "./transcriptCheck";
import { acceptCorrection } from "./transcriptFix";
import { decideKind, decideMissing, type Kind, type Missing } from "./termKind";

/** 1回の発言から受け取る用語の最大数 */
export const MAX_TERMS = 5;
/** 1つの用語の最大文字数（文をまるごと返すのを防ぐ） */
export const MAX_TERM_LENGTH = 30;

/** 発言した人。sender＝話す人（左）、recipient＝聞く人・この端末を持つ人（右） */
export const SPEAKERS = ["sender", "recipient"] as const;
export type Speaker = (typeof SPEAKERS)[number];

export const detectionSchema = z.object({
  speaker: z.string().optional(),
  corrected: z.string().optional(),
  terms: z.array(
    z.object({
      term: z.string(),
      reading: z.string().optional(),
      kind: z.string().optional(),
      missing: z.array(z.string()).optional(),
    }),
  ),
});

/** Gemini に渡す JSON Schema（detectionSchema と同じ形） */
export const detectionJsonSchema = {
  type: "object",
  properties: {
    speaker: {
      type: "string",
      enum: ["sender", "recipient"],
      description:
        "今回の発言をした人。話し手なら sender、聞き手なら recipient",
    },
    corrected: {
      type: "string",
      description:
        "音声入力の聞き間違い（単位・薬の名前・言葉）を直した発言。数字は変えない。直すところがなければ発言のまま",
    },
    terms: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: {
            type: "string",
            description:
              "受け手が理解するのに前提が必要な用語。発言に出てきた表記のまま",
          },
          reading: {
            type: "string",
            description: "term の読み（ひらがな）。意味の説明は書かない",
          },
          kind: {
            type: "string",
            enum: [
              "word",
              "amount",
              "test",
              "result",
              "treatment",
              "prognosis",
            ],
            description:
              "word＝分からない言葉、amount＝決まり方の分からない数や量、test＝検査、result＝結果・診断（病名・ステージを含む）、treatment＝治療（薬・手術・処置）、prognosis＝見通し（予後）",
          },
          missing: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "purpose",
                "meaning",
                "duration",
                "caution",
                "side_effects",
                "options",
                "outlook",
              ],
            },
            description:
              "test・result・treatment・prognosis のとき、まだ話されていない点。purpose＝目的、meaning＝意味、duration＝期間・スケジュール、caution＝気をつけること、side_effects＝副作用の種類と重さ、options＝ほかの方法と良い点・悪い点、outlook＝これからの見通し。word・amount では空",
          },
        },
        required: ["term", "reading", "kind", "missing"],
      },
    },
  },
  required: ["speaker", "corrected", "terms"],
} as const;

export type DetectedTerm = {
  term: string;
  /** ふりがな。漢字を含まない語や、読みとして正しくない値のときは undefined */
  reading?: string;
  /** 種類（聞き方を変える）。コードが decideKind で決める */
  kind?: Kind;
  /** 検査・結果・治療・見通しで、まだ話されていない点 */
  missing?: Missing[];
};

export type DetectionResult =
  | {
      ok: true;
      speaker: Speaker;
      terms: DetectedTerm[];
      /** コードが受け取った直し。直さなかったときはない */
      corrected?: string;
    }
  | { ok: false; error: string };

const KANJI = /[㐀-鿿々〆]/;
const KANA_ONLY = /^[ぁ-ゟァ-ヿー・\s]+$/;

/** ふりがなとして使える読みだけを返す（かなだけ・長すぎない・漢字を含む語のとき） */
export function cleanReading(term: string, reading?: string) {
  const r = reading?.trim();
  if (!r || !KANJI.test(term)) return undefined;
  if (!KANA_ONLY.test(r) || r.length > MAX_TERM_LENGTH * 3) return undefined;
  return r;
}

/**
 * - JSONとして読めない・形が違う → ok: false
 * - 発言の中にない語（AIが作った語）、空・長すぎる語 → 除外
 * - 読みはかなだけのときに残す（説明文などは捨てる）
 * - 重複を除き、MAX_TERMS 件までに絞る
 */
export function parseDetection(
  raw: string,
  utterance: string,
): DetectionResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "JSONとして読めない" };
  }
  const parsed = detectionSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: "決めた形式と違う" };

  // 分からなければ話し手とみなす（言葉を見落とさない側に倒す）
  const speaker: Speaker =
    parsed.data.speaker === "recipient" ? "recipient" : "sender";
  // 直しを受け取れたら、言葉は直した文の中から探す
  const corrected = acceptCorrection(utterance, parsed.data.corrected);
  const fixed = corrected ? { corrected } : {};
  const text = normalize(corrected ?? utterance);
  const seen = new Set<string>();
  const terms: DetectedTerm[] = [];
  for (const t of parsed.data.terms) {
    const term = t.term.trim();
    const key = normalize(term);
    if (!key || term.length > MAX_TERM_LENGTH) continue;
    if (!text.includes(key) || seen.has(key)) continue;
    seen.add(key);
    terms.push({
      term,
      reading: cleanReading(term, t.reading),
      kind: decideKind(term, t.kind),
    });
    const last = terms[terms.length - 1];
    const missing = decideMissing(last.kind ?? "word", t.missing);
    if (missing.length > 0) last.missing = missing;
  }
  // 聞き手が話した発言は、聞き手が知っている言葉なので出さない（コードが決める。ルール4）
  if (speaker === "recipient")
    return { ok: true, speaker, terms: [], ...fixed };
  return { ok: true, speaker, terms: terms.slice(0, MAX_TERMS), ...fixed };
}
