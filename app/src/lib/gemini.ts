// Gemini API のクライアント。キーとモデル名は環境変数から読む（.env.example）。
import "server-only";
import { GoogleGenAI } from "@google/genai";

export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY が設定されていない");
  return new GoogleGenAI({ apiKey });
}

export function getModel() {
  const model = process.env.GEMINI_MODEL;
  if (!model) throw new Error("GEMINI_MODEL が設定されていない");
  return model;
}
