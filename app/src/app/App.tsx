"use client";

import Link from "next/link";
import { useState } from "react";
import { ROLES, type Role } from "@/lib/roles";
import { Session } from "./Session";
import styles from "./app.module.css";

export function App() {
  const [roles, setRoles] = useState<{ sender: Role; recipient: Role } | null>(
    null,
  );
  if (roles) return <Session {...roles} onExit={() => setRoles(null)} />;
  return <Home onStart={setRoles} />;
}

function Home({
  onStart,
}: {
  onStart: (r: { sender: Role; recipient: Role }) => void;
}) {
  const [sender, setSender] = useState<Role>("医師");
  const [recipient, setRecipient] = useState<Role>("患者");
  return (
    <main className={styles.home}>
      <h1>catalyst</h1>
      <p className={styles.muted}>
        会話の中の「前提が必要な言葉」を見つけて、聞き手が話し手に質問しやすくします。
        この端末は聞き手が持ちます。
      </p>
      <RolePicker label="話す人" value={sender} onChange={setSender} />
      <RolePicker
        label="聞く人（この端末を持つ人）"
        value={recipient}
        onChange={setRecipient}
      />
      <button
        className={styles.primary}
        onClick={() => onStart({ sender, recipient })}
      >
        はじめる
      </button>
      <p className={styles.note}>
        試作です。架空の会話で試してください。話した内容は、文字起こしのためにブラウザの音声認識へ、言葉を見つけるために
        AI（Gemini）へ送られます。
      </p>
      <p className={styles.note}>
        <Link href="/prototype/transcribe">
          試作：文字起こしの精度を確かめる
        </Link>
      </p>
    </main>
  );
}

function RolePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Role;
  onChange: (r: Role) => void;
}) {
  return (
    <fieldset className={styles.roles}>
      <legend>{label}</legend>
      {ROLES.map((r) => (
        <label key={r} className={r === value ? styles.roleOn : styles.role}>
          <input
            type="radio"
            name={label}
            checked={r === value}
            onChange={() => onChange(r)}
          />
          {r}
        </label>
      ))}
    </fieldset>
  );
}
