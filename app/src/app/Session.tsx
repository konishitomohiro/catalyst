"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { DetectedTerm } from "@/lib/detection";
import { ROLE_READING, type Role } from "@/lib/roles";
import { initialSession, sessionReducer, UNDO_MS } from "@/lib/session";
import { Furi, Term } from "./Furi";
import { useSpeechRecognition } from "./useSpeechRecognition";
import styles from "./app.module.css";

/** AIに参考として渡す、直前の発言の数 */
const CONTEXT_LINES = 3;
/** 帯の点で見せる最大数（これより多いと「＋N」） */
const MAX_DOTS = 5;

/** 会話：話を聞きながら、分からない言葉に印をつける */
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
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
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
      dispatch({ type: "detected", terms: data.terms as DetectedTerm[] });
    } catch (e) {
      setAiError((e as Error).message);
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

  // 「取り消す」は5秒だけ出す
  useEffect(() => {
    if (!state.lastAnswer) return;
    const id = setTimeout(() => dispatch({ type: "undoExpired" }), UNDO_MS);
    return () => clearTimeout(id);
  }, [state.lastAnswer]);

  const roleLabel = (r: Role) => (
    <ruby>
      {r}
      <rt>{ROLE_READING[r]}</rt>
    </ruby>
  );
  const shownLines = showAll ? lines : lines.slice(-2);

  return (
    <div className={styles.screen}>
      <div className={styles.paper}>
        {/* 質問リスト：画面上部。上ほど見えにくいので、まだ聞いていない言葉を下に置く */}
        <section className={styles.listArea} aria-label="分からなかった言葉">
          {state.list.length === 0 ? (
            <p className={styles.empty}>
              <Furi text="{分|わ}からなかった{言葉|ことば}が、ここに{並|なら}びます。{聞|き}けたら{印|しるし}をつけられます。" />
            </p>
          ) : (
            <ol ref={listRef} className={styles.list}>
              {state.list.map((item) => {
                const flash =
                  state.highlight?.key === item.key ? state.highlight.n : 0;
                return (
                  <li key={`${item.key}-${flash}`} data-key={item.key}>
                    <button
                      role="checkbox"
                      aria-checked={item.checked}
                      className={[
                        styles.row,
                        item.checked ? styles.rowDone : "",
                        flash ? styles.flash : "",
                      ].join(" ")}
                      onClick={() =>
                        dispatch({ type: "toggle", key: item.key })
                      }
                    >
                      <span aria-hidden className={styles.ring}>
                        {item.checked ? "✓" : ""}
                      </span>
                      <span className={styles.rowTerm}>
                        <Term term={item.term} reading={item.reading} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* 会話の文字：最初は直近の2行だけ（原則3） */}
        <section className={styles.talk}>
          <div className={styles.talkHead}>
            <span>
              {roleLabel(sender)} → {roleLabel(recipient)}
            </span>
            <button className={styles.textButton} onClick={onExit}>
              <Furi text="ホームに{戻|もど}る" />
            </button>
          </div>
          {shownLines.map((t, i) => (
            <p key={lines.length - shownLines.length + i}>{t}</p>
          ))}
          {speech.interim && <p className={styles.interim}>{speech.interim}</p>}
          {lines.length > 2 && (
            <button
              className={styles.textButton}
              onClick={() => setShowAll((v) => !v)}
            >
              <Furi
                text={
                  showAll
                    ? "{直近|ちょっきん}だけ{見|み}る"
                    : `{会話|かいわ}の{文字|もじ}をすべて{見|み}る（${lines.length}{行|ぎょう}）`
                }
              />
            </button>
          )}
        </section>

        <div className={styles.controls}>
          {speech.listening ? (
            <>
              <span className={styles.live}>
                <span aria-hidden className={styles.liveDot} />
                <Furi text="{聞|き}き{取|と}り{中|ちゅう}" />
                {busy > 0 && <span aria-hidden className={styles.spinner} />}
              </span>
              <button className={styles.textButton} onClick={speech.stop}>
                <Furi text="{止|と}める" />
              </button>
            </>
          ) : (
            <button
              className={styles.primary}
              onClick={speech.start}
              disabled={speech.supported !== true}
            >
              <Furi text="{聞|き}き{取|と}りを{始|はじ}める" />
            </button>
          )}
        </div>
      </div>

      {/* 帯：アプリからの呼びかけはここだけ（原則2） */}
      <section className={styles.dock} aria-live="polite">
        {speech.supported === false && (
          <p className={styles.dockNote}>
            <Furi text="このブラウザでは{聞|き}き{取|と}りが{使|つか}えません。iPhone の Safari か、Chrome で{開|ひら}けます。" />
          </p>
        )}
        {speech.error && <p className={styles.dockNote}>{speech.error}</p>}
        {aiError && (
          <p className={styles.dockNote}>
            <Furi text="{言葉|ことば}を{見|み}つけられませんでした：" />
            {aiError}
          </p>
        )}

        {state.lastAnswer && (
          <div className={styles.undo}>
            <span>
              「
              <Term
                term={state.lastAnswer.term.term}
                reading={state.lastAnswer.term.reading}
              />
              」
              <Furi
                text={
                  state.lastAnswer.understood
                    ? "は{分|わ}かる、にしました"
                    : "を{上|うえ}のリストに{入|い}れました"
                }
              />
            </span>
            <button
              className={styles.undoButton}
              onClick={() => dispatch({ type: "undo" })}
            >
              <Furi text="{取|と}り{消|け}す" />
            </button>
          </div>
        )}

        {state.pending.length > 0 ? (
          <>
            <div
              className={styles.cards}
              onScroll={(e) => {
                const el = e.currentTarget;
                setCardIndex(Math.round(el.scrollLeft / el.clientWidth));
              }}
            >
              {state.pending.map((p) => (
                <div key={p.key} className={styles.card}>
                  <p className={styles.question}>
                    「
                    <span className={styles.questionTerm}>
                      <Term term={p.term} reading={p.reading} />
                    </span>
                    」<Furi text="は{分|わ}かりますか？" />
                  </p>
                  <div className={styles.answers}>
                    <button
                      className={styles.yes}
                      onClick={() =>
                        dispatch({
                          type: "answer",
                          key: p.key,
                          understood: true,
                          at: Date.now(),
                        })
                      }
                    >
                      <Furi text="はい" />
                    </button>
                    <button
                      className={styles.no}
                      onClick={() =>
                        dispatch({
                          type: "answer",
                          key: p.key,
                          understood: false,
                          at: Date.now(),
                        })
                      }
                    >
                      <Furi text="いいえ" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {state.pending.length > 1 && (
              <div
                className={styles.dots}
                role="img"
                aria-label={`あと${state.pending.length}件`}
              >
                {state.pending.slice(0, MAX_DOTS).map((p, i) => (
                  <span
                    key={p.key}
                    className={
                      i === Math.min(cardIndex, MAX_DOTS - 1)
                        ? styles.dotOn
                        : styles.dot
                    }
                  />
                ))}
                {state.pending.length > MAX_DOTS && (
                  <span className={styles.more}>
                    ＋{state.pending.length - MAX_DOTS}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          !state.lastAnswer && (
            <p className={styles.dockIdle}>
              <Furi text="{前提|ぜんてい}が{要|い}りそうな{言葉|ことば}が{出|で}ると、ここに{出|で}ます" />
            </p>
          )
        )}
      </section>
    </div>
  );
}
