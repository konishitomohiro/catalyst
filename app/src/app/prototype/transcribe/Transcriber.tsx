"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { checkWords } from "@/lib/transcriptCheck";
import { SAMPLES } from "./samples";
import styles from "./page.module.css";

// ブラウザの音声認識（Web Speech API）で使う部分だけの型
type RecognitionResultList = ArrayLike<
  ArrayLike<{ transcript: string }> & { isFinal: boolean }
>;
type SpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((e: { resultIndex: number; results: RecognitionResultList }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type Ctor = new () => SpeechRecognition;

function getRecognitionCtor(): Ctor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: Ctor;
    webkitSpeechRecognition?: Ctor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

const ERROR_TEXT: Record<string, string> = {
  "not-allowed":
    "マイクの使用が許可されていません。ブラウザの設定で許可してください。",
  "service-not-allowed": "このブラウザでは音声認識を使えません。",
  "no-speech": "音声が聞き取れませんでした。",
  "audio-capture": "マイクが見つかりません。",
  network: "音声認識のサーバーにつながりません。",
};

export function Transcriber() {
  // サーバーでは null（未判定）、ブラウザでは対応しているかどうか
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionCtor() !== null,
    () => null,
  );
  const [listening, setListening] = useState(false);
  const [finals, setFinals] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const wantRef = useRef(false);

  useEffect(() => {
    return () => {
      wantRef.current = false;
      recRef.current?.abort();
    };
  }, []);

  function start() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "ja-JP";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let tmp = "";
      const done: string[] = [];
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) done.push(r[0].transcript);
        else tmp += r[0].transcript;
      }
      if (done.length) setFinals((f) => [...f, ...done]);
      setInterim(tmp);
    };
    rec.onerror = (e) => {
      if (e.error === "aborted") return;
      setError(ERROR_TEXT[e.error] ?? `エラー：${e.error}`);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantRef.current = false;
      }
    };
    // ブラウザは無音が続くと勝手に止まるので、止めていなければ再開する
    rec.onend = () => {
      setInterim("");
      if (wantRef.current) {
        try {
          rec.start();
        } catch {
          wantRef.current = false;
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };
    recRef.current = rec;
    wantRef.current = true;
    setError(null);
    rec.start();
    setListening(true);
  }

  function stop() {
    wantRef.current = false;
    recRef.current?.stop();
  }

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
            setInterim("");
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
