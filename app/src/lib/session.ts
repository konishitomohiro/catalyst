// 対面の流れの状態（例/Docs/1_方向.md 7章）。選択と判断はすべてここ（コード）でする。
import { normalize } from "./transcriptCheck";

export type ListItem = { key: string; term: string; checked: boolean };

export type SessionState = {
  /** 答えを待っている「分かりますか？」。古い順 */
  pending: { key: string; term: string }[];
  /** 質問リスト。上ほど見えにくいので、チェック済みを上、未チェックを下に置く */
  list: ListItem[];
  /** 「はい」と答えた語 */
  understood: string[];
  /** また出てきたので知らせる質問リストの項目（n は知らせるたびに増える） */
  highlight: { key: string; n: number } | null;
};

export type SessionAction =
  | { type: "detected"; terms: string[] }
  | { type: "answer"; key: string; understood: boolean }
  | { type: "toggle"; key: string };

export const initialSession: SessionState = {
  pending: [],
  list: [],
  understood: [],
  highlight: null,
};

export const termKey = (term: string) => normalize(term);

/** チェック済みのかたまりの、いちばん下に入れる */
function insertChecked(list: ListItem[], item: ListItem): ListItem[] {
  const i = list.findIndex((x) => !x.checked);
  const at = i === -1 ? list.length : i;
  return [...list.slice(0, at), item, ...list.slice(at)];
}

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case "detected": {
      let next = state;
      for (const term of action.terms) {
        const key = termKey(term);
        if (!key) continue;
        // 一度答えた語・答え待ちの語は聞き直さない
        if (next.understood.includes(key)) continue;
        if (next.pending.some((p) => p.key === key)) continue;
        if (next.list.some((x) => x.key === key)) {
          // 質問リストにある語 → その項目と状態を見せるだけ
          next = {
            ...next,
            highlight: { key, n: (next.highlight?.n ?? 0) + 1 },
          };
          continue;
        }
        next = { ...next, pending: [...next.pending, { key, term }] };
      }
      return next;
    }
    case "answer": {
      const p = state.pending.find((x) => x.key === action.key);
      if (!p) return state;
      const pending = state.pending.filter((x) => x.key !== action.key);
      if (action.understood) {
        return { ...state, pending, understood: [...state.understood, p.key] };
      }
      // 「いいえ」→ 質問リストのいちばん下（いちばん見えやすい位置）に足す
      return {
        ...state,
        pending,
        list: [...state.list, { key: p.key, term: p.term, checked: false }],
      };
    }
    case "toggle": {
      const item = state.list.find((x) => x.key === action.key);
      if (!item) return state;
      const rest = state.list.filter((x) => x.key !== action.key);
      const list = item.checked
        ? // チェックを外した → まだ聞いていない側（いちばん下）へ戻す
          [...rest, { ...item, checked: false }]
        : // チェックした → 上のほう（チェック済みのかたまりの下）へ移す
          insertChecked(rest, { ...item, checked: true });
      return { ...state, list };
    }
  }
}
