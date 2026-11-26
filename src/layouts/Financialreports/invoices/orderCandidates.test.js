import { candidateReasonLabel, candidateStatusLabel, cycleLabelOf } from "./orderCandidates";

describe("candidateReasonLabel", () => {
  it("available orders have no reason", () => expect(candidateReasonLabel({ available: true })).toBeNull());
  it("already invoiced names the invoice and its cycle", () => {
    expect(candidateReasonLabel({ available: false, reason: "already_invoiced", invoice: { id: 1, code: "INV-2026-0001", status: "reviewed", lineState: "included", periodEnd: "2026-11-13T21:59:59.999Z" } }))
      .toBe("موجود في الفاتورة INV-2026-0001 (دورة ١٣ نوفمبر) — افتحها لنقله");
  });
  it("already invoiced without a valid period still reads fine", () => {
    expect(candidateReasonLabel({ available: false, reason: "already_invoiced", invoice: { id: 4, code: null, status: "draft", lineState: "frozen", periodEnd: null } }))
      .toBe("موجود في الفاتورة #4 — افتحها لنقله");
  });
  it("delivery reasons", () => {
    expect(candidateReasonLabel({ available: false, reason: "order_not_delivered" })).toBe("الطلب لسه ما اتسلّمش");
    expect(candidateReasonLabel({ available: false, reason: "shipment_not_delivered" })).toBe("شحنة الطلب مش متسلّمة (توصيل هوميكس)");
  });
});

describe("helpers", () => {
  it("cycle label uses the Cairo date", () => expect(cycleLabelOf("2026-10-27T20:59:59.999Z")).toBe("دورة ٢٧ أكتوبر"));
  it("bad date gives empty", () => expect(cycleLabelOf("nope")).toBe(""));
  it("status labels", () => { expect(candidateStatusLabel(5)).toBe("مسلّم"); expect(candidateStatusLabel(2)).toBe("قيد التنفيذ"); });
});
