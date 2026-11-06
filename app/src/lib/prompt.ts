// AIへの指示文（例/Docs/3_仕組み.md「AIへの指示文」）。
// AIは用語を見つけるだけ。意味の説明や答えは書かせない（医療で誤った答えは命に関わるため）。
import type { Role } from "./roles";

export function buildDetectionPrompt(args: {
  sender: Role;
  recipient: Role;
  utterance: string;
  context: string;
}): string {
  const { sender, recipient, utterance, context } = args;
  return `あなたは医療・介護の現場の会話を手伝うアシスタントです。
${sender}（話し手）が${recipient}（聞き手）に話した発言を読み、
${recipient}が理解するのに前提知識が必要そうな用語を見つけてください。

対象：
- ${recipient}が知らない可能性が高い専門用語・略語・単位
- 理由・頻度・期間・量など、${sender}の頭の中にある前提がないと意味が分からない語

守ること：
- 発言に出てきた表記のまま、語だけを返す。言い換え・説明・答えは書かない。
- 語ごとに、読みをひらがなで添える（ふりがなに使う）。読み以外は書かない。
- ${recipient}が普通に分かる日常語は返さない。
- 見つからなければ空の配列を返す。

これまでの会話（参考。ここからは選ばない）：
${context || "（なし）"}

今回の発言（ここから選ぶ）：
${utterance}`;
}
