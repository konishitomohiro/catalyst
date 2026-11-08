"use client";
// 画面の設定：文字の大きさ・ふりがな（例/Docs/4_デザイン.md「刷新の方針」）。その端末の中だけに残す。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_SETTINGS,
  parseSettings,
  SETTINGS_KEY,
  type FontSize,
  type FuriMode,
  type Settings,
} from "@/lib/settings";
import { Furi } from "./Furi";
import styles from "./app.module.css";

const Ctx = createContext<{
  settings: Settings;
  update: (s: Partial<Settings>) => void;
}>({ settings: DEFAULT_SETTINGS, update: () => {} });

export const useSettings = () => useContext(Ctx);

const listeners = new Set<() => void>();
function subscribe(l: () => void) {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", l);
  };
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // 保存された設定を読む。サーバー側の描画では初期値を使い、画面が出てから保存された値に合わせる
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(SETTINGS_KEY),
    () => null,
  );
  const settings = useMemo(() => parseSettings(raw), [raw]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.size = settings.fontSize;
    root.dataset.furi = settings.furigana;
  }, [settings]);

  const update = (s: Partial<Settings>) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, ...s }));
    } catch {
      // 残せなくても困らない（次に開いたときに初期値に戻るだけ）
    }
    listeners.forEach((l) => l());
  };

  return <Ctx.Provider value={{ settings, update }}>{children}</Ctx.Provider>;
}

const SIZES: { v: FontSize; label: string }[] = [
  { v: "small", label: "小" },
  { v: "medium", label: "中" },
  { v: "large", label: "大" },
];
const FURI: { v: FuriMode; label: string }[] = [
  { v: "all", label: "すべて" },
  { v: "terms", label: "{見|み}つけた{言葉|ことば}だけ" },
];

/** 文字の大きさの切り替え（画面の右上に置く） */
export function SizeSwitch() {
  const { settings, update } = useSettings();
  return (
    <div
      className={styles.sizeSwitch}
      role="radiogroup"
      aria-label="文字の大きさ"
    >
      {SIZES.map((s) => (
        <button
          key={s.v}
          role="radio"
          aria-checked={settings.fontSize === s.v}
          aria-label={`文字 ${s.label}`}
          className={`${styles.sizeItem} ${styles["size_" + s.v]} ${
            settings.fontSize === s.v ? styles.sizeOn : ""
          }`}
          onClick={() => update({ fontSize: s.v })}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/** 設定の画面（ホームの下に置く） */
export function SettingsPanel() {
  const { settings, update } = useSettings();
  return (
    <section className={styles.settings} aria-labelledby="settings-title">
      <h2 id="settings-title" className={styles.subTitle}>
        <Furi text="{表示|ひょうじ}の{設定|せってい}" />
      </h2>
      <div className={styles.settingRow}>
        <span>
          <Furi text="{文字|もじ}の{大|おお}きさ" />
        </span>
        <SizeSwitch />
      </div>
      <div className={styles.settingRow}>
        <span>
          <Furi text="ふりがな" />
        </span>
        <div className={styles.seg} role="radiogroup" aria-label="ふりがな">
          {FURI.map((f) => (
            <button
              key={f.v}
              role="radio"
              aria-checked={settings.furigana === f.v}
              aria-label={
                f.v === "all" ? "ふりがな すべて" : "ふりがな 見つけた言葉だけ"
              }
              className={
                settings.furigana === f.v ? styles.segOn : styles.segItem
              }
              onClick={() => update({ furigana: f.v })}
            >
              <Furi text={f.label} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
