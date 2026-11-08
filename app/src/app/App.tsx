"use client";

import Link from "next/link";
import { useState } from "react";
import { ROLE_READING, ROLES, type Role } from "@/lib/roles";
import { Compose } from "./Compose";
import { Furi, Word } from "./Furi";
import { HistoryView } from "./HistoryView";
import { Session } from "./Session";
import { SettingsPanel, SettingsProvider } from "./Settings";
import { TopBar } from "./TopBar";
import styles from "./app.module.css";

/** 使い方：会話を聞く（伝える最中）か、伝える前に確かめるか */
type Mode = "talk" | "compose";

type Start = { mode: Mode; sender: Role; recipient: Role; id: string };

/** 下のメニュー（例/Docs/4_デザイン.md「刷新の方針」） */
type Tab = "home" | "talk" | "history";

export function App() {
  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("home");
  const [active, setActive] = useState<Start | null>(null);
  const exit = () => {
    setActive(null);
    setTab("home");
  };
  return (
    <>
      {/* 会話はメニューで別の画面に移っても続ける（聞き取りも止めない） */}
      {active && (
        <div hidden={tab !== "talk"}>
          {active.mode === "talk" ? (
            <Session key={active.id} {...active} onExit={exit} />
          ) : (
            <Compose key={active.id} {...active} onExit={exit} />
          )}
        </div>
      )}
      {tab === "home" && (
        <Home
          onStart={(s) => {
            setActive({ ...s, id: crypto.randomUUID() });
            setTab("talk");
          }}
          busy={active !== null}
          onResume={() => setTab("talk")}
        />
      )}
      {tab === "talk" && !active && (
        <main className={styles.page}>
          <TopBar title="{会話|かいわ}" />
          <p className={styles.empty}>
            <Furi text="{会話|かいわ}はまだ{始|はじ}まっていません。ホームで{話|はな}す{人|ひと}と{聞|き}く{人|ひと}を{選|えら}んで{始|はじ}めます。" />
          </p>
          <button className={styles.primary} onClick={() => setTab("home")}>
            <Furi text="ホームへ" />
          </button>
        </main>
      )}
      {tab === "history" && <HistoryView />}
      <BottomNav tab={tab} onChange={setTab} live={active !== null} />
    </>
  );
}

const TABS: { tab: Tab; label: string; icon: string }[] = [
  { tab: "home", label: "ホーム", icon: "⌂" },
  { tab: "talk", label: "{会話|かいわ}", icon: "💬" },
  { tab: "history", label: "{履歴|りれき}", icon: "🗒" },
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
          <span aria-hidden className={styles.navIcon}>
            {t.icon}
            {t.tab === "talk" && live && <span className={styles.navLive} />}
          </span>
          <Furi text={t.label} />
        </button>
      ))}
    </nav>
  );
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
function Home({
  onStart,
  busy,
  onResume,
}: {
  onStart: (s: Omit<Start, "id">) => void;
  busy: boolean;
  onResume: () => void;
}) {
  const [mode, setMode] = useState<Mode>("talk");
  const [sender, setSender] = useState<Role>("医師");
  const [recipient, setRecipient] = useState<Role>("患者");
  return (
    <main className={styles.page}>
      <TopBar title="どう{使|つか}いますか" />
      {busy && (
        <p className={styles.resume}>
          <Furi text="{会話|かいわ}が{続|つづ}いています。" />
          <button className={styles.textButton} onClick={onResume}>
            <Furi text="{会話|かいわ}に{戻|もど}る" />
          </button>
        </p>
      )}
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
        disabled={busy}
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
      <SettingsPanel />
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
            <Word word={r} reading={ROLE_READING[r]} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
