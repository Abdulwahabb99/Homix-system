import { forPrint, liveEditState, overlayKpis, overlaySections } from "./liveOverlay";

const order = (orderId, o = {}) => ({
  collectionTotal: 1000, companyDue: 200, fines: 0, id: orderId, operationNumber: `OP-${orderId}`, orderId, orderNumber: String(orderId),
  paymentStatus: 1, paymentStatusLabel: "", productCode: "A", productId: 1, shipmentId: null, vendorDue: 800, vendorShippingCost: 0, warehouseCost: 600, ...o,
});
const seller = (orders, vendorId = 5) => ({
  id: String(vendorId), name: "ركة", cat: "", color: "", initials: "ر",
  row: {
    vendorId, vendorName: "ركة", ordersCount: orders.length, warehouseCost: 600 * orders.length, collectionTotal: 1000 * orders.length,
    fines: orders.reduce((t, x) => t + x.fines, 0), vendorDue: orders.reduce((t, x) => t + x.vendorDue, 0), companyDue: 200 * orders.length, orders,
  },
});
const sections = (orders, vendorId) => ({ warehouse: [seller(orders, vendorId)], seller: [seller(orders, vendorId)], comprehensive: [seller(orders, vendorId)] });
const invoice = (o = {}) => ({ id: 1, vendorId: 5, code: null, status: "draft", statusLabel: "معلّقة", adjustmentsTotal: 0, netAmount: 0, ...o });
const line = (o = {}) => ({
  id: 11, invoiceId: 1, vendorId: 5, orderId: 100, outsideCycle: false, state: "included", operationNumber: "OP-100", orderNumber: "100", productCode: "A",
  paymentStatus: 1, paymentStatusLabel: "", isWarehouseDelivery: false, collectionTotal: 1000, warehouseCost: 600, vendorShippingCost: 0,
  fines: 0, vendorDue: 800, companyDue: 200, finesOverride: null, vendorDueOverride: null, companyDueOverride: null, ...o,
});
const overview = (o = {}) => ({ invoices: [invoice()], lines: [], includedOrderIds: { 1: [100, 101] }, ...o });

describe("overlaySections", () => {
  it("returns the live report untouched when there is no overview", () => {
    const s = sections([order(100)]);
    expect(overlaySections(s, undefined, false)).toBe(s);
  });

  it("marks a vendor without an invoice as not issued and keeps its numbers", () => {
    const out = overlaySections(sections([order(100)], 7), overview(), false);
    expect(out.comprehensive[0].invoice).toBeNull();
    expect(out.comprehensive[0].row.vendorDue).toBe(800);
  });

  it("keeps untouched included orders as-is (BE totals preserved) and attaches the invoice ref", () => {
    const base = sections([order(100), order(101)]);
    const out = overlaySections(base, overview(), false);
    expect(out.comprehensive[0].invoice.status).toBe("draft");
    expect(out.comprehensive[0].row).toBe(base.comprehensive[0].row);
  });

  it("shows the overridden numbers and recomputes the vendor totals from what is displayed", () => {
    const out = overlaySections(
      sections([order(100), order(101)]),
      overview({ lines: [line({ finesOverride: 100, fines: 100, vendorDue: 700, overrideReason: "تأخير" })] }),
      false,
    );
    const row = out.comprehensive[0].row;
    expect(row.orders[0]).toMatchObject({ fines: 100, vendorDue: 700 });
    expect(row.orders[0].invoiceLine).toMatchObject({ lineId: 11, finesOverride: 100, reason: "تأخير" });
    expect(row.fines).toBe(100);
    expect(row.vendorDue).toBe(1500);
    expect(row.ordersCount).toBe(2);
  });

  it("excludes uncounted orders from totals for staff (flagged) and hides them from vendors", () => {
    const ov = overview({ lines: [line({ state: "frozen", stateReason: "مراجعة" })] });
    const staff = overlaySections(sections([order(100), order(101)]), ov, false).comprehensive[0].row;
    expect(staff.orders).toHaveLength(2);
    expect(staff.orders[0].invoiceLine.state).toBe("frozen");
    expect(staff.ordersCount).toBe(1);
    expect(staff.vendorDue).toBe(800);
    const vendor = overlaySections(sections([order(100), order(101)]), ov, true).comprehensive[0].row;
    expect(vendor.orders.map((o) => o.orderId)).toEqual([101]);
    expect(vendor.ordersCount).toBe(1);
  });

  it("treats an order with no line on an existing invoice as not counted (missing)", () => {
    const row = overlaySections(sections([order(100), order(102)]), overview(), false).comprehensive[0].row;
    expect(row.orders[1].invoiceLine.state).toBe("missing");
    expect(row.ordersCount).toBe(1);
  });

  it("appends counted lines whose order is outside the cycle, only to the matching tab", () => {
    const extra = line({ id: 12, orderId: 300, outsideCycle: true, isWarehouseDelivery: true, warehouseCost: 500, vendorDue: 400, companyDue: 100 });
    const out = overlaySections(sections([order(100)]), overview({ lines: [extra], includedOrderIds: { 1: [100, 300] } }), false);
    expect(out.warehouse[0].row.orders.map((o) => o.orderId)).toEqual([100, 300]);
    expect(out.comprehensive[0].row.orders.map((o) => o.orderId)).toEqual([100, 300]);
    expect(out.seller[0].row.orders.map((o) => o.orderId)).toEqual([100]);
    expect(out.warehouse[0].row.warehouseCost).toBe(1100);
  });
});

