import { describe, expect, it } from "vitest";
import { isAmount } from "./amount";

describe("isAmount", () => {
  it.each(["10枚", "2本", "14錠", "500mL", "５日分", "十枚", "1.5g"])(
    "%s は数や量",
    (t) => expect(isAmount(t)).toBe(true),
  );
  it.each(["頓服", "NSAIDs", "14Fr", "1日3回毎食後", "ロキソニンテープ"])(
    "%s は数や量ではない",
    (t) => expect(isAmount(t)).toBe(false),
  );
});
