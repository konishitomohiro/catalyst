// AIの出力を検査するコード側の処理（ルール4・5）。
// 出力の形は仮。例/Docs/3_仕組み.md「AIの出力の形」が決まったら合わせる。
import { z } from "zod";
import { viewpointIds, type Recipient } from "./viewpoints";

/** 表示する「分からない点」の最大件数（例/Docs/7_テスト.md 2章） */
export const MAX_ITEMS = 3;

const itemSchema = z.object({
  viewpointId: z.string(),
  likelyUnclear: z.boolean(),
  question: z.string().min(1),
});

export const aiOutputSchema = z.object({ items: z.array(itemSchema) });

export type PredictionItem = z.infer<typeof itemSchema>;

export type ParseResult =
  { ok: true; items: PredictionItem[] } | { ok: false; error: string };

/**
 * AIが返した文字列を検査し、表示する項目だけを返す。
 * - JSONとして読めない・形が違う → ok: false
 * - 観点リストにない観点・「分からなそう」でない項目 → 除外
 * - 観点リストの順に並べ、MAX_ITEMS 件までに絞る
 */
export function parseAiOutput(raw: string, recipient: Recipient): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "JSONとして読めない" };
  }
  const parsed = aiOutputSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: "決めた形式と違う" };
  }
  const order = viewpointIds(recipient);
  const items = parsed.data.items
    .filter((item) => item.likelyUnclear && order.includes(item.viewpointId))
    .sort((a, b) => order.indexOf(a.viewpointId) - order.indexOf(b.viewpointId))
    .filter(
      (item, i, arr) =>
        arr.findIndex((x) => x.viewpointId === item.viewpointId) === i,
    )
    .slice(0, MAX_ITEMS);
  return { ok: true, items };
}
