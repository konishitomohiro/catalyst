import type { HistoryRecord } from "./types";

export const INITIAL_HISTORY: HistoryRecord[] = [
  {
    id: "rec-20261106",
    date: "2026年11月6日",
    timeRange: "10:30 〜 10:44",
    duration: "14分間",
    sender: "医師",
    recipient: "患者",
    summary: "胃の重さへの胃薬追加と、痛む時だけの頓服服用を確認",
    resolvedMemos: [
      {
        term: "NSAIDs",
        reading: "エヌセイズ",
        topic: "の胃への影響",
        resolution: "胃薬（レバミピド）の追加処方で安心と確認",
      },
      {
        term: "頓服",
        reading: "とんぷく",
        topic: "の飲むタイミング",
        resolution: "痛みが我慢できない時のみ、6時間以上あけて服用",
      },
    ],
    transcript: [
      {
        id: "msg-1",
        senderRole: "医師",
        recipientRole: "患者",
        text: "熱や痛みを抑えるため、NSAIDsを毎食後に服用してください。",
        timestamp: "10:32",
      },
      {
        id: "msg-2",
        senderRole: "患者",
        recipientRole: "医師",
        text: "わかりました。胃が痛くなりやすいのですが、胃薬も一緒に飲んだ方がよいですか？",
        timestamp: "10:34",
      },
      {
        id: "msg-3",
        senderRole: "医師",
        recipientRole: "患者",
        text: "その通りですね。胃を守るお薬も一緒に出しておきます。",
        timestamp: "10:36",
      },
      {
        id: "msg-4",
        senderRole: "医師",
        recipientRole: "患者",
        text: "もし痛みが引かない場合は、頓服として追加のお薬も飲んで構いません。",
        timestamp: "10:39",
      },
    ],
  },
  {
    id: "rec-20261028",
    date: "2026年10月28日",
    timeRange: "14:15 〜 14:26",
    duration: "11分間",
    sender: "医師",
    recipient: "薬剤師",
    summary: "経鼻チューブ2本の理由（交換頻度と予備確保）を共有",
    resolvedMemos: [
      {
        term: "チューブ2本",
        reading: "チューブにほん",
        topic: "の処方理由",
        resolution: "来週の定期交換用1本＋自己抜去時の緊急予備用1本と確認",
      },
    ],
    transcript: [
      {
        id: "msg-5",
        senderRole: "医師",
        recipientRole: "薬剤師",
        text: "来週の訪問時に、経鼻チューブを2本持って行ってください。",
        timestamp: "14:16",
      },
      {
        id: "msg-6",
        senderRole: "薬剤師",
        recipientRole: "医師",
        text: "2本ですね。念のため確認ですが、予備も含めた本数でしょうか？",
        timestamp: "14:18",
      },
      {
        id: "msg-7",
        senderRole: "医師",
        recipientRole: "薬剤師",
        text: "はい、患者さんが誤って抜いてしまうことがあるため、交換用1本と予備1本です。",
        timestamp: "14:20",
      },
    ],
  },
];
