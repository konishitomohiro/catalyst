// Gemini を Vertex AI 経由で呼ぶクライアント（例/Docs/3_仕組み.md「技術構成とデプロイ」）。
// ハッカソンで配られる Google Cloud クレジットは、Vertex AI に使える（Google AI Studio の API キーには使えない）。
// 認証は API キーではなく Google Cloud の認証情報（ADC）を使う：
// - Cloud Run：サービスのサービスアカウント（Vertex AI ユーザーの権限が要る）
// - 手元のパソコン：`gcloud auth application-default login`
import "server-only";
import { GoogleGenAI } from "@google/genai";

/** 地域を指定しないときの既定。global は、どの地域でも空いているところで動く */
const DEFAULT_LOCATION = "global";

export function getGemini() {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) throw new Error("GOOGLE_CLOUD_PROJECT が設定されていない");
  return new GoogleGenAI({
    vertexai: true,
    project,
    location: process.env.GOOGLE_CLOUD_LOCATION || DEFAULT_LOCATION,
  });
}

export function getModel() {
  const model = process.env.GEMINI_MODEL;
  if (!model) throw new Error("GEMINI_MODEL が設定されていない");
  return model;
}
