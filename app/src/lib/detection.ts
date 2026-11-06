// AIが返した「前提が必要な用語」をコードで検査する（ルール4・5）。
// 形は例/Docs/3_仕組み.md「AIの出力の形」。
import { z } from "zod";
import { normalize } from "./transcriptCheck";

/** 1回の発言から受け取る用語の最大数 */
export const MAX_TERMS = 5;
/** 1つの用語の最大文字数（文をまるごと返すのを防ぐ） */
export const MAX_TERM_LENGTH = 30;

export const detectionSchema = z.object({
  terms: z.array(
    z.object({ term: z.string(), reading: z.string().optional() }),
  ),
});

/** Gemini に渡す JSON Schema（detectionSchema と同じ形） */
export const detectionJsonSchema = {
  type: "object",
  properties: {
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
        },
        required: ["term", "reading"],
      },
    },
  },
  required: ["terms"],
} as const;

export type DetectedTerm = {
  term: string;
  /** ふりがな。漢字を含まない語や、読みとして正しくない値のときは undefined */
  reading?: string;
};

export type DetectionResult =
  { ok: true; terms: DetectedTerm[] } | { ok: false; error: string };

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

  const text = normalize(utterance);
  const seen = new Set<string>();
  const terms: DetectedTerm[] = [];
  for (const t of parsed.data.terms) {
    const term = t.term.trim();
    const key = normalize(term);
    if (!key || term.length > MAX_TERM_LENGTH) continue;
    if (!text.includes(key) || seen.has(key)) continue;
    seen.add(key);
    terms.push({ term, reading: cleanReading(term, t.reading) });
  }
  return { ok: true, terms: terms.slice(0, MAX_TERMS) };
}
