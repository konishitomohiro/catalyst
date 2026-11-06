# AGENTS.md

作業を始める前に、必ず `例/Docs/README.md`（AI向け入口）を読み、そこに書かれた順番とルールに従う。
決まったことの正本は `例/Docs/` のMarkdown。

- 作業後は `npm run check` が通ることを確かめる（lint・型・テスト・整形）。
- 観点リストは `src/lib/viewpoints.ts`、AI出力の検査は `src/lib/prediction.ts`、AI評価テストの入力は `tests/cases.json`。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
