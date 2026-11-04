import { fmtCairoDate, fromPickerDate, toCairoYmd, toPickerDate } from "./accountsDates";
import moment from "moment-timezone";

describe("accounts date helpers", () => {
  it("round-trips YYYY-MM-DD through the picker format", () => {
    expect(toPickerDate("2026-10-01")).toBe("01-10-2026");
    expect(fromPickerDate("01-10-2026")).toBe("2026-10-01");
    expect(fromPickerDate(moment("2026-10-31", "YYYY-MM-DD").locale("ar"))).toBe("2026-10-31");
  });

  it("returns empty strings for empty or invalid input", () => {
    expect(toPickerDate("")).toBe("");
    expect(toPickerDate("garbage")).toBe("");
    expect(fromPickerDate("")).toBe("");
    expect(fromPickerDate(null)).toBe("");
    expect(fromPickerDate("31-31-2026")).toBe("");
  });

  it("shows the Cairo calendar day, not the UTC day", () => {
    // 22:30Z in September is 01:30 the next day in Cairo (UTC+3)
    expect(fmtCairoDate("2026-09-20T22:30:00.000Z")).toBe("21/09/26");
    expect(toCairoYmd("2026-09-20T22:30:00.000Z")).toBe("2026-09-21");
    // winter: 22:30Z is 00:30 next day (UTC+2)
    expect(toCairoYmd("2026-12-31T22:30:00.000Z")).toBe("2027-01-01");
    // UTC midnight of a picked day stays the same Cairo day
    expect(toCairoYmd("2026-10-05T00:00:00.000Z")).toBe("2026-10-05");
    expect(fmtCairoDate(null)).toBe("—");
  });
});
