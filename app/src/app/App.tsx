"use client";

import Link from "next/link";
import { useState } from "react";
import { ROLE_READING, ROLES, type Role } from "@/lib/roles";
import { Compose } from "./Compose";
import { Furi } from "./Furi";
import { Session } from "./Session";
import styles from "./app.module.css";

/** 使い方：会話を聞く（伝える最中）か、伝える前に確かめるか */
type Mode = "talk" | "compose";

type Start = { mode: Mode; sender: Role; recipient: Role };

export function App() {
  const [start, setStart] = useState<Start | null>(null);
  if (start?.mode === "talk") {
    return <Session {...start} onExit={() => setStart(null)} />;
  }
  if (start?.mode === "compose") {
    return <Compose {...start} onExit={() => setStart(null)} />;
  }
  return <Home onStart={setStart} />;
}

const MODES: { mode: Mode; label: string; desc: string }[] = [
  {
    mode: "talk",
    label: "{会話|かいわ}を{聞|き}く",
    desc: "{聞|き}く{人|ひと}の{端末|たんまつ}で{会話|かいわ}を{聞|き}き、{分|わ}かりにくそうな{言葉|ことば}をそっと{確|たし}かめます",
  },
  {
    mode: "compose",
    label: "{伝|つた}える{前|まえ}に{確|たし}かめる",
    desc: "{指示|しじ}や{説明|せつめい}を{書|か}くと、{相手|あいて}が{分|わ}からなそうな{点|てん}を{挙|あ}げます",
  },
];

/** ホーム：使い方と、だれとだれが話すかを選ぶ */
function Home({ onStart }: { onStart: (s: Start) => void }) {
  const [mode, setMode] = useState<Mode>("talk");
  const [sender, setSender] = useState<Role>("医師");
  const [recipient, setRecipient] = useState<Role>("患者");
  return (
    <main className={styles.home}>
      <h1 className={styles.title}>
        <Furi text="どう{使|つか}いますか" />
      </h1>
      <fieldset className={styles.roles}>
        <legend className={styles.srOnly}>
          <Furi text="{使|つか}い{方|かた}" />
        </legend>
        <div className={styles.modes}>
          {MODES.map((m) => (
            <label
              key={m.mode}
              className={m.mode === mode ? styles.modeOn : styles.mode}
            >
              <input
                type="radio"
                name="mode"
                checked={m.mode === mode}
                onChange={() => setMode(m.mode)}
              />
              <span className={styles.modeLabel}>
                <span aria-hidden className={styles.chipMark}>
                  {m.mode === mode ? "✓" : ""}
                </span>
                <Furi text={m.label} />
              </span>
              <span className={styles.modeDesc}>
                <Furi text={m.desc} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <RolePicker
        name="sender"
        label={
          mode === "talk"
            ? "{話|はな}す{人|ひと}"
            : "{書|か}く{人|ひと}（この{端末|たんまつ}を{使|つか}う{人|ひと}）"
        }
        value={sender}
        onChange={setSender}
      />
      <RolePicker
        name="recipient"
        label={
          mode === "talk"
            ? "{聞|き}く{人|ひと}（この{端末|たんまつ}を{持|も}つ{人|ひと}）"
            : "{伝|つた}える{相手|あいて}"
        }
        value={recipient}
        onChange={setRecipient}
      />
      <button
        className={styles.primary}
        onClick={() => onStart({ mode, sender, recipient })}
      >
        <Furi text="はじめる" />
      </button>
      <p className={styles.note}>
        <Furi text="{試作|しさく}です。{話|はな}したり{書|か}いたりした{内容|ないよう}は、{文字|もじ}にするためと{言葉|ことば}を{見|み}つけるために、{外|そと}のサービスに{送|おく}られます。{架空|かくう}の{内容|ないよう}で{試|ため}せます。" />
      </p>
      <p className={styles.note}>
        <Link href="/prototype/transcribe">
          <Furi text="{文字起|もじお}こしの{精度|せいど}を{確|たし}かめる（{開発用|かいはつよう}）" />
        </Link>
      </p>
    </main>
  );
}

function RolePicker({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: Role;
  onChange: (r: Role) => void;
}) {
  return (
    <fieldset className={styles.roles}>
      <legend>
        <Furi text={label} />
      </legend>
      <div className={styles.chips}>
        {ROLES.map((r) => (
          <label key={r} className={r === value ? styles.chipOn : styles.chip}>
            <input
              type="radio"
              name={name}
              checked={r === value}
              onChange={() => onChange(r)}
            />
            <span aria-hidden className={styles.chipMark}>
              {r === value ? "✓" : ""}
            </span>
            <ruby>
              {r}
              <rt>{ROLE_READING[r]}</rt>
            </ruby>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
