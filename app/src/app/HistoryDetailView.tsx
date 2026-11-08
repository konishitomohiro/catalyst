"use client";

import type { HistoryRecord } from "./types";

export function HistoryDetailView({
  record,
  onBack,
}: {
  record: HistoryRecord;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-24 space-y-space-md">
      {/* 概要ヘッダーカード */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden border border-outline-variant/30">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>
        <div className="flex items-center justify-between gap-space-xs mt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">
                medical_services
              </span>
              対話の記録
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-2.5 py-1 rounded-lg">
            <span className="material-symbols-outlined text-[16px] text-primary">
              schedule
            </span>
            {record.duration}
          </span>
        </div>

        <div className="mt-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">event</span>
            {record.date} {record.timeRange}
          </p>
        </div>

        {/* お互いの立場バッジ */}
        <div className="mt-space-sm p-space-sm bg-surface-container-low rounded-xl">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center gap-space-xs">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  record_voice_over
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block font-label-sm text-label-sm text-primary font-bold">
                  ご案内する方
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-normal truncate block">
                  {record.sender}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center gap-space-xs">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  person
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block font-label-sm text-label-sm text-secondary font-bold">
                  ご案内を受ける方
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-normal truncate block">
                  {record.recipient}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 解決した質問メモ */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span
              className="material-symbols-outlined text-primary text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              task_alt
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              <ruby>
                解決<rt>かいけつ</rt>
              </ruby>
              した
              <ruby>
                質問<rt>しつもん</rt>
              </ruby>
              メモ
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
            {record.resolvedMemos.length} 件 確認済み
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          このお話の間に疑問が解消された項目です。
        </p>

        <div className="space-y-space-xs">
          {record.resolvedMemos.map((memo, idx) => (
            <div
              key={`memo-${idx}`}
              className="bg-surface-container-low rounded-lg p-space-sm flex items-start gap-space-sm"
            >
              <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-[16px]">
                  check
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-label-sm text-label-sm font-bold">
                    用語：{memo.term}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-bold">
                    {memo.topic}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    lightbulb
                  </span>
                  <span>{memo.resolution}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 会話タイムライン（文字起こし全体） */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm border border-outline-variant/30">
        <div className="flex items-center gap-space-xs mb-2">
          <span className="material-symbols-outlined text-primary text-[22px]">
            forum
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            対話の文字起こし
          </h2>
        </div>

        <div className="flex flex-col gap-space-sm">
          {record.transcript.map((msg) => {
            const isSender = msg.senderRole === record.sender;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-space-xs max-w-[92%] ${
                  isSender ? "self-start" : "self-end flex-row-reverse"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">
                    {isSender ? "record_voice_over" : "person"}
                  </span>
                </div>
                <div
                  className={`p-space-sm rounded-2xl shadow-sm text-body-md ${
                    isSender
                      ? "bg-surface-container-low text-on-surface rounded-tl-sm"
                      : "bg-primary-container text-on-primary rounded-tr-sm"
                  }`}
                >
                  <span className="block font-ruby text-ruby opacity-80 mb-0.5">
                    {msg.senderRole} ({msg.timestamp})
                  </span>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 戻るボタン */}
      <div className="flex justify-center pt-space-xs">
        <button
          onClick={onBack}
          className="min-h-[48px] px-space-lg rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
        >
          一覧に戻る
        </button>
      </div>
    </div>
  );
}
