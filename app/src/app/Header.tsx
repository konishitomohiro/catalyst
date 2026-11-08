"use client";

import type { ReactNode } from "react";

export function Header({
  title,
  onBack,
  onEndConversation,
  textSize,
  onCycleTextSize,
}: {
  title: ReactNode;
  onBack?: () => void;
  onEndConversation?: () => void;
  textSize: "sm" | "md" | "lg";
  onCycleTextSize: () => void;
}) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(22,78,138,0.05)] pt-safe">
      <div className="h-20 px-margin flex items-center justify-between gap-space-sm max-w-xl mx-auto">
        <div className="flex items-center gap-space-sm min-w-0">
          {onBack ? (
            <button
              aria-label="戻る"
              onClick={onBack}
              className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface transition-colors flex-shrink-0 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">
                arrow_back
              </span>
            </button>
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                medical_services
              </span>
            </div>
          )}
          <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-space-xs flex-shrink-0">
          {onEndConversation && (
            <button
              onClick={onEndConversation}
              aria-label="対話を終了する"
              className="h-12 px-space-sm rounded-xl bg-error-container hover:bg-error/20 text-on-error-container font-label-md text-label-md flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                stop_circle
              </span>
              <span>
                <ruby>
                  終了<rt className="font-ruby text-ruby">しゅうりょう</rt>
                </ruby>
              </span>
            </button>
          )}

          <button
            onClick={onCycleTextSize}
            aria-label="文字サイズの変更"
            className="min-w-[48px] h-12 px-space-xs rounded-xl bg-surface-container hover:bg-surface-variant flex items-center justify-center gap-0.5 text-on-surface transition-colors cursor-pointer"
          >
            <span
              className={`font-label-sm text-label-sm font-bold ${
                textSize === "sm" ? "text-primary" : ""
              }`}
            >
              小
            </span>
            <span
              className={`font-label-md text-label-md font-bold ${
                textSize === "md" ? "text-primary" : ""
              }`}
            >
              中
            </span>
            <span
              className={`font-label-lg text-label-lg font-bold ${
                textSize === "lg" ? "text-primary" : ""
              }`}
            >
              大
            </span>
          </button>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
