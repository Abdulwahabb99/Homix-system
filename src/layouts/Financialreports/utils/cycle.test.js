import { currentMonthCairo, cycleRange, formatCycleRange, getCycleLabel, monthPickerValue, pastMonthFromPicker } from "./cycle";

describe("cycleRange (mirrors the backend resolveFinancialCycleRange)", () => {
  it("billing day 13 = 29th of the previous month to the 13th", () => {
    expect(cycleRange(13, "2026-11")).toEqual({ startDate: "2026-10-29", endDate: "2026-11-13" });
  });
  it("billing day 28 = 14th to the 28th of the same month", () => {
    expect(cycleRange(28, "2026-11")).toEqual({ startDate: "2026-11-14", endDate: "2026-11-28" });
  });
  it("crosses the year and clamps the 29th in February", () => {
    expect(cycleRange(13, "2026-01")).toEqual({ startDate: "2025-12-29", endDate: "2026-01-13" });
    expect(cycleRange(13, "2026-03")).toEqual({ startDate: "2026-02-28", endDate: "2026-03-13" });
    expect(cycleRange(13, "2028-03")).toEqual({ startDate: "2028-02-29", endDate: "2028-03-13" });
  });
});

describe("current month defaults", () => {
  it("uses the Cairo calendar, not UTC (22:30 UTC on the 31st is already the 1st in Cairo)", () => {
    expect(currentMonthCairo(new Date("2026-10-31T22:30:00Z"))).toBe("2026-11");
    expect(currentMonthCairo(new Date("2026-11-15T10:00:00Z"))).toBe("2026-11");
  });
  it("the picker shows the current month by default and a past month when chosen", () => {
    const now = new Date("2026-11-15T10:00:00Z");
    expect(monthPickerValue("", now)).toBe("2026-11");
    expect(monthPickerValue("2026-09", now)).toBe("2026-09");
  });
  it("choosing the current month returns to the live cycle (no reference), other months are past cycles", () => {
    const now = new Date("2026-11-15T10:00:00Z");
    expect(pastMonthFromPicker("2026-11", now)).toBe("");
    expect(pastMonthFromPicker("2026-09", now)).toBe("2026-09");
  });
});

describe("labels", () => {
  it("labels the cycle and formats its range in Arabic", () => {
    expect(getCycleLabel(13)).toBe("دورة 13");
    expect(getCycleLabel(28)).toBe("دورة 28");
    expect(formatCycleRange({ startDate: "2026-10-29", endDate: "2026-11-13" })).toBe("٢٩ أكتوبر — ١٣ نوفمبر ٢٠٢٦");
  });
});
