// 数や量（「10枚」「500mL」など）かどうかをコードで見分ける（ルール4：判断はコード）。
// 数や量は、数そのものではなく「なんでその量を出すのか」を聞く（2026-11-08、Tomo）。

const NUM = "[0-9０-９.．一二三四五六七八九十百千]+";
const UNIT =
  "(枚|本|錠|包|袋|個|本分|日分|週分|回分|回|カプセル|mL|ml|ｍＬ|L|cc|g|mg|μg|単位|滴|缶|箱|セット)";
const AMOUNT = new RegExp(`^${NUM}\\s*${UNIT}$`);

export function isAmount(term: string): boolean {
  return AMOUNT.test(term.trim());
}
