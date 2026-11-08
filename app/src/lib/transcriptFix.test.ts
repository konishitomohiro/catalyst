import { describe, expect, it } from "vitest";
import { acceptCorrection, digitsOf, squeezeSpaces } from "./transcriptFix";

describe("squeezeSpaces", () => {
  it("日本語・数字の間の空白を消す", () => {
    expect(squeezeSpaces("アゾセミド 30 mm を 1 日 2 畳 処方 し ます")).toBe(
      "アゾセミド30mmを1日2畳処方します",
    );
  });
  it("英字どうしの間は残す", () => {
    expect(squeezeSpaces("New York に 行く")).toBe("New Yorkに行く");
  });
});

describe("acceptCorrection", () => {
  const orig = "アゾセミド30mmを1日2畳処方します";
  it("単位や言葉の聞き間違いの直しは受け取る", () => {
    expect(acceptCorrection(orig, "アゾセミド30mgを1日2錠処方します")).toBe(
      "アゾセミド30mgを1日2錠処方します",
    );
  });
  it("数字が変わる直しは受け取らない", () => {
    expect(
      acceptCorrection(orig, "アゾセミド20mgを1日2錠処方します"),
    ).toBeNull();
    expect(
      acceptCorrection(orig, "アゾセミド30mgを1日1錠処方します"),
    ).toBeNull();
  });
  it("大きすぎる直し・変わっていない文は受け取らない", () => {
    expect(
      acceptCorrection(orig, "利尿薬を朝に飲んでください。30、1、2"),
    ).toBeNull();
    expect(acceptCorrection(orig, orig)).toBeNull();
    expect(acceptCorrection(orig, undefined)).toBeNull();
  });
  it("数字の並びを取り出す", () => {
    expect(digitsOf("１日３回、十日分")).toBe("13十");
  });
});
