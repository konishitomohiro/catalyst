// 音声入力の聞き間違いを直す（2026-11-08、Tomo）。
// 空白はコードで消す。言葉や単位の聞き間違い（例：30mm→30mg、2畳→2錠）はAIに直させ、
// コードが守りをかける（ルール4）：数字が変わる直し・大きすぎる直しは受け取らない。

const LATIN = /[A-Za-z]/;

/** 文字の間の余計な空白を消す。英字どうしの間（例：「New York」）だけは残す */
export function squeezeSpaces(text: string): string {
  const t = text.trim();
  let out = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (/\s/.test(c)) {
      let j = i;
      while (j < t.length && /\s/.test(t[j])) j++;
      const prev = out.at(-1) ?? "";
      const next = t[j] ?? "";
      if (LATIN.test(prev) && LATIN.test(next)) out += " ";
      i = j - 1;
      continue;
    }
    out += c;
  }
  return out;
}

const KANJI_NUM = "〇一二三四五六七八九十百千万";

/** 文の中の数字の並び（数字の聞き間違いはAIに直させないため） */
export function digitsOf(text: string): string {
  return [...text.normalize("NFKC")]
    .filter((c) => /[0-9]/.test(c) || KANJI_NUM.includes(c))
    .join("");
}

function distance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** 直してよい文字数の上限（1つの発言で） */
export const MAX_FIX_CHARS = 8;

/**
 * AIが直した文を受け取ってよいかを決める。受け取れないときや変わっていないときは null。
 * - 数字の並びが変わる → 受け取らない（量や回数を変えてしまうため）
 * - 変わった文字が多すぎる（MAX_FIX_CHARS、または元の3割より多い）→ 受け取らない
 */
export function acceptCorrection(
  original: string,
  corrected: string | undefined,
): string | null {
  const c = squeezeSpaces(corrected ?? "");
  if (!c || c === original) return null;
  if (digitsOf(c) !== digitsOf(original)) return null;
  const d = distance(original, c);
  if (d > MAX_FIX_CHARS || d > original.length * 0.3) return null;
  return c;
}
