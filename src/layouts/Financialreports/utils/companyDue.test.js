import fs from "fs";
import path from "path";
import { companyDueKindOf, splitCompanyDue, MARGIN_LABEL, OWES_LABEL } from "./companyDue";
import { overlayKpis, overlaySections } from "./liveOverlay";
import { sellerTotals } from "./calc";

const order = (orderId, o = {}) => ({
  collectionTotal: 2299, companyDue: 1099, companyDueKind: "margin", fines: 100, id: orderId, operationNumber: `OP-${orderId}`, orderId, orderNumber: String(orderId),
  paymentStatus: 1, paymentStatusLabel: "", productCode: "A", productId: 1, shipmentId: orderId, vendorDue: 1100, vendorShippingCost: 0, warehouseCost: 1200, ...o,
});
const vendorOrder = (orderId, o = {}) => order(orderId, { companyDue: 300, companyDueKind: "vendorOwes", shipmentId: null, vendorDue: 0, ...o });
const seller = (orders) => ({
  id: "5", name: "ركة", cat: "", color: "", initials: "ر",
  row: {
    vendorId: 5, vendorName: "ركة", ordersCount: orders.length, warehouseCost: 0, collectionTotal: 0, fines: 0,
    vendorDue: orders.reduce((t, x) => t + x.vendorDue, 0), companyDue: orders.reduce((t, x) => t + x.companyDue, 0),
    homixMargin: orders.filter((x) => x.companyDueKind === "margin").reduce((t, x) => t + x.companyDue, 0),
    vendorOwes: orders.filter((x) => x.companyDueKind === "vendorOwes").reduce((t, x) => t + x.companyDue, 0), orders,
  },
});
const invoice = { id: 1, vendorId: 5, code: null, status: "draft", statusLabel: "معلّقة", adjustmentsTotal: 0, netAmount: 0 };

describe("company due kinds", () => {
  it("uses the BE kind, with a delivery-type fallback for reports without one", () => {
    expect(companyDueKindOf({ companyDueKind: "vendorOwes", shipmentId: 3 })).toBe("vendorOwes");
    expect(companyDueKindOf({ shipmentId: 3 })).toBe("margin");
    expect(companyDueKindOf({ shipmentId: null })).toBe("vendorOwes");
  });

  it("sellerTotals carries the two totals separately and the sum stays the company due", () => {
    const t = sellerTotals(seller([order(1), vendorOrder(2)]));
    expect(t).toMatchObject({ dueComp: 1399, homixMargin: 1099, vendorOwes: 300 });
    expect(t).not.toHaveProperty("totalCombined");
  });

  it("an override on a company due keeps its kind; totals and KPIs follow the kind", () => {
    const base = { warehouse: [], seller: [], comprehensive: [seller([order(1), vendorOrder(2)])] };
    const line = { id: 11, invoiceId: 1, vendorId: 5, orderId: 2, outsideCycle: false, state: "included", companyDueKind: "vendorOwes", companyDue: 50, companyDueOverride: 50,
      collectionTotal: 0, warehouseCost: 0, vendorDue: 0, fines: 100, isWarehouseDelivery: false, vendorShippingCost: 0, paymentStatus: 1, paymentStatusLabel: "", operationNumber: "OP-2", orderNumber: "2", productCode: "A" };
    const out = overlaySections(base, { invoices: [invoice], lines: [line], includedOrderIds: { 1: [1, 2] } }, false);
    expect(out.comprehensive[0].row).toMatchObject({ homixMargin: 1099, vendorOwes: 50, companyDue: 1149 });
    const kpis = { sellersCount: 1, totalSales: 4598, totalDueSeller: 1100, totalDueComp: 1399, totalHomixMargin: 1099, totalVendorOwes: 300, totalFine: 200, ordersCount: 2, lateSellersCount: 1, dueSellerPct: 0, dueCompPct: 0 };
    expect(overlayKpis(kpis, base.comprehensive, out.comprehensive)).toMatchObject({ totalHomixMargin: 1099, totalVendorOwes: 50, totalDueComp: 1149 });
  });

  it("splits invoice lines by stored kind (counted lines only)", () => {
    expect(splitCompanyDue([
      { companyDue: 100, companyDueKind: "margin", state: "included" },
      { companyDue: 40, companyDueKind: "vendorOwes", state: "included" },
      { companyDue: 999, companyDueKind: "margin", state: "frozen" },
      { companyDue: 7, isWarehouseDelivery: true },
    ])).toEqual({ homixMargin: 107, vendorOwes: 40 });
  });
});

describe("no combined total anywhere in the Financial Reports sources", () => {
  const root = path.resolve(__dirname, "..");
  const sources = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) sources.push(full);
  });
  walk(root);

  it("never uses totalCombined / «الإجمالي الكلي» / the ambiguous «المستحق للشركة» label", () => {
    expect(sources.length).toBeGreaterThan(20);
    sources.forEach((file) => {
      const text = fs.readFileSync(file, "utf8");
      expect(`${path.basename(file)}:${text.includes("totalCombined")}`).toBe(`${path.basename(file)}:false`);
      expect(`${path.basename(file)}:${text.includes("الإجمالي الكلي")}`).toBe(`${path.basename(file)}:false`);
      expect(`${path.basename(file)}:${/المستحق للشركة|مستحق الشركة/.test(text.replace("هامش هوميكس / مستحق على الصانع", ""))}`).toBe(`${path.basename(file)}:false`);
    });
  });

  it("the comprehensive footer lists the agreed items only", () => {
    const text = fs.readFileSync(path.join(root, "components/tabs/ComprehensiveTab.tsx"), "utf8");
    const footer = text.slice(text.indexOf("<ComprehensiveSummary"), text.indexOf("note={COMPREHENSIVE_NOTE}"));
    ["عدد الطلبات", "إجمالي مستحق البائع", "MARGIN_LABEL", "OWES_LABEL", "إجمالي الغرامات"].forEach((item) => expect(footer).toContain(item));
    expect(MARGIN_LABEL).toBe("هامش هوميكس");
    expect(OWES_LABEL).toBe("مستحق على الصانع");
  });
});
