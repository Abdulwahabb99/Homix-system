import { parseReceivedAmount, shouldCommitReceivedAmount } from "./receivedAmountEdit";

describe("received amount inline edit helpers", () => {
  it("accepts zero and positive numbers (rounded to 2 decimals)", () => {
    expect(parseReceivedAmount("0")).toEqual({ ok: true, value: 0 });
    expect(parseReceivedAmount(" 150.5 ")).toEqual({ ok: true, value: 150.5 });
    expect(parseReceivedAmount("10.456")).toEqual({ ok: true, value: 10.46 });
  });

  it("rejects empty, non-numeric and negative input", () => {
    expect(parseReceivedAmount("")).toEqual({ ok: false, value: 0, reason: "empty" });
    expect(parseReceivedAmount("   ")).toEqual({ ok: false, value: 0, reason: "empty" });
    expect(parseReceivedAmount("abc")).toEqual({ ok: false, value: 0, reason: "invalid" });
    expect(parseReceivedAmount("-5")).toEqual({ ok: false, value: 0, reason: "negative" });
  });

  it("commits only a valid value that differs from the stored one", () => {
    expect(shouldCommitReceivedAmount("100", 100)).toBe(false);
    expect(shouldCommitReceivedAmount("100.00", 100)).toBe(false);
    expect(shouldCommitReceivedAmount("0", 100)).toBe(true);
    expect(shouldCommitReceivedAmount("0", 0)).toBe(false);
    expect(shouldCommitReceivedAmount("", 100)).toBe(false);
    expect(shouldCommitReceivedAmount("-1", 100)).toBe(false);
  });
});
