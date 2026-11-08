"use client";

import Link from "next/link";
import { useState } from "react";
import { ROLE_READING, ROLES, type Role } from "@/lib/roles";
import { Furi, Word } from "./Furi";
import { Icon, ROLE_ICON } from "./Icon";
import { HistoryView } from "./HistoryView";
import { Session } from "./Session";
import { SettingsPanel, SettingsProvider } from "./Settings";
import { TestFlag, useTestInput } from "./TestFlag";
import { TopBar } from "./TopBar";
import styles from "./app.module.css";

type Start = { sender: Role; recipient: Role; id: string };

/**
 * 下のメニュー。会話していないときは「会話」で始める画面、会話中は会話の画面を出す
 * （ホームと会話を1つにまとめた。2026-11-08、Tomo）
 */
type Tab = "talk" | "history";

export function App({ testInput = false }: { testInput?: boolean }) {
  return (
    <TestFlag.Provider value={testInput}>
      <SettingsProvider>
        <Shell />
      </SettingsProvider>
    </TestFlag.Provider>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("talk");
  const [active, setActive] = useState<Start | null>(null);
  return (
    <>
      {/* 会話はメニューで履歴に移っても続ける（聞き取りも止めない） */}
      {active && (
        <div hidden={tab !== "talk"}>
          <Session key={active.id} {...active} onExit={() => setActive(null)} />
        </div>
      )}
      {tab === "talk" && !active && (
        <Home onStart={(s) => setActive({ ...s, id: crypto.randomUUID() })} />
      )}
      {tab === "history" && <HistoryView />}
      <BottomNav tab={tab} onChange={setTab} live={active !== null} />
    </>
  );
}

const TABS: { tab: Tab; label: string; icon: string }[] = [
  { tab: "talk", label: "{会話|かいわ}", icon: "forum" },
  { tab: "history", label: "{履歴|りれき}", icon: "history" },
];

function BottomNav({
  tab,
  onChange,
  live,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  live: boolean;
}) {
  return (
    <nav className={styles.nav} aria-label="メニュー">
      {TABS.map((t) => (
        <button
          key={t.tab}
          className={t.tab === tab ? styles.navOn : styles.navItem}
          aria-current={t.tab === tab ? "page" : undefined}
          onClick={() => onChange(t.tab)}
        >
          <span className={styles.navIcon}>
            <Icon name={t.icon} fill={t.tab === tab} />
            {t.tab === "talk" && live && <span className={styles.navLive} />}
          </span>
          <Furi text={t.label} />
        </button>
      ))}
    </nav>
  );
}

/** 会話を始める画面：だれとだれが話すかを選ぶ（使い方は「会話を聞く」だけ。2026-11-08、Tomo） */
function Home({ onStart }: { onStart: (s: Omit<Start, "id">) => void }) {
  const [showSettings, setShowSettings] = useState(false);
  const testInput = useTestInput();
  const [sender, setSender] = useState<Role>("医師");
  const [recipient, setRecipient] = useState<Role>("患者");
  return (
    <main className={styles.page}>
      <TopBar title="だれと{話|はな}しますか">
        <button
          className={styles.round}
          aria-label="表示の設定"
          aria-expanded={showSettings}
          onClick={() => setShowSettings((v) => !v)}
        >
          <Icon name="text_fields" />
        </button>
      </TopBar>
      {showSettings && <SettingsPanel />}
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
        <Icon name="mic" />
        <Furi text="{会話|かいわ}を{始|はじ}める" />
      </button>
      <p className={styles.note}>
        <Furi text="{試作|しさく}です。{話|はな}した{内容|ないよう}は、{文字|もじ}にするためと{言葉|ことば}を{見|み}つけるために、{外|そと}のサービスに{送|おく}られます。{架空|かくう}の{内容|ないよう}で{試|ため}せます。" />
      </p>
      {testInput && (
        <p className={styles.note}>
          <Link href="/prototype/transcribe">
            <Furi text="{文字起|もじお}こしの{精度|せいど}を{確|たし}かめる（{開発用|かいはつよう}）" />
          </Link>
        </p>
      )}
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
            <Icon name={r === value ? "check" : ROLE_ICON[r]} />
            <Word word={r} reading={ROLE_READING[r]} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
