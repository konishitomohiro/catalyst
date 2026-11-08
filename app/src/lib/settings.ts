// 画面の設定（例/Docs/4_デザイン.md「刷新の方針」）。その端末の中だけに残す。
export type FontSize = "small" | "medium" | "large";
/** all＝画面の文言にもふりがな／terms＝AIが見つけた言葉だけ */
export type FuriMode = "all" | "terms";
export type Settings = { fontSize: FontSize; furigana: FuriMode };

export const DEFAULT_SETTINGS: Settings = {
  fontSize: "medium",
  furigana: "all",
};
export const SETTINGS_KEY = "catalyst.settings";

/** 保存された文字列を読む。壊れていたら初期値に戻す */
export function parseSettings(raw: string | null): Settings {
  try {
    const v = JSON.parse(raw ?? "") as Partial<Settings>;
    return {
      fontSize: ["small", "medium", "large"].includes(v.fontSize as string)
        ? (v.fontSize as FontSize)
        : DEFAULT_SETTINGS.fontSize,
      furigana: v.furigana === "terms" ? "terms" : "all",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
