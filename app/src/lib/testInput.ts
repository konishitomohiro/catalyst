import type { HistoryRecord } from "./history";
// テスト用サイトだけで使う、あらかじめ用意した発言・文章（2026-11-08、Tomo の依頼）。
// 声で入れると時間がかかるので、押すだけで「聞き取った発言」「書いた文章」として入れられる。
// 本番のサイトには出さない。出すのは、開発中（npm run dev）か、サーバーの環境変数 TEST_INPUT=1 のときだけ
// （Cloud Run の環境変数で切り替えられるよう、作るときではなく動かすときに読む。app/page.tsx）。
// 例文は架空（例/Docs/12_デモ動画.md の台本と、AI評価テストのケースから）。
import type { Role } from "./roles";

/** サーバー側で読む（app/page.tsx） */
export function testInputEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV === "development" || env.TEST_INPUT === "1";
}

export type TestScript = {
  title: string;
  sender: Role;
  recipient: Role;
  lines: string[];
};

/** 会話を聞く：話す人→聞く人ごとの台本。上から順に押すと会話になる */
export const TALK_SCRIPTS: TestScript[] = [
  {
    title: "痛み止めを変える（デモの場面4）",
    sender: "医師",
    recipient: "患者",
    lines: [
      "今日から痛み止めを変えますね。NSAIDsを毎食後に服用してください",
      "痛みが強いときは、こちらを頓服で使ってください",
      "痛みや熱を抑えるお薬の仲間のことです",
      "NSAIDsは胃が荒れやすいので、空腹では飲まないでください",
    ],
  },
  {
    title: "減量の提案（デモの場面5）",
    sender: "薬剤師",
    recipient: "医師",
    lines: ["eGFRが低いので、この薬は減量を提案します"],
  },
  {
    title: "床ずれと飲み込み",
    sender: "看護師",
    recipient: "介護者",
    lines: [
      "褥瘡の処置には、この軟膏を1日2回塗ってください",
      "嚥下機能が落ちているので、汁物にはとろみをつけてください",
      "夜間に容態が急変した場合は連絡してください",
    ],
  },
  {
    title: "グレープフルーツ",
    sender: "薬剤師",
    recipient: "患者",
    lines: ["この薬を飲んでいる間はグレープフルーツを食べないでください"],
  },
];

/** 伝える前に確かめる：書く人→相手ごとの文章 */
export const COMPOSE_SCRIPTS: TestScript[] = [
  {
    title: "チューブ2本（デモの場面3）",
    sender: "医師",
    recipient: "薬剤師",
    lines: [
      "来週の訪問のとき、胃ろうのチューブを2本持ってきてください",
      "来週の訪問のとき、胃ろうのチューブを2本持ってきてください。1本は交換用、もう1本は抜けたときの予備です",
      "念のため痛み止めを多めに出しておいてください",
      "アムロジピン5mgを1日1回朝食後、28日分でお願いします",
    ],
  },
  {
    title: "患者さんへの説明",
    sender: "医師",
    recipient: "患者",
    lines: [
      "この軟膏を塗ってください",
      "この薬は1日3回、毎食後に1錠ずつ飲んでください。2週間分です",
    ],
  },
  {
    title: "看護師・介護者へ",
    sender: "看護師",
    recipient: "介護者",
    lines: [
      "熱が37.5度あるので、今日の入浴はお休みにして、体をタオルで拭いてください",
    ],
  },
];

/** 今の職種の組に合う台本を先に、それ以外をあとに並べる */
export function scriptsFor(
  scripts: TestScript[],
  sender: Role,
  recipient: Role,
): TestScript[] {
  const match = (s: TestScript) =>
    s.sender === sender && s.recipient === recipient;
  return [...scripts.filter(match), ...scripts.filter((s) => !match(s))];
}

/**
 * テスト用の履歴（架空）。履歴の画面を、会話をしなくても試せるようにする。
 * 時刻は「入れたとき」から逆算する。id は固定なので、何度入れても増えない。
 */
export function sampleHistory(now = Date.now()): HistoryRecord[] {
  const h = 60 * 60 * 1000;
  const at = (hoursAgo: number, minutes: number) => ({
    startedAt: now - hoursAgo * h,
    endedAt: now - hoursAgo * h + minutes * 60 * 1000,
  });
  return [
    {
      id: "sample-1",
      ...at(2, 12),
      sender: "医師",
      recipient: "患者",
      items: [
        {
          term: "頓服",
          reading: "とんぷく",
          checked: true,
          quote: "症状が出たときだけ頓服で使ってください",
        },
        {
          term: "NSAIDs",
          reading: "えぬせいず",
          checked: false,
          quote: "NSAIDsを毎食後に服用してください",
        },
      ],
      lines: [
        "血圧は落ち着いていますね",
        "NSAIDsを毎食後に服用してください",
        "症状が出たときだけ頓服で使ってください",
        "次は2週間後に来てください",
      ],
    },
    {
      id: "sample-2",
      ...at(26, 8),
      sender: "看護師",
      recipient: "介護者",
      items: [
        {
          term: "褥瘡",
          reading: "じょくそう",
          checked: true,
          quote: "褥瘡の処置には、この軟膏を1日2回塗ってください",
        },
        {
          term: "急変",
          reading: "きゅうへん",
          checked: true,
          quote: "夜間に容態が急変した場合は連絡してください",
        },
      ],
      lines: [
        "褥瘡の処置には、この軟膏を1日2回塗ってください",
        "夜間に容態が急変した場合は連絡してください",
      ],
    },
    {
      id: "sample-3",
      ...at(72, 5),
      sender: "薬剤師",
      recipient: "患者",
      items: [],
      lines: [
        "この薬を飲んでいる間はグレープフルーツを食べないでください",
        "1日1回、朝食後に飲んでください",
      ],
    },
  ];
}
