"use client";

import { useState } from "react";
import { checkWords } from "@/lib/transcriptCheck";
import { useSpeechRecognition } from "../../useSpeechRecognition";
import { SAMPLES } from "./samples";
import styles from "./page.module.css";

export function Transcriber() {
  const [finals, setFinals] = useState<string[]>([]);
  const { supported, listening, interim, error, start, stop } =
    useSpeechRecognition((t) => setFinals((f) => [...f, t]));

  const transcript = finals.join("") + interim;

  if (supported === false) {
    return (
      <p className={styles.error}>
        このブラウザは音声認識（Web Speech API）に対応していません。iPhone の
        Safari、パソコンや Android の Chrome などで開いてください。
      </p>
    );
  }

  return (
    <>
      <div className={styles.controls}>
        {listening ? (
          <button className={styles.stop} onClick={stop}>
            ■ 止める
          </button>
        ) : (
          <button
            className={styles.start}
            onClick={start}
            disabled={supported !== true}
          >
            ● 聞き取りを始める
          </button>
        )}
        <button
          onClick={() => {
            setFinals([]);
          }}
        >
          消す
        </button>
        <span className={styles.status}>
          {listening ? "聞き取り中…" : "停止中"}
        </span>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.box}>
        <h2>文字起こし</h2>
        {finals.length === 0 && !interim && (
          <p className={styles.hint}>ここに、話した内容が文字で出ます。</p>
        )}
        {finals.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
        {interim && <p className={styles.interim}>{interim}</p>}
      </section>

      <section className={styles.box}>
        <h2>読み上げて試す文</h2>
        <p className={styles.hint}>
          下の文を読み上げると、医療用語が正しく文字になったかを ✓ / ✗
          で表示します。
        </p>
        <ol className={styles.samples}>
          {SAMPLES.map((s) => (
            <li key={s.sentence}>
              <div>{s.sentence}</div>
              <div className={styles.words}>
                {checkWords(transcript, s.words).map((r) => (
                  <span
                    key={r.word}
                    className={r.matched ? styles.ok : styles.ng}
                    title={r.matched ? `「${r.matched}」として認識` : ""}
                  >
                    {r.matched ? "✓" : "✗"} {r.word}
                    {r.matched && r.matched !== r.word && `（${r.matched}）`}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
