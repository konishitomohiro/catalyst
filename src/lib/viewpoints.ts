// 観点リスト（例/Docs/3_仕組み.md「観点リスト」）。
// ルール4：観点はコードで固定し、AIは増やせない。変更するときは人に聞く。

export const RECIPIENTS = ["pharmacist", "patient"] as const;
export type Recipient = (typeof RECIPIENTS)[number];

export type Viewpoint = { id: string; label: string };

export const VIEWPOINTS = {
  pharmacist: [
    { id: "quantity_reason", label: "数量・本数の根拠" },
    { id: "duration_frequency", label: "使う期間・交換の頻度" },
    { id: "purpose", label: "何のために必要か" },
    { id: "patient_condition", label: "前提となる患者の状態" },
    { id: "shortage_surplus", label: "足りない・余ったときの対応" },
  ],
  patient: [
    { id: "jargon", label: "専門用語" },
    { id: "why_needed", label: "なぜ必要か" },
    { id: "when_how_much", label: "いつ・どのくらい（頻度・期間）" },
    { id: "dont", label: "してはいけないこと" },
    { id: "contact", label: "困ったときの連絡先" },
  ],
} as const satisfies Record<Recipient, readonly Viewpoint[]>;

export type ViewpointId = (typeof VIEWPOINTS)[Recipient][number]["id"];

export function viewpointIds(recipient: Recipient): string[] {
  return VIEWPOINTS[recipient].map((v) => v.id);
}
