"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { Role } from "@/lib/roles";
import { initialSession, sessionReducer } from "@/lib/session";
import { useSpeechRecognition } from "./useSpeechRecognition";
import styles from "./app.module.css";

/** AIに参考として渡す、直前の発言の数 */
const CONTEXT_LINES = 3;

export function Session({
  sender,
  recipient,
  onExit,
}: {
  sender: Role;
  recipient: Role;
  onExit: () => void;
}) {
  const [state, dispatch] = useReducer(sessionReducer, initialSession);
  const [lines, setLines] = useState<string[]>([]);
  const [busy, setBusy] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const linesRef = useRef<string[]>([]);
  const listRef = useRef<HTMLOListElement>(null);

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
      dispatch({ type: "detected", terms: data.terms });
    } catch (e) {
      setAiError(`言葉を見つけられませんでした：${(e as Error).message}`);
    } finally {
      setBusy((n) => n - 1);
    }
  }

  const speech = useSpeechRecognition((text) => {
    const context = linesRef.current.slice(-CONTEXT_LINES).join("\n");
    linesRef.current = [...linesRef.current, text];
    setLines(linesRef.current);
    void detect(text, context);
  });

  // 新しい項目が増えたら、いちばん見えやすい下までスクロールする
  const listLength = state.list.length;
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [listLength]);

  // 質問リストにある語がまた出たら、その項目を見せる
  useEffect(() => {
    if (!state.highlight) return;
    listRef.current
      ?.querySelector(`[data-key="${CSS.escape(state.highlight.key)}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [state.highlight]);

  const current = state.pending[0];

  return (
    <div className={styles.screen}>
      <div className={styles.main}>
        <section className={styles.listArea}>
          {state.list.length === 0 ? (
            <p className={styles.empty}>
              「いいえ」と答えた言葉がここに並びます。話す人に直接聞いて、聞けたらチェックをつけてください。
            </p>
          ) : (
            <ol ref={listRef} className={styles.list}>
              {state.list.map((item) => {
                const flash =
                  state.highlight?.key === item.key ? state.highlight.n : 0;
                return (
                  <li
                    key={`${item.key}-${flash}`}
                    data-key={item.key}
                    className={[
                      item.checked ? styles.checked : "",
                      flash ? styles.flash : "",
                    ].join(" ")}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() =>
                          dispatch({ type: "toggle", key: item.key })
                        }
                      />
                      <span>{item.term}</span>
                    </label>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className={styles.transcript}>
          <div className={styles.rolesBar}>
            {sender} → {recipient}
            <button className={styles.link} onClick={onExit}>
              ホームへ
            </button>
          </div>
          {lines.slice(-6).map((t, i) => (
            <p key={lines.length - 6 + i}>{t}</p>
          ))}
          {speech.interim && <p className={styles.interim}>{speech.interim}</p>}
          {speech.supported === false && (
            <p className={styles.error}>
              このブラウザは音声認識に対応していません。iPhone の
              Safari、パソコンや Android の Chrome などで開いてください。
            </p>
          )}
          {speech.error && <p className={styles.error}>{speech.error}</p>}
          {aiError && <p className={styles.error}>{aiError}</p>}
        </section>

        <div className={styles.controls}>
          {speech.listening ? (
            <button className={styles.stop} onClick={speech.stop}>
              ■ 止める
            </button>
          ) : (
            <button
              className={styles.primary}
              onClick={speech.start}
              disabled={speech.supported !== true}
            >
              ● 聞き取りを始める
            </button>
          )}
          <span className={styles.muted}>
            {speech.listening ? "聞き取り中" : "停止中"}
            {busy > 0 && "・言葉を探しています…"}
          </span>
        </div>
      </div>

      <section className={styles.dock} aria-live="polite">
        {current ? (
          <>
            <div className={styles.dockCount}>
              答えていない言葉：あと {state.pending.length} 件
            </div>
            <div className={styles.cards}>
              {state.pending.map((p) => (
                <div key={p.key} className={styles.card}>
                  <div className={styles.cardQ}>
                    「{p.term}」は分かりますか？
                  </div>
                  <div className={styles.cardA}>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "answer",
                          key: p.key,
                          understood: true,
                        })
                      }
                    >
                      はい
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "answer",
                          key: p.key,
                          understood: false,
                        })
                      }
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.dockIdle}>
            分からなそうな言葉が出たら、ここに出ます
          </div>
        )}
      </section>
    </div>
  );
}
