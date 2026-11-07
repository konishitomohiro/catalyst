// 送り手の確認（伝える前）：文章から、受け手が分からなそうな点を返す
import { z } from "zod";
import { checkPremises } from "@/lib/detect";
import { getGemini, getModel } from "@/lib/gemini";
import { tooManyRequests } from "@/lib/limiters";
import { MAX_MESSAGE } from "@/lib/limits";
import { ROLES } from "@/lib/roles";

const bodySchema = z.object({
  sender: z.enum(ROLES),
  recipient: z.enum(ROLES),
  message: z.string().trim().min(1).max(MAX_MESSAGE),
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
    const result = await checkPremises(body.data);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 });
    }
    return Response.json({ points: result.points });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AIの呼び出しに失敗した" }, { status: 502 });
  }
}
