"use client";

import { useState } from "react";
import { MAX_MESSAGE } from "@/lib/limits";
import { splitByQuotes, type PremisePoint } from "@/lib/premise";
import { ROLE_READING, type Role } from "@/lib/roles";
import { Furi, Word } from "./Furi";
import { Icon, ROLE_ICON } from "./Icon";
import { TopBar } from "./TopBar";
import { TestInput } from "./TestInput";
import { COMPOSE_SCRIPTS } from "@/lib/testInput";
import { useTestInput } from "./TestFlag";
import styles from "./app.module.css";

/** 送り手の確認（伝える前）：書いた文章に、受け手が分からなそうな点がないかを確かめる */
export function Compose({
  sender,
  recipient,
  onExit,
}: {
  sender: Role;
  recipient: Role;
  onExit: () => void;
}) {
  const testInput = useTestInput();
  const [message, setMessage] = useState("");
  /** 最後に確かめた文章と、そのときの結果 */
  const [checked, setChecked] = useState<{
    message: string;
    points: PremisePoint[];
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  const stale = checked !== null && checked.message !== message;

  async function check() {
    const text = message.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/premises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, recipient, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `エラー ${res.status}`);
      setChecked({ message, points: data.points as PremisePoint[] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setError("コピーできませんでした。文章を選んでコピーできます");
    }
  }

  const role = (r: Role) => <Word word={r} reading={ROLE_READING[r]} />;

  return (
    <main className={styles.page}>
      <TopBar
        title="{伝|つた}える{前|まえ}に{確|たし}かめる"
        onBack={() => (message.trim() ? setConfirmExit(true) : onExit())}
        backLabel="ホームにもどる"
      />
      <p className={styles.pairChip}>
        <Icon name={ROLE_ICON[sender]} className={styles.inlineIcon} />
        {role(sender)}
        <Icon name="arrow_forward" className={styles.inlineIcon} />
        <Icon name={ROLE_ICON[recipient]} className={styles.inlineIcon} />
        {role(recipient)}
      </p>
      {confirmExit && (
        <div className={styles.confirmBox} role="alertdialog">
          <Furi text="ホームに{戻|もど}ると、{書|か}いた{文章|ぶんしょう}が{消|き}えます。" />
          <span className={styles.confirmButtons}>
            <button
              className={styles.outline}
              onClick={() => setConfirmExit(false)}
            >
              <Furi text="{続|つづ}ける" />
            </button>
            <button className={styles.outline} onClick={onExit}>
              <Furi text="{消|け}して{戻|もど}る" />
            </button>
          </span>
        </div>
      )}

      {testInput && (
        <TestInput
          scripts={COMPOSE_SCRIPTS}
          sender={sender}
          recipient={recipient}
          label="文章を入れる"
          onPick={(t) => setMessage(t.slice(0, MAX_MESSAGE))}
        />
      )}
      <label className={styles.fieldLabel} htmlFor="message">
        {role(recipient)}
        <Furi text="に{伝|つた}えたいこと" />
      </label>
      <textarea
        id="message"
        className={styles.textarea}
        value={message}
        maxLength={MAX_MESSAGE}
        rows={5}
        placeholder="例：来週の訪問のとき、胃ろうのチューブを2本持ってきてください"
        onChange={(e) => {
          setMessage(e.target.value);
          setCopied(false);
        }}
      />

      <button
        className={styles.primary}
        onClick={check}
        disabled={busy || !message.trim()}
      >
        {busy ? (
          <Furi text="{確|たし}かめています…" />
        ) : checked ? (
          <Furi text="もう{一度|いちど}{確|たし}かめる" />
        ) : (
          <>
            <Icon name="fact_check" />
            <Furi text="{確|たし}かめる" />
          </>
        )}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {checked && (
        <section className={styles.result} aria-live="polite">
          {stale && (
            <p className={styles.note}>
              <Furi text="{文章|ぶんしょう}が{変|か}わりました。もう{一度|いちど}{確|たし}かめられます。" />
            </p>
          )}

          {checked.points.length > 0 ? (
            <>
              <p className={styles.resultLead}>
                {role(recipient)}
                <Furi text="が、{次|つぎ}のように{受|う}け{取|と}るかもしれません。{必要|ひつよう}なら{書|か}き{足|た}せます。" />
              </p>
              <p className={styles.preview}>
                {splitByQuotes(
                  checked.message,
                  checked.points.map((p) => p.quote),
                ).map((part, i) =>
                  part.mark ? (
                    <mark key={i} className={styles.mark}>
                      {part.text}
                    </mark>
                  ) : (
                    <span key={i}>{part.text}</span>
                  ),
                )}
              </p>
              <ol className={styles.points}>
                {checked.points.map((p) => (
                  <li key={p.quote}>
                    <mark className={styles.mark}>{p.quote}</mark>
                    <span className={styles.question}>{p.risk}</span>
                    <span className={styles.note}>
                      <Furi text="{聞|き}かれそうなこと：" />
                      {p.question}
                    </span>
                  </li>
                ))}
              </ol>
              <p className={styles.note}>
                <Furi text="{根拠|こんきょ}を{知|し}っているのは、{書|か}いた{人|ひと}だけです。AIは{根拠|こんきょ}を{書|か}きません。" />
              </p>
            </>
          ) : (
            <p className={styles.resultLead}>
              <Furi text="このまま{伝|つた}わりそうです。" />
            </p>
          )}

          <button className={styles.textButton} onClick={copy}>
            {copied ? (
              <Furi text="コピーしました" />
            ) : (
              <Furi text="{文章|ぶんしょう}をコピーする" />
            )}
          </button>
        </section>
      )}

      <p className={styles.note}>
        <Furi text="{書|か}いた{文章|ぶんしょう}は、いつもの{方法|ほうほう}（{電話|でんわ}・メッセージ・{指示書|しじしょ}など）で{伝|つた}えます。このアプリは{送|おく}らず、{保存|ほぞん}もしません。" />
      </p>
    </main>
  );
}
