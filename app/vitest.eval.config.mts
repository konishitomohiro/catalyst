// AI評価テスト用の設定（npm run eval）。本物の Gemini を呼ぶので、ふだんのテストとは分ける。
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
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
    // .env.local の値を読む（GOOGLE_CLOUD_PROJECT・GEMINI_MODEL など）
    env: loadEnv(mode, process.cwd(), ""),
  },
}));
