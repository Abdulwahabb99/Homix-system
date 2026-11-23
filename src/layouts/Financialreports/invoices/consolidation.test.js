import { mergeBlockReason, mergeFailureMessage, previewMerge, sourceLabelOf } from "./consolidation";

const inv = (over = {}) => ({ status: "reviewed", kind: "standard", mergeable: true, hasReceipt: false, transferredAt: null, mergedIntoId: null, netAmount: 0, periodEnd: "2026-10-13T21:59:59.999Z", ...over });

describe("previewMerge: the combined signed net offsets opposite balances", () => {
  it("Homix owes the vendor 900 in one cycle, the vendor owes Homix 300 in another: +600 to the vendor", () => {
    const preview = previewMerge([inv({ netAmount: 900 }), inv({ netAmount: -300 })]);
    expect(preview).toMatchObject({ count: 2, net: 600, direction: "vendor", bank: "vendor", label: "صافي المستحق للبائع" });
  });
  it("the vendor owes more than he is owed: negative net, Homix account", () => {
    expect(previewMerge([inv({ netAmount: 100 }), inv({ netAmount: -350.5 })])).toMatchObject({ net: -250.5, direction: "homix", bank: "homix", label: "صافي المستحق لهوميكس" });
  });
  it("exact offset: settled, no bank block", () => {
    expect(previewMerge([inv({ netAmount: 100.1 }), inv({ netAmount: -100.1 })])).toMatchObject({ net: 0, direction: "settled", bank: "none", label: "لا يوجد مستحق" });
  });
  it("rounds to piasters and reports the latest cycle", () => {
    const preview = previewMerge([inv({ netAmount: 0.1, periodEnd: "2026-09-28T21:59:59.999Z" }), inv({ netAmount: 0.2, periodEnd: "2026-10-28T21:59:59.999Z" })]);
    expect(preview.net).toBe(0.3);
    expect(preview.latestPeriodEnd).toBe("2026-10-28T21:59:59.999Z");
  });
});

describe("mergeBlockReason (mirrors the server rules)", () => {
  it("draft and reviewed standard invoices are mergeable", () => {
    expect(mergeBlockReason(inv({ status: "draft" }))).toBeNull();
    expect(mergeBlockReason(inv())).toBeNull();
  });
  it("frozen, transferred, receipt, transfer data, already merged, consolidated are refused with a reason", () => {
    expect(mergeBlockReason(inv({ status: "frozen" }))).toMatch(/معلّقة/);
    expect(mergeBlockReason(inv({ status: "transferred" }))).toMatch(/معلّقة/);
    expect(mergeBlockReason(inv({ hasReceipt: true }))).toMatch(/إيصال/);
    expect(mergeBlockReason(inv({ transferredAt: "2026-11-01T00:00:00Z" }))).toMatch(/تحويل/);
    expect(mergeBlockReason(inv({ status: "consolidated", mergedIntoId: 3 }))).toMatch(/مدمجة/);
    expect(mergeBlockReason(inv({ kind: "consolidated" }))).toMatch(/شاملة/);
    expect(mergeBlockReason(inv({ mergeable: false }))).toBeTruthy();
  });
});

describe("labels", () => {
  it("source label: code, cycle, month", () => {
    expect(sourceLabelOf({ code: "INV-2026-0005", billingDay: 13, month: "2026-10" })).toBe("INV-2026-0005 — دورة 13 — أكتوبر 2026");
    expect(sourceLabelOf({ code: null, billingDay: 28, month: "2026-11" })).toBe("دورة 28 — نوفمبر 2026");
    expect(sourceLabelOf(undefined, "شاملة")).toBe("شاملة");
  });
  it("merge failure message names the skipped receipts", () => {
    expect(mergeFailureMessage([], 3)).toBe("");
    expect(mergeFailureMessage(["a.pdf"], 2)).toBe("تعذّر دمج الإيصال: a.pdf — تم دمج الباقي");
    expect(mergeFailureMessage(["a.pdf", "b.png"], 1)).toBe("تعذّر دمج الإيصالات: a.pdf، b.png — تم دمج الباقي");
    expect(mergeFailureMessage(["a.pdf"], 0)).toBe("تعذّر دمج الإيصالات (a.pdf) — نزّلنا الفاتورة وحدها");
  });
});
