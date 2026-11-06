// 文字起こしの試作で、読み上げた語が正しく文字になったかを確かめる。

/** 全角・半角、大文字・小文字、空白の違いを無視して比べるための正規化 */
export function normalize(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

export type ExpectedWord = {
  /** 表示名 */
  word: string;
  /** 正しく文字になったとみなす書き方（どれか1つが含まれればよい） */
  accept: string[];
};

export type WordResult = {
  word: string;
  /** 含まれていた書き方。含まれていなければ null */
  matched: string | null;
};

export function checkWords(
  transcript: string,
  expected: ExpectedWord[],
): WordResult[] {
  const t = normalize(transcript);
  return expected.map(({ word, accept }) => ({
    word,
    matched: accept.find((a) => t.includes(normalize(a))) ?? null,
  }));
}
