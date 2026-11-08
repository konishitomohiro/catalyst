"use client";
// テスト用サイトだけに出す「用意した発言を入れる」欄（src/lib/testInput.ts）
import { useState } from "react";
import type { Role } from "@/lib/roles";
import { scriptsFor, type TestScript } from "@/lib/testInput";
import { Icon } from "./Icon";
import styles from "./app.module.css";

export function TestInput({
  scripts,
  sender,
  recipient,
  label,
  onPick,
}: {
  scripts: TestScript[];
  sender: Role;
  recipient: Role;
  label: string;
  onPick: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const list = scriptsFor(scripts, sender, recipient);
  return (
    <section className={styles.testBox} aria-label="テスト用の入力">
      <button
        className={styles.testToggle}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="science" />
        テスト用：{label}
        <Icon name={open ? "expand_less" : "expand_more"} />
      </button>
      {open &&
        list.map((s) => (
          <div key={s.title} className={styles.testGroup}>
            <p className={styles.testTitle}>
              {s.title}（{s.sender} → {s.recipient}
              {s.sender === sender && s.recipient === recipient
                ? "・今の組"
                : ""}
              ）
            </p>
            {s.lines.map((line) => (
              <button
                key={line}
                className={
                  used.includes(line) ? styles.testLineUsed : styles.testLine
                }
                onClick={() => {
                  setUsed((u) => [...u, line]);
                  onPick(line);
                }}
              >
                {line}
              </button>
            ))}
          </div>
        ))}
    </section>
  );
}
