// 呼び出し回数の上限（例/Docs/9_直すこと.md #3・#10）。
// 公開した API を、不具合や悪用で大量に呼ばれて費用が増えるのを防ぐ。
// Cloud Run のインスタンスごとのメモリで数えるだけの簡単なもの。インスタンス数の上限（--max-instances）と組み合わせて使う。

export type RateLimiter = {
  /** key の呼び出しを1回数え、上限内なら true を返す */
  take(key: string, now?: number): boolean;
};

export function createRateLimiter(opts: {
  /** 数える時間の長さ（ミリ秒） */
  windowMs: number;
  /** その時間内に許す回数 */
  max: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    take(key, now = Date.now()) {
      const since = now - opts.windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > since);
      if (recent.length >= opts.max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      // 古い key がたまり続けないように、ときどき掃除する
      if (hits.size > 1000) {
        for (const [k, ts] of hits) {
          if (ts.every((t) => t <= since)) hits.delete(k);
        }
      }
      return true;
    },
  };
}

/** 呼び出し元を見分ける key（Cloud Run では x-forwarded-for の先頭が利用者の IP） */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
