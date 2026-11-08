// 発言から「前提が要りそうな言葉」を Gemini に探させ、コードで検査して返す。
// API（/api/detect）と AI評価テスト（npm run eval）の両方から使う。
import "server-only";
import {
  detectionJsonSchema,
  parseDetection,
  type DetectionResult,
} from "./detection";
import { getGemini, getModel } from "./gemini";
import {
  parsePremises,
  premiseJsonSchema,
  type PremiseResult,
} from "./premise";
import {
  buildDetectionPrompt,
  buildPremisePrompt,
  buildSummaryPrompt,
} from "./prompt";
import { parseSummary, summaryJsonSchema, type SummaryResult } from "./summary";
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

/** 送り手の確認（伝える前）：受け手が分からなそうな点を、文の中の場所と問いの組で返す */
export async function checkPremises(input: {
  sender: Role;
  recipient: Role;
  message: string;
}): Promise<PremiseResult> {
  const res = await getGemini().models.generateContent({
    model: getModel(),
    contents: buildPremisePrompt(input),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: premiseJsonSchema,
      temperature: 0,
    },
  });
  return parsePremises(res.text ?? "", input.message);
}

/** 履歴の要約：会話の文字から要点を作り、会話にない要点は捨てる */
export async function summarize(input: {
  sender: Role;
  recipient: Role;
  lines: string[];
}): Promise<SummaryResult> {
  const res = await getGemini().models.generateContent({
    model: getModel(),
    contents: buildSummaryPrompt(input),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: summaryJsonSchema,
      temperature: 0,
    },
  });
  return parseSummary(res.text ?? "", input.lines);
}
