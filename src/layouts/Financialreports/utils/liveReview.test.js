import { liveInvoiceChipMeta, reviewButtonState, reviewAllToast, CYCLE_OPEN_TOOLTIP } from "./liveReview";

const base = { canSettle: true, isVendor: false, cycleState: "billing", invoicesState: "ready", cycleOpen: false };

describe("liveInvoiceChipMeta", () => {
  it("shows one wording for no invoice and draft", () => {
    expect(liveInvoiceChipMeta(null).label).toBe("لم تُراجع");
    expect(liveInvoiceChipMeta(undefined).label).toBe("لم تُراجع");
    expect(liveInvoiceChipMeta("draft").label).toBe("لم تُراجع");
    expect(liveInvoiceChipMeta("draft").tooltip).not.toBe(liveInvoiceChipMeta(null).tooltip);
  });
  it("keeps later states", () => {
    expect(liveInvoiceChipMeta("reviewed").label).toBe("تمت المراجعة");
    expect(liveInvoiceChipMeta("transferred").label).toBe("تم التحويل");
    expect(liveInvoiceChipMeta("frozen").label).toBe("مجمّدة");
  });
});

describe("reviewButtonState", () => {
  it("is visible and enabled once the cycle ended and nothing is reviewed", () => {
    expect(reviewButtonState({ ...base })).toEqual({ visible: true, disabled: false, tooltip: "" });
    expect(reviewButtonState({ ...base, invoiceStatus: "draft" }).visible).toBe(true);
  });
  it("is disabled with the tooltip while the cycle is open", () => {
    expect(reviewButtonState({ ...base, cycleOpen: true })).toEqual({ visible: true, disabled: true, tooltip: CYCLE_OPEN_TOOLTIP });
  });
  it("hides after review, for vendors, without permission, and outside billing cycles", () => {
    ["reviewed", "frozen", "transferred"].forEach((invoiceStatus) => expect(reviewButtonState({ ...base, invoiceStatus }).visible).toBe(false));
    expect(reviewButtonState({ ...base, isVendor: true }).visible).toBe(false);
    expect(reviewButtonState({ ...base, canSettle: false }).visible).toBe(false);
    expect(reviewButtonState({ ...base, cycleState: "custom" }).visible).toBe(false);
    expect(reviewButtonState({ ...base, invoicesState: "loading" }).visible).toBe(false);
  });
});

describe("reviewAllToast", () => {
  it("summarises success, already reviewed and per-vendor failures", () => {
    expect(reviewAllToast({ succeeded: 0, failed: 0, results: [] }).message).toMatch(/لا توجد/);
    const ok = reviewAllToast({ succeeded: 2, failed: 0, results: [{ vendorId: 1, ok: true }, { vendorId: 2, ok: true, alreadyReviewed: true }] });
    expect(ok.type).toBe("success");
    expect(ok.message).toContain("تمت مراجعة 1");
    expect(ok.message).toContain("1 كانت مُراجعة");
    const bad = reviewAllToast({ succeeded: 1, failed: 1, results: [{ vendorId: 1, ok: true }, { vendorId: 7, ok: false, error: "فارغة" }] });
    expect(bad.type).toBe("error");
    expect(bad.message).toContain("صانع 7: فارغة");
  });
});
