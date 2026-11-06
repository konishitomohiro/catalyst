"use client";

import Link from "next/link";
import { useState } from "react";
import { ROLE_READING, ROLES, type Role } from "@/lib/roles";
import { Furi } from "./Furi";
import { Session } from "./Session";
import styles from "./app.module.css";

export function App() {
  const [roles, setRoles] = useState<{ sender: Role; recipient: Role } | null>(
    null,
  );
  if (roles) return <Session {...roles} onExit={() => setRoles(null)} />;
  return <Home onStart={setRoles} />;
}

/** ホーム：だれとだれが話すかを選ぶ */
function Home({
  onStart,
}: {
  onStart: (r: { sender: Role; recipient: Role }) => void;
}) {
  const [sender, setSender] = useState<Role>("医師");
  const [recipient, setRecipient] = useState<Role>("患者");
  return (
    <main className={styles.home}>
      <h1 className={styles.title}>
        <Furi text="だれと だれが {話|はな}しますか" />
      </h1>
      <RolePicker
        name="sender"
        label="{話|はな}す{人|ひと}"
        value={sender}
        onChange={setSender}
      />
      <RolePicker
        name="recipient"
        label="{聞|き}く{人|ひと}（この{端末|たんまつ}を{持|も}つ{人|ひと}）"
        value={recipient}
        onChange={setRecipient}
      />
      <button
        className={styles.primary}
        onClick={() => onStart({ sender, recipient })}
      >
        <Furi text="はじめる" />
      </button>
      <p className={styles.note}>
        <Furi text="{試作|しさく}です。{話|はな}した{内容|ないよう}は、{文字|もじ}にするためと{言葉|ことば}を{見|み}つけるために、{外|そと}のサービスに{送|おく}られます。{架空|かくう}の{会話|かいわ}で{試|ため}せます。" />
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
