// API 全体で共有する呼び出し回数の上限（例/Docs/9_直すこと.md #3・#10）。
// /api/detect と /api/summary で同じ数え方をする。
import "server-only";
import { clientKey, createRateLimiter } from "./rateLimit";

// 1人あたり1分に30回まで（会話で発言が確定する回数より十分多い）。インスタンス全体でも1分に120回まで
const perClient = createRateLimiter({ windowMs: 60_000, max: 30 });
const perInstance = createRateLimiter({ windowMs: 60_000, max: 120 });

/** 上限を超えていたら 429 の返事を返す。超えていなければ null */
export function tooManyRequests(request: Request): Response | null {
  if (perClient.take(clientKey(request)) && perInstance.take("all")) {
    return null;
  }
  return Response.json(
    { error: "呼び出しが多すぎます。少し待ってから試せます" },
    { status: 429 },
  );
}
