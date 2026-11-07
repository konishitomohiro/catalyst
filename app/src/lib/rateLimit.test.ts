import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  it("時間内の上限までは通し、超えたら止める", () => {
    const limit = createRateLimiter({ windowMs: 60_000, max: 3 });
    expect([1, 2, 3, 4].map(() => limit.take("a", 1000))).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  it("呼び出し元ごとに数える", () => {
    const limit = createRateLimiter({ windowMs: 60_000, max: 1 });
    expect(limit.take("a", 0)).toBe(true);
    expect(limit.take("b", 0)).toBe(true);
    expect(limit.take("a", 0)).toBe(false);
  });

  it("時間がたてば、また通す", () => {
    const limit = createRateLimiter({ windowMs: 60_000, max: 1 });
    expect(limit.take("a", 0)).toBe(true);
    expect(limit.take("a", 59_999)).toBe(false);
    expect(limit.take("a", 60_001)).toBe(true);
  });
});

describe("clientKey", () => {
  it("x-forwarded-for の先頭を使う", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(clientKey(req)).toBe("203.0.113.1");
  });

  it("ないときは unknown", () => {
    expect(clientKey(new Request("http://x"))).toBe("unknown");
  });
});
