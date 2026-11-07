import { z } from "zod";
import { detectTerms } from "@/lib/detect";
import { getGemini, getModel } from "@/lib/gemini";
import { MAX_CONTEXT, MAX_UTTERANCE } from "@/lib/limits";
import { clientKey, createRateLimiter } from "@/lib/rateLimit";
import { ROLES } from "@/lib/roles";

const bodySchema = z.object({
  sender: z.enum(ROLES),
  recipient: z.enum(ROLES),
  utterance: z.string().trim().min(1).max(MAX_UTTERANCE),
  context: z.string().max(MAX_CONTEXT).default(""),
});

// 1人あたり1分に30回まで（会話で発言が確定する回数より十分多い）。インスタンス全体でも1分に120回まで
const perClient = createRateLimiter({ windowMs: 60_000, max: 30 });
const perInstance = createRateLimiter({ windowMs: 60_000, max: 120 });

export async function POST(request: Request) {
  if (!perClient.take(clientKey(request)) || !perInstance.take("all")) {
    return Response.json(
      { error: "呼び出しが多すぎます。少し待ってから試せます" },
      { status: 429 },
    );
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return Response.json({ error: "入力の形が違う" }, { status: 400 });
  }

  try {
    // 設定がそろっているかを先に確かめる（足りなければ 503）
    getGemini();
    getModel();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }

  try {
    const result = await detectTerms(body.data);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 });
    }
    return Response.json({ terms: result.terms });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AIの呼び出しに失敗した" }, { status: 502 });
  }
}
