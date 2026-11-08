"use client";

export type NavTab = "home" | "conversation" | "history";

export function BottomNav({
  activeTab,
  onSelectTab,
}: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}) {
  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(22,78,138,0.06)] border-t border-outline-variant/30">
      <div className="flex items-center justify-around h-20 px-space-xs max-w-lg mx-auto">
        <button
          onClick={() => onSelectTab("home")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[52px] transition-colors cursor-pointer ${
            activeTab === "home"
              ? "text-primary font-bold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-[26px]"
            style={
              activeTab === "home"
                ? { fontVariationSettings: "'FILL' 1" }
                : undefined
            }
          >
            home
          </span>
          <span className="font-label-sm text-label-sm mt-0.5">ホーム</span>
        </button>

        <button
          onClick={() => onSelectTab("conversation")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[52px] transition-colors cursor-pointer ${
            activeTab === "conversation"
              ? "text-primary font-bold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-[26px]"
            style={
              activeTab === "conversation"
                ? { fontVariationSettings: "'FILL' 1" }
                : undefined
            }
          >
            forum
          </span>
          <span className="font-label-sm text-label-sm mt-0.5">会話</span>
        </button>

        <button
          onClick={() => onSelectTab("history")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[52px] transition-colors cursor-pointer ${
            activeTab === "history"
              ? "text-primary font-bold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-[26px]"
            style={
              activeTab === "history"
                ? { fontVariationSettings: "'FILL' 1" }
                : undefined
            }
          >
            history_edu
          </span>
          <span className="font-label-sm text-label-sm mt-0.5">履歴</span>
        </button>
      </div>
    </nav>
  );
}
