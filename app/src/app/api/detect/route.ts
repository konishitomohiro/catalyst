import { z } from "zod";
import { detectionJsonSchema, parseDetection } from "@/lib/detection";
import { getGemini, getModel } from "@/lib/gemini";
import { buildDetectionPrompt } from "@/lib/prompt";
import { ROLES } from "@/lib/roles";

const bodySchema = z.object({
  sender: z.enum(ROLES),
  recipient: z.enum(ROLES),
  utterance: z.string().min(1).max(2000),
  context: z.string().max(4000).default(""),
});

export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return Response.json({ error: "入力の形が違う" }, { status: 400 });
  }

  let ai, model;
  try {
    ai = getGemini();
    model = getModel();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }

  try {
    const res = await ai.models.generateContent({
      model,
      contents: buildDetectionPrompt(body.data),
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: detectionJsonSchema,
        temperature: 0,
      },
    });
    const result = parseDetection(res.text ?? "", body.data.utterance);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 });
    }
    return Response.json({ terms: result.terms });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AIの呼び出しに失敗した" }, { status: 502 });
  }
}