describe("overlayKpis", () => {
  it("applies the before/after difference of the comprehensive totals", () => {
    const before = sections([order(100), order(101)]).comprehensive;
    const after = overlaySections(sections([order(100), order(101)]), overview({ lines: [line({ finesOverride: 100, fines: 100, vendorDue: 700 })] }), false).comprehensive;
    const kpis = { sellersCount: 1, totalSales: 2000, totalDueSeller: 1600, totalDueComp: 400, totalFine: 0, ordersCount: 2, lateSellersCount: 0, dueSellerPct: 80, dueCompPct: 20 };
    expect(overlayKpis(kpis, before, after)).toMatchObject({ totalFine: 100, totalDueSeller: 1500, ordersCount: 2, lateSellersCount: 1, dueSellerPct: 75 });
    expect(overlayKpis(kpis, before, before)).toBe(kpis);
  });
});

describe("forPrint", () => {
  it("drops uncounted orders and recomputes the totals for the invoice document", () => {
    const [s] = overlaySections(sections([order(100), order(101)]), overview({ lines: [line({ state: "deferred" })] }), false).comprehensive;
    const printed = forPrint(s);
    expect(printed.row.orders.map((o) => o.orderId)).toEqual([101]);
    expect(printed.row.vendorDue).toBe(800);
  });
});

