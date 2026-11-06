# app（アプリのコード）

コマンドはすべてこの `app/` フォルダで実行する。何を作るかは [`../例/Docs/`](../例/Docs/README.md) を先に読む。

## 技術構成

| 用途         | 使うもの                                        |
| ------------ | ----------------------------------------------- |
| 画面とAPI    | Next.js 16（App Router）+ TypeScript            |
| AI           | Gemini API（`@google/genai`）                   |
| AI出力の検査 | zod                                             |
| テスト       | Vitest                                          |
| lint・整形   | ESLint・Prettier                                |
| デプロイ     | Cloud Run（Dockerfile、`output: "standalone"`） |
| CI           | GitHub Actions（`../.github/workflows/ci.yml`） |

## はじめかた

Node.js 22 以上が必要（`.nvmrc`）。

```bash
cd app
npm install
cp .env.example .env.local   # GEMINI_API_KEY と GEMINI_MODEL を入れる
npm run dev                  # http://localhost:3000
```

## コマンド

| コマンド         | 内容                                                 |
| ---------------- | ---------------------------------------------------- |
| `npm run dev`    | 開発サーバー                                         |
| `npm run check`  | lint・型チェック・テスト・整形チェックをまとめて実行 |
| `npm test`       | テストだけ（`npm run test:watch` で監視）            |
| `npm run format` | 整形                                                 |
| `npm run build`  | 本番ビルド                                           |

## Cloud Run へのデプロイ

リポジトリ直下から：

```bash
gcloud run deploy catalyst --source app --region asia-northeast1 \
  --set-env-vars GEMINI_MODEL=gemini-2.5-flash \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

API キーは Secret Manager に `gemini-api-key` として入れておく。

## フォルダ

```
src/app/              画面とAPI
src/lib/viewpoints.ts 観点リスト（コードで固定）
src/lib/prediction.ts AIの出力の検査（形式・観点・件数）
src/lib/gemini.ts     Gemini クライアント
tests/cases.json      AI評価テストの入力10件
public/               画像などの静的ファイル
```
