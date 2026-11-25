import {
  ARCHIVE_STATUSES, DEFAULT_FILTERS, chipCounts, isFiltered, monthLabel, parseArchiveFilters, statusesForChip, toListParams, writeArchiveFilters,
} from "./archiveFilters";

const parse = (qs, isVendor = false) => parseArchiveFilters(new URLSearchParams(qs), isVendor);
const opts = { isVendor: false, pageSize: 25 };

describe("archive filters ↔ URL", () => {
  it("empty URL gives the defaults (both directions, all chip, page 1)", () => {
    expect(parse("")).toEqual(DEFAULT_FILTERS);
    expect(isFiltered(DEFAULT_FILTERS)).toBe(false);
  });

  it("round-trips every filter and writes only non-defaults, keeping foreign keys like view", () => {
    const filters = {
      ...DEFAULT_FILTERS, month: "2026-10", cycle: "13", direction: "homix", search: "ركة_1", chip: "open", vendorId: "7", receipt: "missing",
      invoiceFrom: "2026-10-01", invoiceTo: "2026-10-31", transferredFrom: "2026-10-02", transferredTo: "2026-10-03", overdue: true, page: 3,
    };
    const written = writeArchiveFilters(new URLSearchParams("view=archive"), filters);
    expect(written.get("view")).toBe("archive");
    expect(parseArchiveFilters(written)).toEqual(filters);
    const cleared = writeArchiveFilters(written, DEFAULT_FILTERS);
    expect([...cleared.keys()]).toEqual(["view"]);
  });

  it("ignores malformed URL values instead of sending them to the API", () => {
    const f = parse("month=2026-13&cycle=14&dir=x&chip=zzz&vendor=abc&from=2026/10/01&page=-2&receipt=bad");
    expect(f).toEqual(DEFAULT_FILTERS);
  });

  it("a vendor can never carry a vendor filter or the overdue flag from the URL", () => {
    const f = parse("vendor=9&overdue=1&q=x", true);
    expect(f.vendorId).toBe("");
    expect(f.overdue).toBe(false);
    expect(f.search).toBe("x");
    expect(toListParams({ ...DEFAULT_FILTERS, vendorId: "9" }, { isVendor: true, pageSize: 25 }).vendorId).toBeUndefined();
  });

  it("isFiltered ignores the page but sees any other change", () => {
    expect(isFiltered({ ...DEFAULT_FILTERS, page: 4 })).toBe(false);
    expect(isFiltered({ ...DEFAULT_FILTERS, direction: "vendor" })).toBe(true);
    expect(isFiltered({ ...DEFAULT_FILTERS, chip: "paid" })).toBe(true);
  });
});

describe("archive filters → API params", () => {
  it("defaults request all archive statuses and no other filter (both = no dueParty)", () => {
    expect(toListParams(DEFAULT_FILTERS, opts)).toEqual({
      status: ["reviewed", "frozen", "transferred"], kind: undefined, month: undefined, billingDay: undefined, dueParty: undefined, search: undefined,
      vendorId: undefined, receipt: undefined, invoiceFrom: undefined, invoiceTo: undefined, transferredFrom: undefined, transferredTo: undefined,
      overdue: undefined, page: 1, size: 25,
    });
  });

  it("chips: مفتوحة = reviewed+frozen, مسددة = transferred, الشاملة = kind consolidated incl. drafts; drafts never in the archive", () => {
    expect(statusesForChip("open")).toEqual(["reviewed", "frozen"]);
    expect(statusesForChip("paid")).toEqual(["transferred"]);
    expect(statusesForChip("all")).toEqual(ARCHIVE_STATUSES);
    expect(ARCHIVE_STATUSES).not.toContain("draft");
    const consolidated = toListParams({ ...DEFAULT_FILTERS, chip: "consolidated" }, opts);
    expect(consolidated.kind).toBe("consolidated");
    expect(consolidated.status).toContain("draft");
  });

  it("maps month, cycle, direction and a trimmed search, and combines with pagination", () => {
    const p = toListParams({ ...DEFAULT_FILTERS, month: "2026-10", cycle: "28", direction: "vendor", search: "  INV_1 ", vendorId: "4", page: 2 }, opts);
    expect(p).toMatchObject({ month: "2026-10", billingDay: 28, dueParty: "vendor", search: "INV_1", vendorId: 4, page: 2, size: 25 });
    expect(toListParams({ ...DEFAULT_FILTERS, search: "   " }, opts).search).toBeUndefined();
  });
});

describe("chip counts and labels", () => {
  it("sums the filtered counts per chip and tolerates a missing payload", () => {
    expect(chipCounts({ reviewed: 2, frozen: 1, transferred: 5, draft: 9 })).toEqual({ all: 8, open: 3, paid: 5 });
    expect(chipCounts(undefined)).toEqual({ all: 0, open: 0, paid: 0 });
  });

  it("month label is Arabic with Arabic-Indic year; unknown input falls back", () => {
    expect(monthLabel("2026-10")).toBe("أكتوبر ٢٠٢٦");
    expect(monthLabel("2026-01")).toBe("يناير ٢٠٢٦");
    expect(monthLabel("junk")).toBe("junk");
  });
});
