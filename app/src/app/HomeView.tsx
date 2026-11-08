"use client";

import { Furi } from "./Furi";
import type { HistoryRecord } from "./types";

export function HomeView({
  onStartNewConversation,
  recentHistory,
  onOpenHistoryDetail,
}: {
  onStartNewConversation: () => void;
  recentHistory: HistoryRecord[];
  onOpenHistoryDetail: (record: HistoryRecord) => void;
}) {
  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-16">
      {/* 温かい挨拶とコンパニオンの紹介バナー */}
      <section className="w-full mb-space-md">
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
          <div className="flex items-start gap-space-sm">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                nature_people
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-headline-sm text-headline-sm text-on-surface">
                今日
                <ruby>
                  も<rt>きょう</rt>
                </ruby>
                、お
                <ruby>
                  話<rt>はなし</rt>
                </ruby>
                の
                <ruby>
                  隣<rt>となり</rt>
                </ruby>
                に。
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                <Furi text="{診察|しんさつ}や{相談|そうだん}の{中|なか}の「{分|わ}からない」に、その{場|ば}で{気|き}づけるようにします。" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ヒーローセクション：あたらしく始める */}
      <section className="w-full mb-space-xl">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span
                className="material-symbols-outlined text-primary text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mic
              </span>
              <span className="font-label-lg text-label-lg text-primary">
                あたらしく
                <ruby>
                  始<rt>はじ</rt>
                </ruby>
                める
              </span>
            </div>
            <span className="bg-primary-fixed text-on-primary-fixed font-ruby text-ruby px-space-xs py-0.5 rounded-full font-bold">
              <ruby>
                準備<rt>じゅんび</rt>
              </ruby>
              かんたん
            </span>
          </div>

          {/* メインアクションボタン */}
          <button
            aria-label="新しいお話を始めるボタン"
            onClick={onStartNewConversation}
            className="w-full min-h-[58px] px-space-md py-space-sm bg-primary text-on-primary rounded-full shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-space-sm cursor-pointer hover:bg-primary-container"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_circle
            </span>
            <span className="font-body-lg text-body-lg text-on-primary tracking-wide">
              <ruby>
                新<rt>あたら</rt>
              </ruby>
              しいお
              <ruby>
                話<rt>はなし</rt>
              </ruby>
              を
              <ruby>
                始<rt>はじ</rt>
              </ruby>
              める
            </span>
          </button>

          {/* 安心案内ガイド */}
          <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-xs">
            <span
              className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hearing
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant min-w-0">
              お
              <ruby>
                互<rt>たが</rt>
              </ruby>
              いにお
              <ruby>
                話<rt>はなし</rt>
              </ruby>
              しするだけで、
              <ruby>
                難<rt>むずか</rt>
              </ruby>
              しい
              <ruby>
                言葉<rt>ことば</rt>
              </ruby>
              をそっとメモします
            </p>
          </div>
        </div>
      </section>

      {/* これまでの記録（履歴） */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">
              history_edu
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              これまでの
              <ruby>
                記録<rt>きろく</rt>
              </ruby>
            </h2>
          </div>
          <span className="font-ruby text-ruby text-on-surface-variant">
            {recentHistory.length} 件の記録
          </span>
        </div>

        <div className="flex flex-col gap-space-sm">
          {recentHistory.map((item) => (
            <article
              key={item.id}
              onClick={() => onOpenHistoryDetail(item)}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-all cursor-pointer border border-outline-variant/30 flex flex-col gap-space-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  {item.date}
                </span>
                <span className="font-ruby text-ruby text-on-surface-variant">
                  {item.duration}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-primary">
                <span>{item.sender}</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
                <span>{item.recipient}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                {item.summary}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
