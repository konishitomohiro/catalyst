"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { DetectedTerm } from "@/lib/detection";
import { MAX_CONTEXT, MAX_UTTERANCE } from "@/lib/limits";
import { ROLE_READING, type Role } from "@/lib/roles";
import { initialSession, sessionReducer, UNDO_MS } from "@/lib/session";
import { Furi, Term } from "./Furi";
import type { ChatMessage, HistoryRecord } from "./types";
import { useSpeechRecognition } from "./useSpeechRecognition";

const CONTEXT_LINES = 3;

export function Session({
  sender,
  recipient,
  onExit,
  onSaveHistory,
  confirmExit,
  setConfirmExit,
}: {
  sender: Role;
  recipient: Role;
  onExit: () => void;
  onSaveHistory: (record: HistoryRecord) => void;
  confirmExit: boolean;
  setConfirmExit: (open: boolean) => void;
}) {
  const [state, dispatch] = useReducer(sessionReducer, initialSession);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [simulatedSpeaker, setSimulatedSpeaker] = useState<Role>(sender);

  const linesRef = useRef<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 初回起動時の挨拶
  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages([
      {
        id: "initial-msg",
        senderRole: sender,
        recipientRole: recipient,
        text: `お話しをはじめます。聞き取り中にお互いの言葉から分かりにくい前提をメモしていきます。`,
        timestamp: timeStr,
      },
    ]);
  }, [sender, recipient]);

  async function detect(utterance: string, context: string) {
    setBusy((n) => n + 1);
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, recipient, utterance, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `エラー ${res.status}`);
      setAiError(null);
      dispatch({ type: "detected", terms: data.terms as DetectedTerm[] });
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setBusy((n) => n - 1);
    }
  }

  const speech = useSpeechRecognition((text) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      senderRole: simulatedSpeaker,
      recipientRole: simulatedSpeaker === sender ? recipient : sender,
      text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);

    const context = linesRef.current
      .slice(-CONTEXT_LINES)
      .join("\n")
      .slice(-MAX_CONTEXT);
    linesRef.current = [...linesRef.current, text];

    // 発話が送り手（案内する方）からの場合、前提検出を行う
    if (simulatedSpeaker === sender) {
      void detect(text.slice(0, MAX_UTTERANCE), context);
    }
  });

  // メッセージ追加時にスクロール
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, speech.interim]);

  // 取り消しタイマー
  useEffect(() => {
    if (!state.lastAnswer) return;
    const id = setTimeout(() => dispatch({ type: "undoExpired" }), UNDO_MS);
    return () => clearTimeout(id);
  }, [state.lastAnswer]);

  // 現在確認待ちの用語（先頭）
  const currentPending = state.pending[0] ?? null;

  function handleSaveAndExit() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    const record: HistoryRecord = {
      id: `rec-${Date.now()}`,
      date: dateStr,
      timeRange: `${messages[0]?.timestamp || "10:00"} 〜 ${messages[messages.length - 1]?.timestamp || "10:15"}`,
      duration: `${Math.max(1, messages.length * 2)}分間`,
      sender,
      recipient,
      summary:
        state.list.length > 0
          ? `${state.list.map((i) => i.term).join("・")} について確認・解消しました`
          : "特に前提の齟齬なく対話が完了しました",
      resolvedMemos: state.list.map((i) => ({
        term: i.term,
        reading: i.reading,
        topic: "について",
        resolution: i.checked ? "質問して解消済み" : "確認項目として記録",
      })),
      transcript: messages,
    };
    onSaveHistory(record);
    onExit();
  }

  // デモ用：例文のクイック送信
  function sendSampleUtterance(text: string, speaker: Role) {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg: ChatMessage = {
      id: `sample-${Date.now()}`,
      senderRole: speaker,
      recipientRole: speaker === sender ? recipient : sender,
      text,
      timestamp: timeStr,
    };
    setMessages((prev) => [...prev, newMsg]);
    const context = linesRef.current.slice(-CONTEXT_LINES).join("\n");
    linesRef.current = [...linesRef.current, text];

    if (speaker === sender) {
      void detect(text.slice(0, MAX_UTTERANCE), context);
    }
  }

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-36">
      {/* 画面上部：質問メモ（聞いておきたいこと）リスト */}
      <section className="flex flex-col bg-surface-container rounded-xl p-space-md shadow-sm mb-space-md border border-outline-variant/30">
        <div className="flex items-center justify-between gap-space-xs mb-space-xs">
          <div className="flex items-center gap-space-xs min-w-0">
            <span
              className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              edit_note
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
              <ruby>
                聞<rt className="font-ruby text-ruby">き</rt>
              </ruby>
              いておきたいこと
              <span className="font-label-sm text-label-sm text-secondary font-bold ml-1.5">
                [{recipient} → {sender}へ]
              </span>
            </h2>
          </div>
          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-space-xs py-0.5 rounded-full flex-shrink-0 font-bold">
            残り {state.list.filter((i) => !i.checked).length}件
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-primary">
            touch_app
          </span>
          チェックをつけると、解決済みとして記録されます
        </p>

        {/* チェックリスト本体 */}
        <div className="flex flex-col gap-space-xs">
          {state.list.length === 0 ? (
            <div className="p-space-sm text-center bg-surface-container-low rounded-lg text-on-surface-variant font-body-sm text-body-sm">
              <Furi text="{分|わ}からなかった{言葉|ことば}が、ここにメモされます。" />
            </div>
          ) : (
            state.list.map((item) => {
              const flash = state.highlight?.key === item.key;
              return (
                <div
                  key={item.key}
                  className={`transition-all duration-300 ease-out rounded-lg p-space-sm shadow-sm flex items-start gap-space-sm border ${
                    item.checked
                      ? "bg-surface-container-high/60 border-outline-variant/30"
                      : "bg-surface-container-lowest border-secondary-fixed"
                  } ${flash ? "ring-2 ring-secondary" : ""}`}
                >
                  <button
                    aria-label="質問メモを完了にする"
                    onClick={() => dispatch({ type: "toggle", key: item.key })}
                    className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      item.checked
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {item.checked ? "check" : "check_box_outline_blank"}
                    </span>
                  </button>

                  <div
                    onClick={() => dispatch({ type: "toggle", key: item.key })}
                    className="flex flex-col min-w-0 flex-1 pt-1 cursor-pointer"
                  >
                    <p
                      className={`font-body-md text-body-md leading-snug font-bold ${
                        item.checked
                          ? "line-through text-on-surface-variant opacity-70"
                          : "text-on-surface"
                      }`}
                    >
                      「
                      <Term term={item.term} reading={item.reading} />
                      」について
                    </p>
                    <span className="font-ruby text-ruby text-on-surface-variant mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">
                        schedule
                      </span>
                      {item.checked ? "確認済み" : "会話中に確認したいこと"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 直前の操作の取り消しトースト */}
        {state.lastAnswer && (
          <div className="mt-space-xs bg-surface-container-high rounded-lg p-space-xs px-space-sm flex items-center justify-between transition-all">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  done
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface truncate">
                「{state.lastAnswer.term.term}」を
                {state.lastAnswer.understood ? "わかる" : "メモ"}
                にしました
              </span>
            </div>
            <button
              onClick={() => dispatch({ type: "undo" })}
              className="min-w-[48px] h-10 px-space-xs font-label-sm text-label-sm text-primary hover:underline flex items-center justify-center flex-shrink-0 cursor-pointer"
            >
              元に戻す
            </button>
          </div>
        )}
      </section>

      {/* 対話の向き・発話者バー */}
      <div className="flex flex-col bg-surface-container-high/40 border border-outline-variant rounded-xl p-space-sm mb-space-sm">
        <div className="flex items-center justify-between gap-space-xs mb-1">
          <span className="font-ruby text-ruby text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">
              sync_alt
            </span>
            いまの会話
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setSimulatedSpeaker(
                  simulatedSpeaker === sender ? recipient : sender,
                )
              }
              className="font-ruby text-ruby bg-primary text-on-primary px-space-xs py-0.5 rounded-full font-bold cursor-pointer hover:bg-primary-container"
            >
              話者を切替: {simulatedSpeaker} が話しています
            </button>
          </div>
        </div>

        <div className="flex items-center justify-around bg-surface-container-lowest rounded-lg p-space-xs shadow-sm">
          <div className="flex items-center gap-1 min-w-0">
            {simulatedSpeaker === sender && (
              <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
            )}
            <span className="font-label-sm text-label-sm text-primary font-bold">
              {sender}
            </span>
            <span className="font-ruby text-ruby text-on-surface-variant">
              (ご案内する方)
            </span>
          </div>
          <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">
            arrow_forward
          </span>
          <div className="flex items-center gap-1 min-w-0">
            {simulatedSpeaker === recipient && (
              <span className="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0 animate-pulse" />
            )}
            <span className="font-label-sm text-label-sm text-on-secondary-fixed font-bold">
              {recipient}
            </span>
            <span className="font-ruby text-ruby text-on-surface-variant">
              (受ける方)
            </span>
          </div>
        </div>
      </div>

      {/* 音声聞き取り状態インジケーター & マイクON/OFF */}
      <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-space-sm mb-space-md border border-outline-variant/30">
        <div className="flex items-center gap-space-xs">
          {speech.listening ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          ) : (
            <span className="w-3 h-3 rounded-full bg-outline-variant" />
          )}
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {speech.listening
              ? `${simulatedSpeaker} のお声をリアルタイム聞き取り中...`
              : "マイクは停止しています"}
          </p>
          {busy > 0 && (
            <span className="material-symbols-outlined text-[16px] text-primary animate-spin">
              progress_activity
            </span>
          )}
        </div>

        <div>
          {speech.listening ? (
            <button
              onClick={speech.stop}
              className="h-10 px-space-sm rounded-lg bg-surface-container-high hover:bg-surface-variant font-label-sm text-label-sm text-on-surface flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">mic_off</span>
              止める
            </button>
          ) : (
            <button
              onClick={speech.start}
              disabled={speech.supported === false}
              className="h-10 px-space-sm rounded-lg bg-primary hover:bg-primary-container font-label-sm text-label-sm text-on-primary flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              聞き取り開始
            </button>
          )}
        </div>
      </div>

      {/* ブラウザ未対応やエラー表示 */}
      {speech.supported === false && (
        <div className="bg-error-container text-on-error-container p-space-sm rounded-lg mb-space-sm font-body-sm text-body-sm">
          このブラウザでは音声認識がサポートされていません。下の「デモ発話を送信」でお試しいただけます。
        </div>
      )}
      {aiError && (
        <div className="bg-error-container text-on-error-container p-space-sm rounded-lg mb-space-sm font-body-sm text-body-sm">
          AI連携エラー: {aiError}
        </div>
      )}

      {/* リアルタイム会話タイムライン (LINE風吹き出し) */}
      <div className="flex flex-col gap-space-md mb-space-md">
        {messages.map((msg) => {
          const isSender = msg.senderRole === sender;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-space-xs max-w-[92%] ${
                isSender ? "self-start" : "self-end flex-row-reverse"
              }`}
            >
              {/* アバター */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    isSender
                      ? "bg-primary-fixed text-primary"
                      : "bg-secondary-fixed text-on-secondary-fixed"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isSender ? "stethoscope" : "person"}
                  </span>
                </div>
                <span className="font-ruby text-ruby text-on-surface-variant mt-0.5">
                  {msg.senderRole}
                </span>
              </div>

              {/* 吹き出し */}
              <div
                className={`flex flex-col min-w-0 ${
                  isSender ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`p-space-sm rounded-2xl shadow-sm leading-relaxed ${
                    isSender
                      ? "bg-surface-container-lowest text-on-surface rounded-tl-sm border border-outline-variant/30"
                      : "bg-primary-container text-on-primary rounded-tr-sm"
                  }`}
                >
                  <p className="font-body-md text-body-md">{msg.text}</p>
                </div>
                <span className="font-ruby text-ruby text-on-surface-variant mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* 音声認識の途中結果 */}
        {speech.interim && (
          <div className="self-start p-space-sm bg-surface-container-low rounded-xl text-on-surface-variant italic font-body-sm text-body-sm animate-pulse border border-dashed border-primary">
            聞き取り中: 「{speech.interim}」
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* デモ用クイック発話ボタン（音声認識なしでも試せる機能） */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-space-sm mb-space-md">
        <span className="font-ruby text-ruby text-on-surface-variant font-bold block mb-1.5">
          デモ用の会話を送信して試す:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() =>
              sendSampleUtterance(
                "痛みを抑えるため、NSAIDsを毎食後に服用してください。",
                sender,
              )
            }
            className="text-left font-label-sm text-label-sm bg-surface-container hover:bg-surface-variant p-2 rounded-lg text-on-surface cursor-pointer"
          >
            医師: 「NSAIDsを毎食後服用してください」
          </button>
          <button
            onClick={() =>
              sendSampleUtterance(
                "来週の交換用に、経鼻チューブを2本持って行ってください。",
                sender,
              )
            }
            className="text-left font-label-sm text-label-sm bg-surface-container hover:bg-surface-variant p-2 rounded-lg text-on-surface cursor-pointer"
          >
            医師: 「経鼻チューブを2本持って行って」
          </button>
          <button
            onClick={() =>
              sendSampleUtterance(
                "わかりました。胃が荒れやすいのですが大丈夫ですか？",
                recipient,
              )
            }
            className="text-left font-label-sm text-label-sm bg-surface-container hover:bg-surface-variant p-2 rounded-lg text-on-surface cursor-pointer"
          >
            患者: 「胃が荒れやすいのですが大丈夫ですか？」
          </button>
        </div>
      </div>

      {/* 画面下部：コンパニオンメモバー（「〇〇」は分かりますか？） */}
      {currentPending && (
        <div className="fixed bottom-20 left-0 right-0 px-margin z-50 flex justify-center">
          <div className="w-full max-w-lg bg-inverse-surface text-inverse-on-surface rounded-2xl p-space-sm shadow-2xl flex flex-col gap-space-xs animate-bounce-short">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="material-symbols-outlined text-secondary-container text-[20px] flex-shrink-0 animate-pulse">
                  help_center
                </span>
                <p className="font-body-md text-body-md font-bold truncate">
                  <span className="font-ruby text-ruby text-secondary-container block">
                    {sender}の言葉 → あなたへ
                  </span>
                  「
                  <Term
                    term={currentPending.term}
                    reading={currentPending.reading}
                  />
                  」は分かりますか？
                </p>
              </div>
              <span className="font-ruby text-ruby bg-surface-variant/30 text-inverse-on-surface px-space-xs py-0.5 rounded-full flex-shrink-0">
                あと {state.pending.length}件
              </span>
            </div>

            <div className="flex items-center gap-space-xs mt-1">
              <button
                onClick={() =>
                  dispatch({
                    type: "answer",
                    key: currentPending.key,
                    understood: true,
                  })
                }
                className="flex-1 h-12 rounded-lg bg-surface-container-high/20 hover:bg-surface-container-high/40 text-inverse-on-surface font-label-md text-label-md flex items-center justify-center transition-colors cursor-pointer"
              >
                はい
              </button>
              <button
                onClick={() =>
                  dispatch({
                    type: "answer",
                    key: currentPending.key,
                    understood: false,
                  })
                }
                className="flex-[1.4] h-12 rounded-full bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-1 shadow-md hover:bg-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                いいえ（メモに追加）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 対話終了確認モーダル */}
      {confirmExit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-space-md"
        >
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl p-space-md shadow-2xl flex flex-col gap-space-md border border-outline-variant/30">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">
                    save
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  対話の保存・終了確認
                </h2>
              </div>
              <button
                onClick={() => setConfirmExit(false)}
                aria-label="閉じる"
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <p className="font-body-md text-body-md text-on-surface leading-relaxed">
              この対話を終了しますか？
              <br />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                「保存して終了」を選ぶと、これまでの記録（履歴）に保存されます。
              </span>
            </p>

            <div className="flex flex-col gap-space-sm">
              <button
                onClick={handleSaveAndExit}
                className="w-full min-h-[52px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">
                  bookmark_added
                </span>
                保存して終了
              </button>
              <button
                onClick={onExit}
                className="w-full min-h-[52px] rounded-xl border border-outline hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  delete_outline
                </span>
                保存せずに終了
              </button>
              <button
                onClick={() => setConfirmExit(false)}
                className="w-full min-h-[48px] rounded-xl text-primary font-label-sm text-label-sm flex items-center justify-center hover:underline cursor-pointer"
              >
                戻って対話を続ける
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
