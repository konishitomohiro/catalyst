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
コマンドは1行ずつコピーして実行する（Mac の zsh は、行の後ろの `#` を説明文として扱わないため、説明はコマンドの外に書いている）。

**1. 使うプロジェクトの ID を確かめる。** 一覧の `PROJECT_ID` の列が ID（名前とは違う）。

```bash
gcloud projects list
```

**2. その ID を、このターミナルで覚えさせる。** `ここにID` を一覧の ID に書き換えて実行する。以降のコマンドは `$PROJECT_ID` のまま使える。

```bash
PROJECT_ID=ここにID
```

**3. gcloud とローカルの認証を、そのプロジェクトに合わせる。**

```bash
gcloud config set project $PROJECT_ID
```

```bash
gcloud auth application-default login
```

```bash
gcloud auth application-default set-quota-project $PROJECT_ID
```

**4. app フォルダで、設定ファイルを作る。**

```bash
cd app
```

```bash
npm install
```

```bash
printf 'GOOGLE_CLOUD_PROJECT=%s\nGOOGLE_CLOUD_LOCATION=global\nGEMINI_MODEL=gemini-3.8-flash\n' "$PROJECT_ID" > .env.local
```

`GEMINI_MODEL` は、Vertex AI のモデル一覧で最新のものを確かめて、`.env.local` を開いて書き換えてよい。

**5. 動かす。**

```bash
npm run eval
```

```bash
npm run dev
```

`npm run dev` のあと、Chrome で http://localhost:3000 を開く。

Gemini は **Vertex AI 経由**で呼ぶ。ハッカソンで配られる Google Cloud クレジットは、Google AI Studio の API キーには使えないため。
ログインしたアカウントに、そのプロジェクトで Vertex AI を使う権限（オーナー、または「Vertex AI ユーザー」）が要る。
初めてのプロジェクトでは、先に下の「1回だけ」の手順で Vertex AI の API を有効にする。

## うまくいかないとき

**`npm run eval` が「権限がないか、モデルが使えません（403）」になる。** 次を順に確かめる。`$PROJECT_ID` は「はじめかた」の 2 で覚えさせたもの。

0. **モデルの提供が終わっていないか。** エラーに「or it may not exist」とあれば、まずこれを疑う。Gemini のモデルは1年ほどで提供が終わる（例：`gemini-2.5-flash` は 2026年10月に Vertex AI での提供が終わった）。`.env.local` の `GEMINI_MODEL` を、今使えるモデル名（2026年11月時点の例：`gemini-3.8-flash`、`gemini-3.5-flash-lite`）にする。Cloud Run の環境変数も同じものにする。

1. Vertex AI の API が、そのプロジェクトで有効か。何も出なければ有効でない。

```bash
gcloud services list --enabled --project $PROJECT_ID --filter=aiplatform
```

有効でなければ、有効にする（数分かかることがある）。

```bash
gcloud services enable aiplatform.googleapis.com --project $PROJECT_ID
```

2. ログインしているアカウントと、そのアカウントの権限。`*` が付いているのが今のアカウント。

```bash
gcloud auth list
```

```bash
gcloud projects get-iam-policy $PROJECT_ID --flatten='bindings[].members' --format='table(bindings.role,bindings.members)'
```

一覧に、今のアカウントの `roles/owner` か `roles/aiplatform.user` がなければ、プロジェクトを作ったアカウントでログインし直すか、権限を付けてもらう。ログインし直すときは、`gcloud auth application-default login` も同じアカウントで行う。

3. **アプリが使う認証（ADC）のアカウントが、`gcloud auth list` と同じか。** 別々にログインするので、食い違うことがある（2026年11月7日、ADC だけ大学のアカウントになっていて 403 になった）。次の結果の `"email"` が、上の一覧で権限のあるアカウントか確かめる。

```bash
curl -s "https://oauth2.googleapis.com/tokeninfo?access_token=$(gcloud auth application-default print-access-token)" | grep email
```

違っていたら、ブラウザで権限のあるアカウントを選んでログインし直す。

```bash
gcloud auth application-default login
```

```bash
gcloud auth application-default set-quota-project $PROJECT_ID
```

**`npm run eval` が「認証がありません」になる。** `gcloud auth application-default login` を実行する。

**`npm run eval` が「モデルが見つかりません」になる。** `.env.local` の `GEMINI_MODEL` を、Vertex AI のモデル一覧にある名前にする。

## テスト用の入力（用意した発言）

声で入れると時間がかかるので、**テスト用のサイトだけ**、会話の画面に「テスト用：発言を入れる」の欄が出る。押すと、声で聞き取ったときと同じように発言が入る。中身は `src/lib/testInput.ts`（架空の例文。デモ動画の台本と AI評価テストのケースから）。

- `npm run dev`（ローカル）では、いつも出る。
- Cloud Run では、環境変数 `TEST_INPUT=1` があるときだけ出る。テスト用のサービスに出すときは、デプロイの `--set-env-vars` に `,TEST_INPUT=1` を足す（例：サービス名を `catalyst-test` にする）。本番（審査・デモ）のサービスには付けない。動かすときに読むので、作り直さなくても切り替えられる。

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

リポジトリ直下（`catalyst` フォルダ）から。先に上の「はじめかた」の 1〜3 で `PROJECT_ID` を覚えさせておく（ターミナルを開き直したら、2 をもう一度）。

1回だけ（API を有効にし、Cloud Run 用のサービスアカウントに Vertex AI を使う権限を付ける）：

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com
```

```bash
gcloud iam service-accounts create catalyst-run
```

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:catalyst-run@$PROJECT_ID.iam.gserviceaccount.com --role=roles/aiplatform.user
```

デプロイ（毎回）：

```bash
gcloud run deploy catalyst --source app --region asia-northeast1 --service-account catalyst-run@$PROJECT_ID.iam.gserviceaccount.com --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=global,GEMINI_MODEL=gemini-3.8-flash --max-instances 2 --allow-unauthenticated
```

- `already exists`（すでにある）と出たものは、作り直さなくてよい。

- API キーは使わないので、Secret Manager は要らない。
- `--max-instances 2` は費用事故の備え（例/Docs/9_直すこと.md #3）。予算アラートも別に設定する。
- `--allow-unauthenticated` を付けると、URL を知っている人は誰でも使える。発表が終わったら止める。

## フォルダ

```
src/app/              画面とAPI（だれと話すか・会話・履歴・/api/detect・/api/summary・文字起こしの試作）
src/lib/session.ts    対面の流れの状態（分かりますか？・質問リスト・取り消す）
src/lib/detect.ts     Gemini に前提が要りそうな言葉を探させる
src/lib/detection.ts  会話：AIの出力の検査（形式・発言にある語だけ・読み・件数）
src/lib/prompt.ts     AIへの指示文
src/lib/gemini.ts     Gemini クライアント（Vertex AI）
src/lib/rateLimit.ts  呼び出し回数の上限
src/eval/             AI評価テスト（npm run eval）
tests/eval-cases.json AI評価テストのケース（会話・10件・案）
public/               画像などの静的ファイル
```
