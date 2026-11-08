"use client";
// 履歴（例/Docs/1_方向.md「会話履歴の保存」）。その端末の中だけにある記録を見返す・消す。
// AIによる要約は作らない（2026-11-08 決定）。出すのは、質問リストと会話の文字だけ。
import { useState } from "react";
import {
  deleteAllHistory,
  deleteRecord,
  loadHistory,
  type HistoryRecord,
} from "@/lib/history";
import { ROLE_READING } from "@/lib/roles";
import { TopBar } from "./TopBar";
import { Furi, Term, Word } from "./Furi";
import { Icon } from "./Icon";
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
        {open.lines.map((t, i) => (
          <p key={i} className={styles.bubble}>
            {t}
          </p>
        ))}
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
