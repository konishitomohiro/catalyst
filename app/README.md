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

Node.js 22 以上（`.nvmrc`）と、Google Cloud の CLI（`gcloud`）が必要。

```bash
cd app
npm install
cp .env.example .env.local   # GOOGLE_CLOUD_PROJECT と GEMINI_MODEL を入れる
gcloud auth application-default login   # Vertex AI を呼ぶための認証（API キーは使わない）
npm run dev                  # http://localhost:3000
```

Gemini は **Vertex AI 経由**で呼ぶ。ハッカソンで配られる Google Cloud クレジットは、Google AI Studio の API キーには使えないため。
ログインしたアカウントに、そのプロジェクトで Vertex AI を使う権限（オーナー、または「Vertex AI ユーザー」）が要る。

## コマンド

| コマンド         | 内容                                                 |
| ---------------- | ---------------------------------------------------- |
| `npm run dev`    | 開発サーバー                                         |
| `npm run check`  | lint・型チェック・テスト・整形チェックをまとめて実行 |
| `npm test`       | テストだけ（`npm run test:watch` で監視）            |
| `npm run format` | 整形                                                 |
| `npm run build`  | 本番ビルド                                           |

## Cloud Run へのデプロイ

リポジトリ直下から。`PROJECT_ID` はクレジットを有効にしたプロジェクトの ID に置き換える。

1回だけ（API を有効にし、Cloud Run 用のサービスアカウントに Vertex AI を使う権限を付ける）：

```bash
gcloud config set project PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com
gcloud iam service-accounts create catalyst-run
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:catalyst-run@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/aiplatform.user
```

デプロイ（毎回）：

```bash
gcloud run deploy catalyst --source app --region asia-northeast1 \
  --service-account catalyst-run@PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars GOOGLE_CLOUD_PROJECT=PROJECT_ID,GOOGLE_CLOUD_LOCATION=global,GEMINI_MODEL=gemini-2.5-flash \
  --max-instances 2 --allow-unauthenticated
```

- API キーは使わないので、Secret Manager は要らない。
- `--max-instances 2` は費用事故の備え（例/Docs/9_直すこと.md #3）。予算アラートも別に設定する。
- `--allow-unauthenticated` を付けると、URL を知っている人は誰でも使える。発表が終わったら止める。

## フォルダ

```
src/app/              画面とAPI
src/lib/viewpoints.ts 観点リスト（コードで固定）
src/lib/prediction.ts AIの出力の検査（形式・観点・件数）
src/lib/gemini.ts     Gemini クライアント
tests/cases.json      AI評価テストの入力10件
public/               画像などの静的ファイル
```
