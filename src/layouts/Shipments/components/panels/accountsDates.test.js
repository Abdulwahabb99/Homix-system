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

describe("Cairo day helpers for the bulk bar / inline editors / fines", () => {
  const { cairoDayStartIso, cairoMonthKey, toCairoYmd } = require("./accountsDates");

  it("turns a picked day into Cairo midnight (winter UTC+2, summer UTC+3), whatever the browser zone", () => {
    expect(cairoDayStartIso("2026-11-14")).toBe("2026-11-13T22:00:00.000Z");
    expect(cairoDayStartIso("2026-07-01")).toBe("2026-06-30T21:00:00.000Z");
    expect(cairoDayStartIso("")).toBe("");
    expect(cairoDayStartIso("not-a-date")).toBe("");
  });

  it("round-trips: the day a user picked is the day shown back", () => {
    expect(toCairoYmd(cairoDayStartIso("2026-11-14"))).toBe("2026-11-14");
  });

  it("the month key flips at Cairo midnight, not UTC midnight", () => {
    // 2026-10-31T22:30Z is already 1 Nov 00:30 in Cairo (UTC+2)
    expect(cairoMonthKey("2026-10-31T22:30:00.000Z")).toBe("2026-11");
    expect(cairoMonthKey("2026-10-31T21:30:00.000Z")).toBe("2026-10");
  });
});

describe("disbursement date payload", () => {
  const { cairoDayStartIsoOrNull, toCairoYmd } = require("./accountsDates");

  it("sends Cairo midnight for a picked day and null for empty/invalid", () => {
    expect(cairoDayStartIsoOrNull("2026-07-01")).toBe("2026-06-30T21:00:00.000Z");
    expect(cairoDayStartIsoOrNull("")).toBeNull();
    expect(cairoDayStartIsoOrNull("nope")).toBeNull();
  });

  it("shows back the same Cairo day that was stored", () => {
    expect(toCairoYmd(cairoDayStartIsoOrNull("2026-11-14"))).toBe("2026-11-14");
  });
});
