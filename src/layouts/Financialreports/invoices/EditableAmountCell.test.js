import { parseAmountDraft, parseAmountInput } from "./EditableAmountCell";

describe("parseAmountInput", () => {
  it("accepts zero and normal non-negative numbers", () => {
    expect(parseAmountInput("0")).toBe(0);
    expect(parseAmountInput("12.5")).toBe(12.5);
  });
  it("rejects blank, negative and non-numeric input", () => {
    expect(parseAmountInput("")).toBeNull();
    expect(parseAmountInput("  ")).toBeNull();
    expect(parseAmountInput("-3")).toBeNull();
    expect(parseAmountInput("abc")).toBeNull();
  });
});

describe("parseAmountDraft (artifact behaviour, except an empty box cancels instead of saving 0)", () => {
  it("empty / blank = cancel", () => {
    expect(parseAmountDraft("")).toEqual({ kind: "cancel" });
    expect(parseAmountDraft("   ")).toEqual({ kind: "cancel" });
  });
  it("explicit 0 is saved", () => {
    expect(parseAmountDraft("0")).toEqual({ kind: "value", value: 0 });
  });
  it("negative and garbage are invalid", () => {
    expect(parseAmountDraft("-1")).toEqual({ kind: "invalid" });
    expect(parseAmountDraft("x")).toEqual({ kind: "invalid" });
  });
});
