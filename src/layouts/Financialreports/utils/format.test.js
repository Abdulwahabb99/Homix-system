import { arDigits, arNum, arDate } from "./format";
import { money } from "./calc";

describe("Arabic-Indic formatting (Financial Reports only)", () => {
  it("formats integers with Arabic digits and thousands separators, no currency inside the number", () => {
    expect(arNum(1200)).toBe((1200).toLocaleString("ar-EG"));
    expect(arNum(1200)).toMatch(/^[٠-٩٬,]+$/);
    expect(arNum("abc")).toBe("٠");
  });
  it("tables keep the currency suffix", () => {
    expect(money(1100)).toBe(`${arNum(1100)} ج.م`);
  });
  it("converts digits inside text and formats dates with Arabic digits", () => {
    expect(arDigits("14 نوفمبر 2026")).toBe("١٤ نوفمبر ٢٠٢٦");
    expect(arDate("2026-11-14T10:00:00Z")).toMatch(/[٠-٩]/);
    expect(arDate(null)).toBe("—");
  });
});
