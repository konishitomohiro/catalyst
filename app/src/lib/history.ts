// 会話の履歴（例/Docs/1_方向.md「会話履歴の保存」）。その端末の中だけに残す。サーバーには送らない。
import type { Role } from "./roles";
import type { Speaker } from "./detection";
import type { Summary } from "./summary";

export type HistoryItem = {
  term: string;
  reading?: string;
  checked: boolean;
  quote?: string;
};

export type HistoryRecord = {
  id: string;
  /** 始めた時刻（ミリ秒） */
  startedAt: number;
  endedAt: number;
  sender: Role;
  recipient: Role;
  /** 質問リスト（「いいえ」と答えた言葉） */
  items: HistoryItem[];
  /** 会話の文字 */
  lines: string[];
  /** 行ごとの話した人（lines と同じ順）。古い記録にはない */
  speakers?: Speaker[];
  /** AIが聞き間違いを直した行の、元の聞き取り（lines と同じ順。直していない行は null） */
  originals?: (string | null)[];
  /** AIによる要約（「要約を作る」を押したときだけ） */
  summary?: Summary;
};

export const HISTORY_KEY = "catalyst.history";
/** 残す件数の上限（古いものから消える） */
export const MAX_RECORDS = 50;

export function parseHistory(raw: string | null): HistoryRecord[] {
  try {
    const v = JSON.parse(raw ?? "[]");
    return Array.isArray(v)
      ? v.filter(
          (r): r is HistoryRecord =>
            typeof r?.id === "string" &&
            Array.isArray(r.items) &&
            Array.isArray(r.lines),
        )
      : [];
  } catch {
    return [];
  }
}

/** 同じ id なら置き換え、なければ先頭に足す。新しい順・上限つき */
export function upsertRecord(
  list: HistoryRecord[],
  rec: HistoryRecord,
): HistoryRecord[] {
  // 会話の途中で作った要約は、会話の文字が増えるまで残す
  const old = list.find((r) => r.id === rec.id);
  if (!rec.summary && old?.summary && old.lines.length === rec.lines.length) {
    rec = { ...rec, summary: old.summary };
  }
  return [rec, ...list.filter((r) => r.id !== rec.id)]
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, MAX_RECORDS);
}

export function removeRecord(
  list: HistoryRecord[],
  id: string,
): HistoryRecord[] {
  return list.filter((r) => r.id !== id);
}

/** 空の会話（言葉も会話の文字もない）は残さない */
export const isEmptyRecord = (r: HistoryRecord) =>
  r.items.length === 0 && r.lines.length === 0;

function read(): HistoryRecord[] {
  if (typeof localStorage === "undefined") return [];
  return parseHistory(localStorage.getItem(HISTORY_KEY));
}

function write(list: HistoryRecord[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // 容量いっぱいなどで残せなくても、会話は続けられる
  }
}

export const loadHistory = read;
export const saveRecord = (rec: HistoryRecord) => {
  if (isEmptyRecord(rec)) return;
  write(upsertRecord(read(), rec));
};
export const deleteRecord = (id: string) => write(removeRecord(read(), id));
export const deleteAllHistory = () => write([]);
