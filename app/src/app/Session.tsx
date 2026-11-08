"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { DetectedTerm, Speaker } from "@/lib/detection";
import { MAX_CONTEXT, MAX_UTTERANCE } from "@/lib/limits";
import { saveRecord } from "@/lib/history";
import { ROLE_READING, type Role } from "@/lib/roles";
import { initialSession, sessionReducer, UNDO_MS } from "@/lib/session";
import { Furi, Term, Word } from "./Furi";
import { Icon, ROLE_ICON } from "./Icon";
import { Thinking } from "./Thinking";
import { TestInput } from "./TestInput";
import { TALK_SCRIPTS } from "@/lib/testInput";
import { useTestInput } from "./TestFlag";
import { useSpeechRecognition } from "./useSpeechRecognition";
import styles from "./app.module.css";

/** AIに参考として渡す、直前の発言の数 */
const CONTEXT_LINES = 3;
/** 帯の点で見せる最大数（これより多いと「＋N」） */
const MAX_DOTS = 5;

/** 会話：話を聞きながら、分からない言葉に印をつける */
export function Session({
  id,
  sender,
  recipient,
  onExit,
}: {
  id: string;
  sender: Role;
  recipient: Role;
  onExit: () => void;
}) {
  const testInput = useTestInput();
  const [startedAt] = useState(() => Date.now());
  /** AIが見つけた言葉（会話の文字の中で印をつける） */
  const [found, setFound] = useState<string[]>([]);
  const [state, dispatch] = useReducer(sessionReducer, initialSession);
  const [lines, setLines] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const linesRef = useRef<string[]>([]);
  /** 行ごとの話した人。AIの答えが来るまでは話し手（左）に置く */
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const speakersRef = useRef<Speaker[]>([]);
  const setSpeakerAt = (i: number, s: Speaker) => {
    const next = [...speakersRef.current];
    next[i] = s;
    speakersRef.current = next;
    setSpeakers(next);
  };
  const listRef = useRef<HTMLOListElement>(null);

  async function detect(utterance: string, context: string, index: number) {
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
      setSpeakerAt(
        index,
        data.speaker === "recipient" ? "recipient" : "sender",
      );
      const terms = data.terms as DetectedTerm[];
      setFound((prev) => [
        ...prev,
        ...terms.map((t) => t.term).filter((t) => t && !prev.includes(t)),
      ]);
      dispatch({ type: "detected", terms, quote: utterance });
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setBusy((n) => n - 1);
    }
  }

  /** 聞き取った発言（声でも、テスト用の用意した発言でも同じ道を通る） */
  function onUtterance(text: string) {
    // API の上限に収める（直前の会話は、新しい側を残す）
    // 誰が話したかを添えて渡す（AIが流れから話した人を決めるため）
    const start = Math.max(0, linesRef.current.length - CONTEXT_LINES);
    const context = linesRef.current
      .slice(start)
      .map((l, i) => {
        const s = speakersRef.current[start + i] ?? "sender";
        return `${s === "recipient" ? recipient : sender}：${l}`;
      })
      .join("\n")
      .slice(-MAX_CONTEXT);
    const index = linesRef.current.length;
    linesRef.current = [...linesRef.current, text];
    setLines(linesRef.current);
    setSpeakerAt(index, "sender");
    void detect(text.slice(0, MAX_UTTERANCE), context, index);
  }

  const speech = useSpeechRecognition(onUtterance);

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

  // 履歴：その端末の中だけに、会話の途中から残しておく（例/Docs/1_方向.md）
  useEffect(() => {
    saveRecord({
      id,
      startedAt,
      endedAt: Date.now(),
      sender,
      recipient,
      items: state.list.map(({ term, reading, checked, quote }) => ({
        term,
        reading,
        checked,
        quote,
      })),
      lines,
      speakers,
    });
  }, [id, startedAt, sender, recipient, state.list, lines, speakers]);

  // 「取り消す」は5秒だけ出す
  useEffect(() => {
    if (!state.lastAnswer) return;
    const id = setTimeout(() => dispatch({ type: "undoExpired" }), UNDO_MS);
    return () => clearTimeout(id);
  }, [state.lastAnswer]);

  const roleLabel = (r: Role) => <Word word={r} reading={ROLE_READING[r]} />;
  const shownLines = showAll ? lines : lines.slice(-2);

  return (
    <div className={styles.screen}>
      <div className={styles.paper}>
        <div className={styles.sessionHead}>
          {/* 誰から誰への会話かは、ここ1か所で示す */}
          <h1 className={styles.topTitle}>
            <Icon name={ROLE_ICON[sender]} className={styles.roleIcon} />
            {roleLabel(sender)}
            <Icon name="arrow_forward" className={styles.roleArrow} />
            <Icon name={ROLE_ICON[recipient]} className={styles.roleIcon} />
            {roleLabel(recipient)}
          </h1>
          <button
            className={styles.endButton}
            onClick={() => {
              // 押し間違えても大丈夫（ユニバーサルデザイン 原則5）：消えるものがあれば確かめる
              if (state.list.length > 0 || state.pending.length > 0) {
                setConfirmExit(true);
              } else {
                onExit();
              }
            }}
          >
            <Furi text="{終|お}える" />
          </button>
        </div>
        {/* 質問リスト：画面上部。上ほど見えにくいので、まだ聞いていない言葉を下に置く */}
        {/* 言葉が入るまでは出さない（段階的に見せる。原則3） */}
        {state.list.length > 0 && (
          <section className={styles.listArea} aria-label="分からなかった言葉">
            <h2 className={styles.listTitle}>
              <Furi text="{聞|き}いておきたいこと" />
              {state.list.some((x) => !x.checked) && (
                <span className={styles.countBadge}>
                  <Furi
                    text={`{残|のこ}り ${state.list.filter((x) => !x.checked).length}`}
                  />
                </span>
              )}
            </h2>
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
                      <span
                        className={item.checked ? styles.boxDone : styles.box}
                      >
                        <Icon
                          name={
                            item.checked
                              ? "check_box"
                              : "check_box_outline_blank"
                          }
                          fill={item.checked}
                        />
                      </span>
                      <span className={styles.rowBody}>
                        <span className={styles.rowTerm}>
                          <Term term={item.term} reading={item.reading} />
                        </span>
                        {item.quote && (
                          <span className={styles.quote}>「{item.quote}」</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* 会話の文字：最初は直近の2行だけ（原則3） */}
        <section className={styles.talk}>
          {shownLines.map((t, i) => {
            const at = lines.length - shownLines.length + i;
            const who = speakers[at] ?? "sender";
            const role = who === "recipient" ? recipient : sender;
            return (
              <div
                key={at}
                className={
                  who === "recipient" ? styles.sayRight : styles.sayLeft
                }
              >
                <span className={styles.sayName}>{roleLabel(role)}</span>
                {/* 押すと左右を入れ替える（AIが話した人を取り違えたとき） */}
                <button
                  className={styles.bubble}
                  aria-label={`${role}の発言。押すと話した人を入れ替える`}
                  onClick={() =>
                    setSpeakerAt(
                      at,
                      who === "recipient" ? "sender" : "recipient",
                    )
                  }
                >
                  <Marked text={t} terms={found} />
                </button>
              </div>
            );
          })}
          {speech.interim && (
            <div className={styles.sayLeft}>
              <p className={`${styles.bubble} ${styles.interim}`}>
                {speech.interim}
              </p>
            </div>
          )}
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

        {testInput && (
          <TestInput
            scripts={TALK_SCRIPTS}
            sender={sender}
            recipient={recipient}
            label="発言を入れる"
            freeText
            onPick={onUtterance}
          />
        )}
        {busy > 0 && (
          <div className={styles.thinkWrap}>
            <Thinking text="{分|わ}かりにくそうな{言葉|ことば}を{探|さが}しています" />
          </div>
        )}
        <div className={styles.controls}>
          {speech.listening ? (
            <>
              <span className={styles.live}>
                <span aria-hidden className={styles.liveDot} />
                <Furi text="{聞|き}き{取|と}り{中|ちゅう}" />
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
              <Icon name="mic" fill />
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

        {confirmExit && (
          <div className={styles.undo} role="alertdialog">
            <span>
              <Furi text="{会話|かいわ}を{終|お}えますか？リストは{履歴|りれき}に{残|のこ}ります。" />
            </span>
            <span className={styles.confirmButtons}>
              <button
                className={styles.undoButton}
                onClick={() => setConfirmExit(false)}
              >
                <Furi text="{会話|かいわ}を{続|つづ}ける" />
              </button>
              <button className={styles.undoButton} onClick={onExit}>
                <Furi text="{終|お}える" />
              </button>
            </span>
          </div>
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
                    <Icon name="help" className={styles.questionIcon} />「
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

/** 会話の文字の中で、AIが見つけた言葉に印をつける（色と下線の両方で示す） */
function Marked({ text, terms }: { text: string; terms: string[] }) {
  const hits = terms.filter((t) => text.includes(t));
  if (hits.length === 0) return <>{text}</>;
  const esc = hits
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${esc.join("|")})`));
  return (
    <>
      {parts.map((p, i) =>
        hits.includes(p) ? (
          <mark key={i} className={styles.mark}>
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}
