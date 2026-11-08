// 履歴の要約：会話の文字から、聞いた人があとで見返す要点を返す。会話はどこにも残さない
import { z } from "zod";
import { summarize } from "@/lib/detect";
import { getGemini, getModel } from "@/lib/gemini";
import { tooManyRequests } from "@/lib/limiters";
import { MAX_SUMMARY_INPUT } from "@/lib/summary";
import { ROLES } from "@/lib/roles";

const bodySchema = z.object({
  sender: z.enum(ROLES),
  recipient: z.enum(ROLES),
  lines: z
    .array(z.string().max(MAX_SUMMARY_INPUT))
    .min(1)
    .max(200)
    .refine((ls) => ls.join("").length <= MAX_SUMMARY_INPUT),
});

export async function POST(request: Request) {
  const limited = tooManyRequests(request);
  if (limited) return limited;

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
    const result = await summarize(body.data);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 });
    }
    return Response.json({ points: result.points });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AIの呼び出しに失敗した" }, { status: 502 });
  }
}
