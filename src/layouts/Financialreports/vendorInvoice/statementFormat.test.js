import {
  TRANSFER_NOTES, buildDerivedNumber, buildTransfer, cairoDay, cycleNumberOf, fmtLatin, formatIssueDate, formatMonthLabel, statementEquation, statementFromInvoice, statementFromLive,
} from "./statementFormat";
import { HOMIX_BANK_DETAILS } from "./vendorInvoiceConstants";

const invoice = (over = {}) => ({
  id: 1, code: "INV-2026-0007", vendorId: 5, vendorName: "مصنع", billingDay: 13, periodEnd: "2026-11-13T00:00:00.000Z", status: "reviewed",
  statusLabel: "x", ordersCount: 2, vendorDueTotal: 1500, finesTotal: 100, companyDueTotal: 0, adjustmentsTotal: -50, netAmount: 1350,
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

const BANK = { bankName: "CIB", accountHolder: "أحمد علي", accountNumber: "1001", walletNumber: "01011112222", instaPayNumber: "ahmed@instapay" };
const cents = (n) => Math.round(n * 100);
/** المعادلة المطبوعة تُجمع تماماً: بائع − هوميكس − غرامات (+ تعديلات) = الصافي الموقّع */
const expectEquation = (d) => {
  expect(cents(d.vendorDueTotal) - cents(d.companyDueTotal) - cents(d.finesTotal) + cents(d.adjustmentsTotal ?? 0)).toBe(cents(d.net));
  // the printed rows, read with their signs, give |net|
  const rows = statementEquation(d);
  const sum = rows.reduce((t, r) => t + (r.sign === "−" ? -1 : 1) * cents(r.value), 0);
  expect(sum).toBe(cents(Math.abs(d.net)));
};

describe("statement «مستحق هوميكس» counts vendor-delivered lines only", () => {
  it("saved invoice: all warehouse deliveries → 0 total and 0 cells; mixed → only vendorOwes", () => {
    const allWarehouse = statementFromInvoice({ invoice: invoice(), adjustments: [], lines: [line(1, { companyDue: 5000 }), line(2, { companyDue: 6000 })] });
    expect(allWarehouse.companyDueTotal).toBe(0);
    expect(allWarehouse.lines.every((l) => l.companyDue === 0)).toBe(true);
    const mixed = statementFromInvoice({ invoice: invoice(), adjustments: [], lines: [line(1, { companyDue: 5000 }), line(2, { isWarehouseDelivery: false, companyDueKind: "vendorOwes", companyDue: 300 })] });
    expect(mixed.companyDueTotal).toBe(300);
    expect(mixed.lines.map((l) => l.companyDue)).toEqual([0, 300]);
    expect(mixed.vendorDueTotal).toBe(allWarehouse.vendorDueTotal);
    // the extra 300 owed to Homix lowers the net by exactly 300
    expect(allWarehouse.net - mixed.net).toBe(300);
  });
  it("live statement: same rule from the orders themselves", () => {
    const s = { id: "9", name: "baitut", invoice: null, row: { orders: [
      { id: 1, orderNumber: "A", operationNumber: "OP-1", productCode: "", shipmentId: 3, companyDueKind: "margin", companyDue: 5000, vendorDue: 2, fines: 0 },
      { id: 2, orderNumber: "B", operationNumber: "OP-2", productCode: "", shipmentId: null, companyDueKind: "vendorOwes", companyDue: 70, vendorDue: 0, fines: 0 }] } };
    const d = statementFromLive(s, { dueSeller: 2, dueComp: 5070, fine: 0, net: 0, netRequired: 0 }, null);
    expect(d.companyDueTotal).toBe(70);
    expect(d.lines.map((l) => l.companyDue)).toEqual([0, 70]);
    const warehouseOnly = statementFromLive({ ...s, row: { orders: [s.row.orders[0]] } }, { dueSeller: 2, dueComp: 5000, fine: 0, net: 2, netRequired: 2 }, null);
    expect(warehouseOnly.companyDueTotal).toBe(0);
  });
});

describe("statementFromInvoice", () => {
  it("uses the code, counts only included lines, keeps adjustments row, stamps reviewed", () => {
    const d = statementFromInvoice({ invoice: invoice(), adjustments: [], lines: [line(1), line(2), line(3, { state: "removed" })] });
    expect(d.number).toBe("#INV-2026-0007");
    expect(d.lines).toHaveLength(2);
    expect(d.lines[0].operationNumber).toBe("OP-1");
    expect(d.operationsCount).toBe(2);
    // الخطان بتسليم مخزن: لا «مستحق هوميكس» (0 والخلايا صفر ← «—»)
    expect(d.companyDueTotal).toBe(0);
    expect(d.lines.map((l) => l.companyDue)).toEqual([0, 0]);
    expect(d.adjustmentsTotal).toBe(-50);
    // 1500 − 0 − 100 − 50
    expect(d.net).toBe(1350);
    expect(d.netLabel).toBe("صافي المستحق للبائع");
    expect(d.cycleLabel).toBe("دورة 13");
    expect(d.issueDateLabel).toBe("13 نوفمبر 2026");
    expect(d.stampDate).toBe("2026-11-14");
    expectEquation(d);
  });
  it("falls back to derived number, no stamp for draft, no adjustments row when zero, negative net owed to Homix", () => {
    const d = statementFromInvoice({ invoice: invoice({ code: null, status: "draft", vendorDueTotal: 0, finesTotal: 300, adjustmentsTotal: 0, netAmount: -300, dueParty: "homix" }), adjustments: [], lines: [] });
    expect(d.number).toBe("#V5-11-C1");
    expect(d.stampDate).toBeNull();
    expect(d.adjustmentsTotal).toBeNull();
    expect(d.net).toBe(-300);
    expect(d.netDirection).toBe("homix");
    expect(d.netLabel).toBe("صافي المستحق لهوميكس");
    expectEquation(d);
  });
  it("the transferred status label follows the direction of the net", () => {
    const toVendor = statementFromInvoice({ invoice: invoice({ status: "transferred" }), adjustments: [], lines: [line(1)] });
    expect(toVendor.statusLabel).toBe("تم التحويل للبائع");
    const fromVendor = statementFromInvoice({ invoice: invoice({ status: "transferred", vendorDueTotal: 0, finesTotal: 10, adjustmentsTotal: 0 }), adjustments: [], lines: [] });
    expect(fromVendor.statusLabel).toBe("تم استلام التحويل من البائع");
  });
});

describe("printed equation adds up exactly (statementFromLive / statementFromInvoice fixtures)", () => {
  const cycle = { billingDay: 13, referenceDate: "2026-11-13", endDate: "2026-11-13", startDate: null, mode: null };
  const liveSeller = (orders, extra = {}) => ({ id: "3", name: "مورد", invoice: null, row: { orders, ...extra } });
  const o = (id, vendorDue, companyDue, fines, kind) => ({ id, orderNumber: String(id), operationNumber: `OP-${id}`, productCode: "P", shipmentId: kind === "margin" ? id : null, companyDueKind: kind, companyDue, vendorDue, fines });
  const totalsOf = (orders) => ({
    dueSeller: orders.reduce((t, x) => t + x.vendorDue, 0),
    dueComp: orders.filter((x) => x.companyDueKind === "vendorOwes").reduce((t, x) => t + x.companyDue, 0),
    fine: orders.reduce((t, x) => t + x.fines, 0),
    collect: 0, vendorShippingCost: 0,
  });
  const fixtures = {
    "baitut-like all warehouse with fines": [o(1, 1200, 0, 100, "margin"), o(2, 500, 0, 700, "margin"), o(3, 830.5, 0, 12.25, "margin")],
    "mixed": [o(1, 1200, 0, 100, "margin"), o(2, 0, 350, 20, "vendorOwes")],
    "negative net (vendor owes Homix + fines)": [o(1, 0, 350, 50, "vendorOwes")],
    "net zero": [o(1, 100, 0, 0, "margin"), o(2, 0, 100, 0, "vendorOwes")],
    "only fines": [o(1, 0, 0, 40, "vendorOwes")],
  };
  for (const [name, orders] of Object.entries(fixtures)) {
    it(`live (${name}): seller − homix − fines == net, both kinds`, () => {
      const totals = totalsOf(orders);
      for (const kind of ["vendor", "seller"]) {
        const d = statementFromLive(liveSeller(orders), totals, cycle, kind);
        expectEquation(d);
      }
    });
  }
  it("all-warehouse with fines: net = Σcost − fines and the box lists seller − homix − fines", () => {
    const orders = fixtures["baitut-like all warehouse with fines"];
    const d = statementFromLive(liveSeller(orders), totalsOf(orders), cycle);
    expect(d.net).toBe(2530.5 - 812.25);
    expect(statementEquation(d).map((r) => [r.label, r.sign])).toEqual([["مستحق البائع (إجمالي)", ""], ["مستحق هوميكس", "−"], ["الغرامات", "−"]]);
  });
  it("negative net reorders the box: homix + fines − seller (gross)", () => {
    const orders = fixtures["negative net (vendor owes Homix + fines)"];
    const d = statementFromLive(liveSeller(orders), totalsOf(orders), cycle);
    expect(d.net).toBe(-400);
    expect(statementEquation(d).map((r) => [r.label, r.sign])).toEqual([["مستحق هوميكس", ""], ["الغرامات", "+"], ["مستحق البائع (إجمالي)", "−"]]);
    expectEquation(d);
  });
  it("saved invoices with adjustments (both directions) keep the equation exact", () => {
    for (const adj of [-50, 25, 0]) {
      const d = statementFromInvoice({ invoice: invoice({ vendorDueTotal: 0, finesTotal: 70, adjustmentsTotal: adj }), adjustments: [], lines: [line(1, { isWarehouseDelivery: false, companyDueKind: "vendorOwes", companyDue: 300 })] });
      expect(d.net).toBeLessThan(0);
      expectEquation(d);
    }
  });
});

describe("transfer block by the sign of the net", () => {
  it("net > 0: vendor's bank block with the vendor name, its bank data and the transfer note", () => {
    const t = buildTransfer(500, "مصنع النور", BANK);
    expect(t.kind).toBe("vendor");
    expect(t.title).toBe("بيانات حساب البائع — مصنع النور");
    expect(t.rows).toEqual([["البنك", "CIB"], ["رقم الحساب", "1001"], ["اسم الحساب", "أحمد علي"], ["المحفظة", "01011112222"], ["InstaPay", "ahmed@instapay"]]);
    expect(t.note).toBe("سيتم تحويل الصافي المستحق للبائع على الحساب الموضح وفق دورة السداد.");
  });
  it("net > 0 without vendor bank data: the «لم تُسجَّل» note, no rows", () => {
    for (const bank of [null, { bankName: null, accountHolder: null, accountNumber: null, walletNumber: null, instaPayNumber: null }]) {
      const t = buildTransfer(500, "مصنع", bank);
      expect(t.kind).toBe("vendor");
      expect(t.rows).toEqual([]);
      expect(t.note).toBe("لم تُسجَّل بيانات بنكية لهذا البائع بعد.");
    }
  });
  it("net > 0 and the caller may not see vendor bank data (undefined): no block at all", () => {
    expect(buildTransfer(500, "مصنع", undefined).kind).toBe("none");
  });
  it("net < 0: Homix bank details and the receipt note, never the vendor's data", () => {
    const t = buildTransfer(-1, "مصنع", BANK);
    expect(t.kind).toBe("homix");
    expect(t.title).toBe("بيانات التحويل البنكي — هوميكس");
    expect(t.rows).toEqual([["البنك", HOMIX_BANK_DETAILS.bank], ["رقم الحساب", HOMIX_BANK_DETAILS.accountNumber], ["اسم الحساب", HOMIX_BANK_DETAILS.accountName], ["InstaPay", HOMIX_BANK_DETAILS.instapay]]);
    expect(t.note).toBe("يُرجى تحويل الصافي المستحق لهوميكس وإرسال صورة إيصال التحويل.");
    expect(JSON.stringify(t)).not.toContain("1001");
    expect(TRANSFER_NOTES.homix).toBe(t.note);
  });
  it("net == 0: no bank block", () => {
    expect(buildTransfer(0, "مصنع", BANK)).toEqual({ kind: "none", title: "", rows: [], note: "" });
    expect(buildTransfer(0.004, "مصنع", BANK).kind).toBe("none");
  });
  it("statements pick the block from their own net and bank source", () => {
    const toVendor = statementFromInvoice({ invoice: invoice(), adjustments: [], lines: [line(1)], vendorBank: BANK });
    expect(toVendor.transfer.kind).toBe("vendor");
    expect(toVendor.transfer.title).toContain("مصنع");
    const toHomix = statementFromInvoice({ invoice: invoice({ vendorDueTotal: 0, finesTotal: 5, adjustmentsTotal: 0 }), adjustments: [], lines: [], vendorBank: BANK });
    expect(toHomix.transfer.kind).toBe("homix");
    const settled = statementFromInvoice({ invoice: invoice({ vendorDueTotal: 0, finesTotal: 0, adjustmentsTotal: 0 }), adjustments: [], lines: [], vendorBank: BANK });
    expect(settled.transfer.kind).toBe("none");
    const live = statementFromLive({ id: "1", name: "بائع", invoice: null, row: { vendorBank: null, orders: [] } }, { dueSeller: 90, dueComp: 0, fine: 0 }, null);
    expect(live.transfer.note).toBe("لم تُسجَّل بيانات بنكية لهذا البائع بعد.");
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
    expect(d.netLabel).toBe("لا يوجد مستحق");
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

  it("seller kind: same design, #S number, seller title, signed net from the printed figures, collection/shipping extra rows", () => {
    const t = { dueSeller: 700, dueComp: 40, fine: 10, netRequired: 123, collect: 1000, vendorShippingCost: 90 };
    const orders = [{ id: 1, orderNumber: "A", operationNumber: "OP-1", productCode: "", shipmentId: null, companyDueKind: "vendorOwes", companyDue: 40, vendorDue: 700, fines: 10 }];
    const s = { ...seller, id: "4", invoice: null, row: { orders } };
    const d = statementFromLive(s, t, { billingDay: 28, referenceDate: "2026-11-28", endDate: "2026-11-28", startDate: null, mode: null }, "seller");
    expect(d.number).toBe("#S4-11-C2");
    expect(d.title).toBe("كشف تسوية بائع");
    expect(d.net).toBe(650);
    expect(d.vendorDueTotal).toBe(700);
    expect(d.extraTotals).toEqual([{ label: "إجمالي التحصيل", value: 1000 }, { label: "إجمالي شحن البائع", value: 90 }]);
    const v = statementFromLive(s, t, null);
    expect(v.title).toBe("كشف تسوية مورد");
    expect(v.extraTotals).toEqual([]);
    expect(v.net).toBe(650);
    expectEquation(d);
  });
});
