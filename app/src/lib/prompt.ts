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
- 発言の中で、すでに言い換えや説明がある語（例：「〇〇（△△）」の形や、直前に意味が書いてある語）は返さない。
- 見つからなければ空の配列を返す。

これまでの会話（参考。ここからは選ばない）：
${context || "（なし）"}

今回の発言（ここから選ぶ）：
${utterance}`;
}

/** 送り手の確認（伝える前）の指示文。AIは問いだけを返し、根拠や答えは書かない */
export function buildPremisePrompt(args: {
  sender: Role;
  recipient: Role;
  message: string;
}): string {
  const { sender, recipient, message } = args;
  return `あなたは医療・介護の現場の連絡を手伝うアシスタントです。
${sender}が${recipient}に伝えようとしている文章を読み、
${recipient}が受け取ったときに、理由や前提が分からずに困りそうな点を見つけてください。

見る点の例：
- 量・本数・回数の根拠（なぜその数か）
- 期間・頻度・タイミング
- 何のために必要か
- 前提となる患者の状態
- 足りない・余った・うまくいかないときの対応
- ${recipient}が知らない可能性が高い専門用語・略語

守ること：
- 点ごとに、文の中の該当する部分（quote：文に出てきた表記のまま、短く）と、${recipient}が抱きそうな問い（question：「〜？」の形で短く）を返す。
- 根拠・答え・言い換え・説明は書かない。根拠を知っているのは${sender}だけなので、問いだけを返す。
- 文の中ですでに理由や説明が書いてある点は返さない。
- 大事なものから3つまで。困りそうな点がなければ空の配列を返す。

文章：
${message}`;
}
