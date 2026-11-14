import { parseInlineAmount } from "./useInlineNumberEdit";

describe("parseInlineAmount", () => {
  it("treats a blank box as cancel, never as 0", () => {
    expect(parseInlineAmount("")).toEqual({ kind: "cancel" });
    expect(parseInlineAmount("   ")).toEqual({ kind: "cancel" });
  });
  it("keeps an explicit 0 and normal numbers", () => {
    expect(parseInlineAmount("0")).toEqual({ kind: "value", value: 0 });
    expect(parseInlineAmount("12.5")).toEqual({ kind: "value", value: 12.5 });
  });
  it("rejects negatives and garbage", () => {
    expect(parseInlineAmount("-1")).toEqual({ kind: "invalid" });
    expect(parseInlineAmount("abc")).toEqual({ kind: "invalid" });
  });
});
