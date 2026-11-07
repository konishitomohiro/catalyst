// AI評価テスト用の設定（npm run eval）。本物の Gemini を呼ぶので、ふだんのテストとは分ける。
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  // .env.local の値を読む（GOOGLE_CLOUD_PROJECT・GEMINI_MODEL など）。シェルで設定した値もそのまま使える
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const missing = ["GOOGLE_CLOUD_PROJECT", "GEMINI_MODEL"].filter(
    (k) => !env[k],
  );
  if (missing.length > 0) {
    console.warn(
      [
        "",
        `AI評価テストを飛ばします：${missing.join("・")} が設定されていません。`,
        existsSync(".env.local")
          ? "  app/.env.local はありますが、値が空です。"
          : "  app/.env.local が見つかりません（.env.example をコピーして作ります）。",
        "  1. app/.env.local に GOOGLE_CLOUD_PROJECT=（プロジェクトID）と GEMINI_MODEL=（モデル名）を書く",
        "  2. gcloud auth application-default login を済ませる",
        "  3. もう一度 npm run eval",
        "",
      ].join("\n"),
    );
  }

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        // Next.js の外で動かすので、サーバー専用の印は空のものに置き換える
        "server-only": fileURLToPath(
          new URL("./src/eval/server-only-stub.ts", import.meta.url),
        ),
      },
    },
    test: {
      include: ["src/eval/**/*.eval.ts"],
      env,
    },
  };
});