describe("liveEditState", () => {
  const base = { canSettle: true, isVendor: false, cycleState: "billing", invoicesState: "ready" };
  const withInvoice = (inv, orderState = "included") => ({ ...seller([order(100)]), invoice: inv, orderState });
  const o = (state) => order(100, { invoiceLine: state ? { state } : undefined });

  it("is read-only without a reason for vendors and users without finance_settle", () => {
    expect(liveEditState(withInvoice(null), o(), { ...base, isVendor: true })).toEqual({ editable: false });
    expect(liveEditState(withInvoice(null), o(), { ...base, canSettle: false })).toEqual({ editable: false });
  });

  it("an open (current) cycle is editable like any billing cycle; a custom range is not", () => {
    expect(liveEditState(withInvoice(invoice()), o("included"), { ...base, cycleOpen: true })).toEqual({ editable: true });
    expect(liveEditState(withInvoice(null), o(), { ...base, cycleState: "custom" }).editable).toBe(false);
  });

  it("does not allow editing before the invoice status is known", () => {
    expect(liveEditState(withInvoice(null), o(), { ...base, invoicesState: "loading" }).editable).toBe(false);
    expect(liveEditState(withInvoice(null), o(), { ...base, invoicesState: "error" }).editable).toBe(false);
  });

  it("allows the first edit when the cycle is closed and no invoice exists yet (it is auto-generated)", () => {
    expect(liveEditState(withInvoice(null), o(), base)).toEqual({ editable: true });
  });

  it("allows a draft, locks every other status with the explanation", () => {
    expect(liveEditState(withInvoice(invoice()), o("included"), base)).toEqual({ editable: true });
    expect(liveEditState(withInvoice(invoice({ status: "reviewed", statusLabel: "تمت المراجعة" })), o("included"), base))
      .toEqual({ editable: false, reason: "الفاتورة تمت مراجعتها — استرجعها لمسودة للتعديل" });
    for (const status of ["frozen", "transferred"]) {
      expect(liveEditState(withInvoice(invoice({ status, statusLabel: "x" })), o("included"), base).editable).toBe(false);
    }
  });

  it("does not allow editing an order that is not counted on the draft", () => {
    expect(liveEditState(withInvoice(invoice()), o("frozen"), base)).toEqual({ editable: false, reason: "الطلب غير محسوب في الفاتورة" });
  });
});

describe("invariants: warehouse tab net == invoice vendor due (cost based)", () => {
  const { sellerTotals } = require("./calc");
  const { isCostMissing } = require("./liveOverlay");
  // Homix-delivered orders as the BE now reports them: vendorDue = max(0, cost - fines), companyDue = collection - cost
  const homix = (id, cost, fines, collection) => order(id, {
    collectionTotal: collection, companyDue: collection - cost, fines, shipmentId: id, vendorDue: Math.max(cost - fines, 0), warehouseCost: cost,
  });
  const orders = () => [homix(1, 1200, 100, 2299), homix(2, 500, 800, 900), homix(3, 0, 0, 400)];

  it("client example: 1,200 cost - 100 fines = 1,100 on both the warehouse tab and the invoice", () => {
    const s = seller([homix(1, 1200, 100, 2299)]);
    expect(sellerTotals(s).netRequired).toBe(1100);
    expect(s.row.vendorDue).toBe(1100);
  });

  it("holds per order (fines above cost never go negative) with no overrides", () => {
    const base = sections(orders());
    const out = overlaySections(base, overview({ includedOrderIds: { 1: [1, 2, 3] } }), false);
    expect(sellerTotals(out.warehouse[0]).netRequired).toBe(1100);
    expect(out.warehouse[0].row.vendorDue).toBe(out.comprehensive[0].row.vendorDue);
  });

  it("still holds after a fines override and a cost override coming from the invoice", () => {
    const ov = overview({
      includedOrderIds: { 1: [1, 2, 3] },
      lines: [
        line({ id: 11, orderId: 1, finesOverride: 0, fines: 0, vendorDue: 1200, collectionTotal: 2299 }),
        line({ id: 12, orderId: 2, warehouseCostOverride: 1000, warehouseCost: 1000, vendorDue: 200, collectionTotal: 900, companyDue: -100 }),
      ],
    });
    const out = overlaySections(sections(orders()), ov, false);
    const w = out.warehouse[0];
    expect(w.row.orders.map((o) => o.warehouseCost)).toEqual([1200, 1000, 0]);
    expect(sellerTotals(w).netRequired).toBe(1400);
    expect(w.row.vendorDue).toBe(out.comprehensive[0].row.vendorDue);
    expect(w.row.warehouseCost).toBe(2200);
  });

  it("flags orders whose cost is not recorded", () => {
    expect(isCostMissing({ warehouseCost: 0 })).toBe(true);
    expect(isCostMissing({ warehouseCost: 1200 })).toBe(false);
  });
});
