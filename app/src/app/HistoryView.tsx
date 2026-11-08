"use client";
// 履歴（例/Docs/1_方向.md「会話履歴の保存」）。その端末の中だけにある記録を見返す・消す。
// AIによる要約は作らない（2026-11-08 決定）。出すのは、質問リストと会話の文字だけ。
import { useState } from "react";
import {
  deleteAllHistory,
  deleteRecord,
  saveRecord,
  loadHistory,
  type HistoryRecord,
} from "@/lib/history";
import { ROLE_READING } from "@/lib/roles";
import { TopBar } from "./TopBar";
import { Furi, Term, Word } from "./Furi";
import { Icon } from "./Icon";
import { useTestInput } from "./TestFlag";
import { Thinking } from "./Thinking";
import { ASK, kindOf } from "@/lib/termKind";
import { sampleHistory } from "@/lib/testInput";
import styles from "./app.module.css";

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function HistoryView() {
  // 履歴の画面は、メニューを押してから（ブラウザの中で）出るので、最初から読める
  const [list, setList] = useState<HistoryRecord[]>(loadHistory);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const testInput = useTestInput();
  const refresh = () => setList(loadHistory());
  const open = list.find((r) => r.id === openId);

  if (open) {
    return (
      <main className={styles.page}>
        <TopBar
          title="{記録|きろく}"
          onBack={() => setOpenId(null)}
          backLabel="一覧にもどる"
        />
        <RecordHead r={open} />
        <RecordSummary
          r={open}
          onSaved={(rec) => {
            saveRecord(rec);
            refresh();
          }}
        />
        <h2 className={styles.subTitle}>
          <Furi text="{分|わ}からなかった{言葉|ことば}" />
        </h2>
        {open.items.length === 0 ? (
          <p className={styles.empty}>
            <Furi text="ありません" />
          </p>
        ) : (
          <ul className={styles.memoList}>
            {open.items.map((it) => (
              <li key={it.term} className={styles.memo}>
                <span className={it.checked ? styles.boxDone : styles.box}>
                  <Icon
                    name={it.checked ? "check_box" : "check_box_outline_blank"}
                    fill={it.checked}
                  />
                </span>
                <span>
                  <span
                    className={
                      it.checked ? styles.memoTermDone : styles.memoTerm
                    }
                  >
                    <Term term={it.term} reading={it.reading} />
                  </span>
                  {ASK[kindOf(it)].list && (
                    <span className={styles.amountAsk}>
                      <Furi text={ASK[kindOf(it)].list ?? ""} />
                    </span>
                  )}
                  <span className={styles.srOnly}>
                    {it.checked ? "（聞けた）" : "（まだ聞いていない）"}
                  </span>
                  {it.quote && (
                    <span className={styles.quote}>「{it.quote}」</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <h2 className={styles.subTitle}>
          <Furi text="{会話|かいわ}の{文字|もじ}" />
        </h2>
        <div className={styles.talk}>
          {open.lines.map((t, i) => {
            const right = open.speakers?.[i] === "recipient";
            return (
              <div key={i} className={right ? styles.sayRight : styles.sayLeft}>
                <span className={styles.sayName}>{speakerRole(open, i)}</span>
                <p className={styles.bubble}>{t}</p>
                {open.originals?.[i] && (
                  <span className={styles.fixNoteText}>
                    AIが直しました（元：{open.originals[i]}）
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <ConfirmDelete
          label="この{記録|きろく}を{消|け}す"
          asking={confirm === open.id}
          onAsk={() => setConfirm(open.id)}
          onCancel={() => setConfirm(null)}
          onDelete={() => {
            deleteRecord(open.id);
            setConfirm(null);
            setOpenId(null);
            refresh();
          }}
        />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <TopBar title="これまでの{記録|きろく}" />
      {testInput && (
        <section className={styles.testBox} aria-label="テスト用の履歴">
          <button
            className={styles.testToggle}
            onClick={() => {
              sampleHistory().forEach(saveRecord);
              refresh();
            }}
          >
            <Icon name="science" />
            <span>テスト用：見本の記録を入れる</span>
          </button>
        </section>
      )}
      <p className={styles.note}>
        <Furi text="{記録|きろく}は、この{端末|たんまつ}の{中|なか}だけにあります。{外|そと}には{送|おく}りません。" />
      </p>
      {list.length === 0 ? (
        <p className={styles.empty}>
          <Furi text="まだ{記録|きろく}がありません。{会話|かいわ}を{聞|き}くと、ここに{残|のこ}ります。" />
        </p>
      ) : (
        <ul className={styles.records}>
          {list.map((r) => {
            const left = r.items.filter((x) => !x.checked).length;
            return (
              <li key={r.id}>
                <button
                  className={styles.recordCard}
                  onClick={() => setOpenId(r.id)}
                >
                  <RecordHead r={r} />
                  <span className={left ? styles.badgeWarn : styles.badge}>
                    {left ? (
                      <Furi
                        text={`まだ{聞|き}いていない{言葉|ことば} ${left}`}
                      />
                    ) : r.items.length === 0 ? (
                      <Furi text="{分|わ}からなかった{言葉|ことば}なし" />
                    ) : (
                      <Furi
                        text={`{分|わ}からなかった{言葉|ことば} ${r.items.length}・すべて{聞|き}けた`}
                      />
                    )}
                  </span>
                  {r.items.length > 0 && (
                    <span className={styles.recordTerms}>
                      {r.items.map((x) => x.term).join("、")}
                    </span>
                  )}
                  {/* カード全体が押せる。目印は右の矢印だけ（原則1：主ボタンを並べない） */}
                  <Icon name="chevron_right" className={styles.cardChevron} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > 0 && (
        <ConfirmDelete
          label="すべての{記録|きろく}を{消|け}す"
          asking={confirm === "*"}
          onAsk={() => setConfirm("*")}
          onCancel={() => setConfirm(null)}
          onDelete={() => {
            deleteAllHistory();
            setConfirm(null);
            refresh();
          }}
        />
      )}
    </main>
  );
}

function RecordHead({ r }: { r: HistoryRecord }) {
  return (
    <span className={styles.recordHead}>
      <span className={styles.pairBox}>
        <Word word={r.sender} reading={ROLE_READING[r.sender]} />
        {" → "}
        <Word word={r.recipient} reading={ROLE_READING[r.recipient]} />
      </span>
      <span className={styles.recordDate}>{fmtDate(r.startedAt)}</span>
    </span>
  );
}

function ConfirmDelete(p: {
  label: string;
  asking: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  if (!p.asking) {
    return (
      <button className={styles.textButton} onClick={p.onAsk}>
        <Furi text={p.label} />
      </button>
    );
  }
  return (
    <div className={styles.confirmBox} role="alertdialog">
      <Furi text="{消|け}すと{元|もと}に{戻|もど}せません。" />
      <span className={styles.confirmButtons}>
        <button className={styles.outline} onClick={p.onCancel}>
          <Furi text="やめる" />
        </button>
        <button className={styles.outline} onClick={p.onDelete}>
          <Furi text="{消|け}す" />
        </button>
      </span>
    </div>
  );
}

/** AIによる要約。押したときだけ会話の文字を送り、結果はこの端末の記録に足す */
function RecordSummary({
  r,
  onSaved,
}: {
  r: HistoryRecord;
  onSaved: (rec: HistoryRecord) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (r.lines.length === 0) return null;
  // 前の形（要点だけの配列）で残っている要約は、作り直してもらう
  const summary =
    r.summary && !Array.isArray(r.summary) && "overview" in r.summary
      ? r.summary
      : undefined;

  async function make() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: r.sender,
          recipient: r.recipient,
          // 会話全体を、誰が話したかを添えて送る
          lines: r.lines.map((l, i) => `${speakerRole(r, i)}：${l}`),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `エラー ${res.status}`);
      onSaved({ ...r, summary: data });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.summary} aria-live="polite">
      <h2 className={styles.subTitle}>
        <Furi text="{要約|ようやく}" />
      </h2>
      {summary ? (
        <div className={styles.summaryBox}>
          {summary.overview && (
            <p className={styles.summaryOverview}>{summary.overview}</p>
          )}
          {summary.points.length > 0 && (
            <ul className={styles.summaryList}>
              {summary.points.map((p) => (
                <li key={p.text}>{p.text}</li>
              ))}
            </ul>
          )}
        </div>
      ) : busy ? (
        <Thinking text="{会話|かいわ}{全体|ぜんたい}をまとめています" />
      ) : (
        <button className={styles.outline} onClick={make}>
          <Icon name="summarize" />
          <Furi text="{要約|ようやく}を{作|つく}る" />
        </button>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {summary && (
        <p className={styles.note}>
          <Furi text="AIが{会話|かいわ}{全体|ぜんたい}をまとめたものです。{元|もと}の{会話|かいわ}は{下|した}にあります。" />
        </p>
      )}
    </section>
  );
}

/** その行を話した職種（古い記録は話し手とみなす） */
function speakerRole(r: HistoryRecord, i: number) {
  return r.speakers?.[i] === "recipient" ? r.recipient : r.sender;
}
