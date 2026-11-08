# AGENTS.md（app/ ＝ アプリのコード）

作業を始める前に、必ず `../例/Docs/README.md`（AI向け入口）を読み、そこに書かれた順番とルールに従う。
決まったことの正本は `例/Docs/` のMarkdown。

- コマンドはこの `app/` フォルダで実行する。
- 作業後は `npm run check` が通ることを確かめる（lint・型・テスト・整形）。
- 対面の流れの状態（分かりますか？・質問リスト）は `src/lib/session.ts`、AI出力の検査は `src/lib/detection.ts`、AIへの指示文は `src/lib/prompt.ts`。
- 機能は「会話を聞く」だけ（`Session.tsx`、`/api/detect`、`detection.ts`）。「伝える前に確かめる」の画面は 2026-11-08 になくした。そのコード（`/api/premises`・`premise.ts`・`tests/premise-cases.json`）は 2026-11-09 に消した（戻すときは git の履歴から）。
- AIへの問い合わせは `src/lib/detect.ts`、呼び出し回数の上限は `src/lib/rateLimit.ts`。AI評価テストは `tests/eval-cases.json` と `npm run eval`（本物の Gemini を呼ぶので費用がかかる。指示文・モデル・検査を変えたときに回す）。
- 使っていなかった観点リスト（`viewpoints.ts`）と、画面の試作（`HomeView.tsx`・`RolesView.tsx` など）は 2026-11-09 に消した。
- リポジトリ直下は非エンジニアも見る。コードや設定ファイルは直下に置かず、この `app/` に置く。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
