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

| コマンド         | 内容                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`    | 開発サーバー                                                                            |
| `npm run check`  | lint・型チェック・テスト・整形チェックをまとめて実行                                    |
| `npm test`       | テストだけ（`npm run test:watch` で監視）                                               |
| `npm run format` | 整形                                                                                    |
| `npm run build`  | 本番ビルド                                                                              |
| `npm run eval`   | AI評価テスト（本物の Gemini を呼ぶ。費用がかかる。`.env.local` と gcloud の認証が要る） |

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
src/app/              画面とAPI（ホーム・会話・/api/detect・文字起こしの試作）
src/lib/session.ts    対面の流れの状態（分かりますか？・質問リスト・取り消す）
src/lib/detect.ts     Gemini に前提が要りそうな言葉を探させる
src/lib/detection.ts  AIの出力の検査（形式・発言にある語だけ・読み・件数）
src/lib/prompt.ts     AIへの指示文
src/lib/gemini.ts     Gemini クライアント（Vertex AI）
src/lib/rateLimit.ts  呼び出し回数の上限
src/lib/viewpoints.ts これまでの案の観点リスト（今は使っていない）
src/eval/             AI評価テスト（npm run eval）
tests/eval-cases.json AI評価テストのケース10件（案）
public/               画像などの静的ファイル
```
