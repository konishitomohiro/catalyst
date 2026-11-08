"use client";

import { useState } from "react";
import { ROLE_READING, ROLES, type Role } from "@/lib/roles";

interface PairInfo {
  gap: string;
  support: string;
}

const PAIR_MATRIX: Record<string, PairInfo> = {
  "医師->患者": {
    gap: "専門用語や数値の意味、お薬を飲む理由が早口で分かりにくいことがあります。",
    support:
      "難しい医療用語をその場でやさしく言い換え、質問カードを作って手元にお届けします。",
  },
  "医師->薬剤師": {
    gap: "処方の意図や用量変更の根拠、検査値の背景が省略されがちです。",
    support: "疑義照会や残薬調整に必要なキーフレーズを優先記録します。",
  },
  "医師->看護師": {
    gap: "指示の優先順位や、急変時の具体的な観察ポイントの伝達もれ。",
    support:
      "「いつまでに・何を観察するか」のタスクを整理して箇条書きにします。",
  },
  "医師->介護者": {
    gap: "自宅での見守り負担や、食事・服薬の現実的な管理難度への配慮。",
    support: "日常生活で「気をつけること」を3つに絞って表示します。",
  },
  "患者->医師": {
    gap: "緊張から「本当のつらさ」や飲み忘れを言い出せないことがあります。",
    support:
      "話したいことリストと照らし合わせ、まだ伝えていない不安をそっと合図します。",
  },
  "薬剤師->患者": {
    gap: "副作用や併用禁忌の説明が多く、どれが一番大事か混乱しやすい。",
    support:
      "服薬タイミングごとの色分けカードと、注意サインをわかりやすくまとめます。",
  },
  "看護師->患者": {
    gap: "検査や処置の手順への不安、痛みの程度の心構え。",
    support: "処置のステップと所要時間の見通しをやさしく可視化します。",
  },
  "介護者->医師": {
    gap: "本人の前では言いにくい夜間の様子や、介護者自身の疲労が隠れがちです。",
    support: "生活の困りごとを具体的なエピソードとして整理する手助けをします。",
  },
};

const DEFAULT_PAIR_INFO: PairInfo = {
  gap: "お互いの専門知識や前提の違いにより、意図や理由が伝わりにくいことがあります。",
  support:
    "言葉の前提や確認したい疑問をリアルタイムでメモし、質問できるよう手助けします。",
};

const ROLE_ICONS: Record<Role, string> = {
  医師: "stethoscope",
  看護師: "medical_services",
  薬剤師: "medication",
  患者: "person",
  介護者: "volunteer_activism",
};

