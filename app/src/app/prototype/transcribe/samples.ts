import type { ExpectedWord } from "@/lib/transcriptCheck";

// 読み上げて試す文（架空の例）。accept は「正しく文字になった」とみなす書き方。
export const SAMPLES: { sentence: string; words: ExpectedWord[] }[] = [
  {
    sentence: "NSAIDsを毎食後に服用してください",
    words: [
      {
        word: "NSAIDs",
        accept: ["NSAIDs", "NSAID", "エヌセイズ", "エヌセイド"],
      },
      { word: "服用", accept: ["服用"] },
    ],
  },
  {
    sentence: "症状が出たときだけ頓服で使ってください",
    words: [{ word: "頓服", accept: ["頓服"] }],
  },
  {
    sentence: "胃ろう交換のため、チューブを14Frで2本持参してください",
    words: [
      { word: "胃ろう", accept: ["胃ろう", "胃瘻", "イロウ"] },
      { word: "14Fr", accept: ["14Fr", "14フレンチ", "14fr"] },
      { word: "持参", accept: ["持参"] },
    ],
  },
  {
    sentence: "次回の訪問でカテーテルを交換します",
    words: [{ word: "カテーテル", accept: ["カテーテル"] }],
  },
  {
    sentence: "褥瘡の処置には、この軟膏を1日2回塗ってください",
    words: [
      { word: "褥瘡", accept: ["褥瘡", "じょくそう", "ジョクソウ"] },
      { word: "軟膏", accept: ["軟膏"] },
    ],
  },
  {
    sentence: "夜間に容態が急変した場合は連絡してください",
    words: [
      { word: "容態", accept: ["容態", "容体"] },
      { word: "急変", accept: ["急変"] },
    ],
  },
];
