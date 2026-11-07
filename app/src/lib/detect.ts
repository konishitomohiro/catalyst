// 発言から「前提が要りそうな言葉」を Gemini に探させ、コードで検査して返す。
// API（/api/detect）と AI評価テスト（npm run eval）の両方から使う。
import "server-only";
import {
  detectionJsonSchema,
  parseDetection,
  type DetectionResult,
} from "./detection";
import { getGemini, getModel } from "./gemini";
import { buildDetectionPrompt } from "./prompt";
import type { Role } from "./roles";

export async function detectTerms(input: {
  sender: Role;
  recipient: Role;
  utterance: string;
  context: string;
}): Promise<DetectionResult> {
  const res = await getGemini().models.generateContent({
    model: getModel(),
    contents: buildDetectionPrompt(input),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: detectionJsonSchema,
      temperature: 0,
    },
  });
  return parseDetection(res.text ?? "", input.utterance);
}