export function RolesView({
  initialSender = "医師",
  initialRecipient = "患者",
  onConfirm,
}: {
  initialSender?: Role;
  initialRecipient?: Role;
  onConfirm: (sender: Role, recipient: Role) => void;
}) {
  const [sender, setSender] = useState<Role>(initialSender);
  const [recipient, setRecipient] = useState<Role>(initialRecipient);

  const pairKey = `${sender}->${recipient}`;
  const pairInfo = PAIR_MATRIX[pairKey] || DEFAULT_PAIR_INFO;

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-28">
      {/* Friendly Guidance Context */}
      <section className="flex flex-col gap-space-sm mb-space-lg">
        <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed w-fit shadow-sm">
          <span className="material-symbols-outlined text-[18px]">
            record_voice_over
          </span>
          <span className="font-label-sm text-label-sm font-bold">
            <ruby>
              対話<rt>たいわ</rt>
            </ruby>
            の
            <ruby>
              準備<rt>じゅんび</rt>
            </ruby>
          </span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface leading-loose">
          <ruby>
            誰<rt>だれ</rt>
          </ruby>
          から
          <ruby>
            誰<rt>だれ</rt>
          </ruby>
          への
          <ruby>
            言葉<rt>ことば</rt>
          </ruby>
          を
          <ruby>
            支<rt>ささ</rt>
          </ruby>
          えますか？
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          お
          <ruby>
            互<rt>たが</rt>
          </ruby>
          いの
          <ruby>
            立場<rt>たちば</rt>
          </ruby>
          に
          <ruby>
            合<rt>あ</rt>
          </ruby>
          わせて、わかりやすい
          <ruby>
            言葉<rt>ことば</rt>
          </ruby>
          に
          <ruby>
            整<rt>ととの</rt>
          </ruby>
          えて
          <ruby>
            画面<rt>がめん</rt>
          </ruby>
          に
          <ruby>
            表示<rt>ひょうじ</rt>
          </ruby>
          します。
        </p>
      </section>

      {/* Visual Relationship Graphic Banner */}
      <div className="w-full bg-surface-container-low rounded-xl p-space-md shadow-sm mb-space-lg flex items-center justify-between gap-space-xs">
        <div className="flex flex-col items-center justify-center flex-1 min-w-0 bg-surface rounded-lg p-space-xs py-space-sm border border-outline-variant/30 text-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant mb-1 font-bold">
            ご案内する方
          </span>
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-sm my-1">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {ROLE_ICONS[sender]}
            </span>
          </div>
          <span className="font-label-md text-label-md text-on-surface font-bold truncate mt-1">
            <ruby>
              {sender}
              <rt>{ROLE_READING[sender]}</rt>
            </ruby>
          </span>
        </div>

        <div className="flex flex-col items-center justify-center flex-shrink-0 px-space-xs">
          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </div>
          <span className="font-ruby text-ruby text-secondary font-bold mt-1 text-center whitespace-nowrap">
            ご案内
          </span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 min-w-0 bg-surface rounded-lg p-space-xs py-space-sm border border-outline-variant/30 text-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant mb-1 font-bold">
            ご案内を受ける方
          </span>
          <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shadow-sm my-1">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {ROLE_ICONS[recipient]}
            </span>
          </div>
          <span className="font-label-md text-label-md text-on-surface font-bold truncate mt-1">
            <ruby>
              {recipient}
              <rt>{ROLE_READING[recipient]}</rt>
            </ruby>
          </span>
        </div>
      </div>

      {/* Role Selector 1: Sender (お話しする方) */}
      <fieldset className="mb-space-lg">
        <legend className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface mb-space-sm">
          <span className="w-2.5 h-6 rounded-full bg-primary inline-block"></span>
          <span className="font-bold">1. ご案内する方（お話しする方）</span>
        </legend>
        <div className="grid grid-cols-2 gap-space-xs">
          {ROLES.map((r) => {
            const selected = sender === r;
            return (
              <button
                key={`sender-${r}`}
                type="button"
                onClick={() => setSender(r)}
                className={`min-h-[56px] w-full p-space-sm rounded-xl shadow-sm flex items-center justify-between text-left transition-all cursor-pointer ${
                  selected
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container text-on-surface hover:bg-surface-variant"
                }`}
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <span
                    className="material-symbols-outlined text-[26px] flex-shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {ROLE_ICONS[r]}
                  </span>
                  <span className="font-label-md text-label-md whitespace-nowrap font-bold">
                    <ruby>
                      {r}
                      <rt className="font-ruby text-ruby">{ROLE_READING[r]}</rt>
                    </ruby>
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[22px] flex-shrink-0 ${
                    selected ? "opacity-100" : "opacity-0"
                  }`}
                >
                  check_circle
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Role Selector 2: Receiver (お聞きになる方) */}
      <fieldset className="mb-space-lg">
        <legend className="flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface mb-space-sm">
          <span className="w-2.5 h-6 rounded-full bg-secondary inline-block"></span>
          <span className="font-bold">
            2. ご案内を受ける方（この端末を持つ方）
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-space-xs">
          {ROLES.map((r) => {
            const selected = recipient === r;
            return (
              <button
                key={`recipient-${r}`}
                type="button"
                onClick={() => setRecipient(r)}
                className={`min-h-[56px] w-full p-space-sm rounded-xl shadow-sm flex items-center justify-between text-left transition-all cursor-pointer ${
                  selected
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container text-on-surface hover:bg-surface-variant"
                }`}
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <span
                    className="material-symbols-outlined text-[26px] flex-shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {ROLE_ICONS[r]}
                  </span>
                  <span className="font-label-md text-label-md whitespace-nowrap font-bold">
                    <ruby>
                      {r}
                      <rt className="font-ruby text-ruby">{ROLE_READING[r]}</rt>
                    </ruby>
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[22px] flex-shrink-0 ${
                    selected ? "opacity-100" : "opacity-0"
                  }`}
                >
                  check_circle
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Live Dynamic Support Preview Card */}
      <section className="bg-surface-container-low rounded-xl p-space-md shadow-sm mb-space-lg border border-outline-variant/30 flex flex-col gap-space-xs">
        <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm font-bold">
          <span className="material-symbols-outlined text-[18px]">
            psychology
          </span>
          <span>起きやすい前提のズレとサポート</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface font-medium leading-relaxed">
          {pairInfo.gap}
        </p>
        <div className="bg-surface-container-lowest rounded-lg p-space-xs px-space-sm text-primary font-body-sm text-body-sm flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">
            lightbulb
          </span>
          <span>{pairInfo.support}</span>
        </div>
      </section>

      {/* Sticky Confirmation Anchor at Base */}
      <div className="fixed bottom-0 left-0 right-0 p-margin bg-surface/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40 flex justify-center">
        <button
          className="w-full max-w-md min-h-[54px] rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-lg flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all cursor-pointer"
          onClick={() => onConfirm(sender, recipient)}
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">hearing</span>
          <span>この設定で会話をはじめる</span>
          <span className="material-symbols-outlined text-[20px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
