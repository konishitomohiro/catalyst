"use client";

import type { HistoryRecord } from "./types";

export function HistoryView({
  history,
  onSelectRecord,
}: {
  history: HistoryRecord[];
  onSelectRecord: (record: HistoryRecord) => void;
}) {
  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-24">
      {/* Screen Intro */}
      <div className="flex flex-col gap-space-xs mb-space-md">
        <div className="flex items-center gap-space-xs">
          <span
            className="material-symbols-outlined text-primary text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            history_edu
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            これまでの<ruby>記録<rt className="font-ruby text-ruby text-on-surface-variant">きろく</rt></ruby>（<ruby>履歴<rt className="font-ruby text-ruby text-on-surface-variant">りれき</rt></ruby>）
          </h2>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          いつでも<ruby>安心<rt className="font-ruby text-ruby">あんしん</rt></ruby>して<ruby>振<rt className="font-ruby text-ruby">ふ</rt></ruby>り<ruby>返<rt className="font-ruby text-ruby">かえ</rt></ruby>れる、たいせつな対話のメモです。
        </p>
      </div>

      {/* Visual Record Cards List */}
      <div className="flex flex-col gap-space-md">
        {history.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-space-lg text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">
              note_alt
            </span>
            <p className="font-body-md text-body-md">
              まだ記録がありません。「新しく始める」から会話をスタートしましょう。
            </p>
          </div>
        ) : (
          history.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectRecord(item)}
              className="relative bg-surface-container-lowest rounded-xl p-space-md shadow-[0_2px_12px_rgba(22,78,138,0.06)] hover:shadow-[0_6px_20px_rgba(22,78,138,0.12)] transition-all cursor-pointer group border border-outline-variant/30 flex flex-col gap-space-sm"
            >
              {/* Top Meta Line: Date & Duration */}
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      calendar_today
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {item.date}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                    {item.timeRange}（{item.duration}）
                  </span>
                </div>
              </div>

              {/* Dialogue Roles Participant Strip */}
              <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">
                      record_voice_over
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-ruby text-ruby text-on-surface-variant leading-none">
                      ご案内する方
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface truncate font-bold">
                      {item.sender}
                    </span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-outline-variant text-[20px] shrink-0">
                  arrow_forward
                </span>

                <div className="flex items-center gap-1.5 min-w-0 text-right">
                  <div className="flex flex-col min-w-0">
                    <span className="font-ruby text-ruby text-on-surface-variant leading-none">
                      ご案内を受ける方
                    </span>
                    <span className="font-label-sm text-label-sm text-primary truncate font-bold">
                      {item.recipient}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">
                      person
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Status Pill */}
              <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm w-fit">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  check_circle
                </span>
                <span>
                  {item.resolvedMemos.length} 件の質問メモを確認済み
                </span>
              </div>

              {/* AI Summary Notepad Highlight */}
              <div className="bg-surface-container-lowest border-l-4 border-primary-container pl-3 py-1">
                <span className="font-ruby text-ruby text-on-surface-variant uppercase tracking-wider font-bold">
                  まとめ
                </span>
                <p className="font-body-md text-body-md text-on-surface mt-0.5">
                  {item.summary}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-space-xs">
                <span className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md text-label-md group-hover:bg-primary-container transition-colors shadow-sm min-h-[44px]">
                  <span>この記録を見る</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
