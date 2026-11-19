import {
  buildDerivedNumber, cairoDay, cycleNumberOf, fmtLatin, formatIssueDate, formatMonthLabel, statementFromInvoice, statementFromLive,
} from "./statementFormat";

const invoice = (over = {}) => ({
  id: 1, code: "INV-2026-0007", vendorId: 5, vendorName: "مصنع", billingDay: 13, periodEnd: "2026-11-13T00:00:00.000Z", status: "reviewed",
  statusLabel: "x", ordersCount: 2, vendorDueTotal: 1500, finesTotal: 100, companyDueTotal: 0, adjustmentsTotal: -50, netAmount: 1450,
  dueParty: "vendor", reviewedAt: "2026-11-14T10:00:00.000Z", isOverdue: false, ...over,
});
const line = (id, over = {}) => ({ id, orderId: id, operationNumber: "", orderNumber: String(100 + id), productCode: "P", isWarehouseDelivery: true,
  companyDue: 10, vendorDue: 20, fines: 0, state: "included", ...over });

describe("formatting", () => {
  it("latin digits with grouping, rounded", () => {
    expect(fmtLatin(16999.4)).toBe("16,999");
    expect(fmtLatin(null)).toBe("0");
  });
  it("dates and labels", () => {
    expect(cairoDay("2026-11-15")).toBe("2026-11-15");
    expect(cairoDay("2026-11-14T23:30:00.000Z")).toBe("2026-11-15");
    expect(cairoDay("bad")).toBeNull();
    expect(formatIssueDate("2026-11-15")).toBe("15 نوفمبر 2026");
    expect(formatMonthLabel("2026-11-15")).toBe("نوفمبر 2026");
    expect(formatIssueDate(null)).toBe("—");
  });
  it("derived number and cycle number", () => {
    expect(cycleNumberOf(13)).toBe("1");
    expect(cycleNumberOf(28)).toBe("2");
    expect(buildDerivedNumber("", "2026-11-15", 13)).toBe("#V-11-C1");
    expect(buildDerivedNumber(7, null, 28)).toBe("#V7----C2");
  });
});

describe("statementFromInvoice", () => {
  it("uses the code, counts only included lines, keeps adjustments row, stamps reviewed", () => {
    const d = statementFromInvoice({ invoice: invoice(), adjustments: [], lines: [line(1), line(2), line(3, { state: "removed" })] });
    expect(d.number).toBe("#INV-2026-0007");
    expect(d.lines).toHaveLength(2);
    expect(d.lines[0].operationNumber).toBe("OP-1");
    expect(d.operationsCount).toBe(2);
    expect(d.companyDueTotal).toBe(20);
    expect(d.adjustmentsTotal).toBe(-50);
    expect(d.net).toBe(1450);
    expect(d.cycleLabel).toBe("دورة 13");
    expect(d.issueDateLabel).toBe("13 نوفمبر 2026");
    expect(d.stampDate).toBe("2026-11-14");
  });
  it("falls back to derived number, no stamp for draft, no adjustments row when zero, net owed to homix", () => {
    const d = statementFromInvoice({ invoice: invoice({ code: null, status: "draft", adjustmentsTotal: 0, netAmount: -300, dueParty: "homix" }), adjustments: [], lines: [] });
    expect(d.number).toBe("#V5-11-C1");
    expect(d.stampDate).toBeNull();
    expect(d.adjustmentsTotal).toBeNull();
    expect(d.net).toBe(300);
    expect(d.netOwedToHomix).toBe(true);
  });
});

describe("statementFromLive", () => {
  const seller = { id: "", name: "", invoice: null, row: { orders: [] } };
  const totals = { dueSeller: 0, dueComp: 0, fine: 0, netRequired: 0 };
  it("reproduces the reference sample header", () => {
    const d = statementFromLive(seller, totals, { billingDay: 15, referenceDate: "2026-11-15", endDate: "2026-11-15", startDate: null, mode: null });
    expect(d.number).toBe("#V-11-C-");
    expect(d.cycleLabel).toBe("دورة 15");
    expect(d.monthLabel).toBe("نوفمبر 2026");
    expect(d.issueDateLabel).toBe("15 نوفمبر 2026");
    expect(d.statusLabel).toBe("مفتوحة");
    expect(d.vendorName).toBe("—");
    expect(d.stampDate).toBeNull();
  });
  it("maps delivery from shipmentId and stamps when an invoice is reviewed", () => {
    const s = { ...seller, id: "9", invoice: { status: "transferred" }, row: { orders: [
      { id: 1, orderNumber: "A", operationNumber: "OP-1", productCode: "", shipmentId: 3, companyDue: 1, vendorDue: 2, fines: 0 },
      { id: 2, orderNumber: "A", operationNumber: "OP-1", productCode: "", shipmentId: null, companyDue: 1, vendorDue: 2, fines: 0 }] } };
    const d = statementFromLive(s, totals, { billingDay: 13, referenceDate: "2026-11-13", endDate: "2026-11-13", startDate: null, mode: null });
    expect(d.number).toBe("#V9-11-C1");
    expect(d.lines.map((l) => l.homixDelivery)).toEqual([true, false]);
    expect(d.ordersCount).toBe(1);
    expect(d.stampDate).toBe("2026-11-13");
  });

  it("seller kind: same design, #S number, seller title, net = المستحق للبائع, collection/shipping extra rows", () => {
    const t = { dueSeller: 700, dueComp: 40, fine: 10, netRequired: 123, collect: 1000, vendorShippingCost: 90 };
    const s = { ...seller, id: "4", invoice: null };
    const d = statementFromLive(s, t, { billingDay: 28, referenceDate: "2026-11-28", endDate: "2026-11-28", startDate: null, mode: null }, "seller");
    expect(d.number).toBe("#S4-11-C2");
    expect(d.title).toBe("كشف تسوية بائع");
    expect(d.net).toBe(700);
    expect(d.vendorDueTotal).toBe(700);
    expect(d.extraTotals).toEqual([{ label: "إجمالي التحصيل", value: 1000 }, { label: "إجمالي شحن البائع", value: 90 }]);
    const v = statementFromLive(s, t, null);
    expect(v.title).toBe("كشف تسوية مورد");
    expect(v.extraTotals).toEqual([]);
    expect(v.net).toBe(123);
  });
});
