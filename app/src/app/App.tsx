"use client";

import { useEffect, useState } from "react";
import type { Role } from "@/lib/roles";
import { BottomNav, type NavTab } from "./BottomNav";
import { Header } from "./Header";
import { HistoryDetailView } from "./HistoryDetailView";
import { HistoryView } from "./HistoryView";
import { HomeView } from "./HomeView";
import { INITIAL_HISTORY } from "./mockData";
import { RolesView } from "./RolesView";
import { Session } from "./Session";
import type { HistoryRecord } from "./types";

type View = "home" | "roles" | "conversation" | "history" | "history-detail";
type TextSize = "sm" | "md" | "lg";

export function App() {
  const [view, setView] = useState<View>("home");
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [roles, setRoles] = useState<{ sender: Role; recipient: Role }>({
    sender: "医師",
    recipient: "患者",
  });
  const [history, setHistory] = useState<HistoryRecord[]>(INITIAL_HISTORY);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(
    null,
  );
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [confirmExit, setConfirmExit] = useState(false);

  // localStorage からの履歴読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem("catalyst_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 履歴保存
  function handleSaveHistory(record: HistoryRecord) {
    setHistory((prev) => {
      const next = [record, ...prev];
      try {
        localStorage.setItem("catalyst_history", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  // 文字サイズの巡回切り替え
  function cycleTextSize() {
    setTextSize((current) => {
      if (current === "sm") return "md";
      if (current === "md") return "lg";
      return "sm";
    });
  }

  // ナビゲーションタブ切り替え
  function handleSelectTab(tab: NavTab) {
    setActiveTab(tab);
    if (tab === "home") {
      setView("home");
    } else if (tab === "conversation") {
      // すでにロールが選ばれていれば会話へ、そうでなければロール選択へ
      setView("conversation");
    } else if (tab === "history") {
      setView("history");
    }
  }

  // タイトルと戻るボタンの判定
  let title = "ホーム";
  let showBackButton = false;
  let onBackAction: (() => void) | undefined = undefined;

  if (view === "home") {
    title = "ホーム";
  } else if (view === "roles") {
    title = "職種の選択";
    showBackButton = true;
    onBackAction = () => {
      setView("home");
      setActiveTab("home");
    };
  } else if (view === "conversation") {
    title = "対話";
    showBackButton = true;
    onBackAction = () => {
      setConfirmExit(true);
    };
  } else if (view === "history") {
    title = "これまでの記録";
    showBackButton = true;
    onBackAction = () => {
      setView("home");
      setActiveTab("home");
    };
  } else if (view === "history-detail") {
    title = "診察記録詳細";
    showBackButton = true;
    onBackAction = () => {
      setView("history");
      setActiveTab("history");
    };
  }

  // 文字サイズクラス
  const textSizeClass =
    textSize === "sm"
      ? "text-[90%]"
      : textSize === "lg"
        ? "text-[115%]"
        : "text-[100%]";

  return (
    <div
      className={`min-h-screen bg-surface flex flex-col transition-all ${textSizeClass}`}
    >
      <Header
        title={title}
        onBack={showBackButton ? onBackAction : undefined}
        onEndConversation={
          view === "conversation" ? () => setConfirmExit(true) : undefined
        }
        textSize={textSize}
        onCycleTextSize={cycleTextSize}
      />

      <main className="flex-1 w-full pt-20 px-margin">
        {view === "home" && (
          <HomeView
            onStartNewConversation={() => setView("roles")}
            recentHistory={history.slice(0, 3)}
            onOpenHistoryDetail={(rec) => {
              setSelectedRecord(rec);
              setView("history-detail");
            }}
          />
        )}

        {view === "roles" && (
          <RolesView
            initialSender={roles.sender}
            initialRecipient={roles.recipient}
            onConfirm={(sender, recipient) => {
              setRoles({ sender, recipient });
              setView("conversation");
              setActiveTab("conversation");
            }}
          />
        )}

        {view === "conversation" && (
          <Session
            sender={roles.sender}
            recipient={roles.recipient}
            onExit={() => {
              setConfirmExit(false);
              setView("home");
              setActiveTab("home");
            }}
            onSaveHistory={handleSaveHistory}
            confirmExit={confirmExit}
            setConfirmExit={setConfirmExit}
          />
        )}

        {view === "history" && (
          <HistoryView
            history={history}
            onSelectRecord={(rec) => {
              setSelectedRecord(rec);
              setView("history-detail");
            }}
          />
        )}

        {view === "history-detail" && selectedRecord && (
          <HistoryDetailView
            record={selectedRecord}
            onBack={() => {
              setView("history");
              setActiveTab("history");
            }}
          />
        )}
      </main>

      {/* 会話中以外はボトムナビゲーションを表示 */}
      {view !== "conversation" && (
        <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />
      )}
    </div>
  );
}
