"use client";
// ブラウザの音声認識（Web Speech API、無料）。日本語で聞き取り続ける。
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type RecognitionResultList = ArrayLike<
  ArrayLike<{ transcript: string }> & { isFinal: boolean }
>;
type Recognition = {
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
type Ctor = new () => Recognition;

function getCtor(): Ctor | null {
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

/** onFinal：発言が1つ確定するたびに呼ばれる */
export function useSpeechRecognition(onFinal?: (text: string) => void) {
  // サーバーでは null（未判定）、ブラウザでは対応しているかどうか
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getCtor() !== null,
    () => null,
  );
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const wantRef = useRef(false);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    return () => {
      wantRef.current = false;
      recRef.current?.abort();
    };
  }, []);

  function start() {
    const C = getCtor();
    if (!C) return;
    const rec = new C();
    rec.lang = "ja-JP";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let tmp = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript;
        if (r.isFinal) {
          if (text.trim()) onFinalRef.current?.(text.trim());
        } else tmp += text;
      }
      setInterim(tmp);
    };
    rec.onerror = (e) => {
      if (e.error === "aborted" || e.error === "no-speech") return;
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
          return;
        } catch {
          wantRef.current = false;
        }
      }
      setListening(false);
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

  return { supported, listening, interim, error, start, stop };
}
