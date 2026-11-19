import fs from "fs";
import path from "path";
import { companyDueKindOf, sumCompanyDue, COMPANY_DUE_LABEL, COMPANY_DUE_TIP } from "./companyDue";
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

  it("sums the company due of counted invoice lines only", () => {
    expect(sumCompanyDue([
      { companyDue: 100, state: "included" },
      { companyDue: 40, state: "included" },
      { companyDue: 999, state: "frozen" },
      { companyDue: 7 },
    ])).toBe(147);
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

  const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
  const extract = (text, from, to) => text.slice(text.indexOf(from), text.indexOf(to));
  const inOrder = (text, items) => {
    let at = -1;
    items.forEach((item) => {
      const next = text.indexOf(item, at + 1);
      expect(`${item}:${next > at}`).toBe(`${item}:true`);
      at = next;
    });
  };

  it("never uses the old labels / totalCombined in the Financial Reports sources", () => {
    expect(sources.length).toBeGreaterThan(20);
    const forbidden = ["totalCombined", "هامش هوميكس", "مستحق على الصانع", "الإجمالي الكلي", "المستحق للشركة", "مستحق الشركة"];
    sources.forEach((file) => {
      const text = fs.readFileSync(file, "utf8");
      forbidden.forEach((word) => expect(`${path.basename(file)}:${word}:${text.includes(word)}`).toBe(`${path.basename(file)}:${word}:false`));
    });
  });

  it("uses one company column named «المستحق لهوميكس» with the agreed tooltip", () => {
    expect(COMPANY_DUE_LABEL).toBe("المستحق لهوميكس");
    expect(COMPANY_DUE_TIP).toBe("ما تستحقه هوميكس = التحصيل − التكلفة (تسليمات المخزن)، أو ما يسدّده الصانع لهوميكس (تسليمات البائع)");
  });

  it("comprehensive tab: main row, detail table (6 columns) and footer lists", () => {
    const text = read("components/tabs/ComprehensiveTab.tsx");
    inOrder(extract(text, "header={[", "renderCells={renderCells}"), ['"الصانع"', '"عدد الطلبات"', '"المستحق للبائع"', "COMPANY_DUE_LABEL", '"الغرامات"']);
    inOrder(extract(text, "columns={[", "rows={"), ['"رقم العملية"', '"رقم الطلب"', '"كود المنتج"', '"المستحق للبائع"', "COMPANY_DUE_LABEL", '"الغرامات"']);
    expect(extract(text, "columns={[", "rows={").match(/label:/g)).toHaveLength(6);
    inOrder(extract(text, "<ComprehensiveSummary", "note={COMPREHENSIVE_NOTE}"), ['"عدد الطلبات"', '"إجمالي مستحق البائع"', '"إجمالي المستحق لهوميكس"', '"إجمالي الغرامات"']);
  });

  it("seller tab, archive dialog, prints and invoiced orders use the same single column", () => {
    ["components/tabs/SellerTab.tsx", "invoices/InvoiceDetailDialog.tsx", "invoices/InvoicedOrdersView.tsx", "vendorInvoice/SellerSettlementInvoiceDocument.tsx"]
      .forEach((file) => expect(`${file}:${read(file).includes("COMPANY_DUE_LABEL")}`).toBe(`${file}:true`));
  });

  it("the vendor settlement statement (live + saved adapters) prints the agreed literal «مستحق هوميكس»", () => {
    expect(read("vendorInvoice/SettlementStatement.tsx")).toContain("مستحق هوميكس");
    ["invoices/InvoiceDocument.tsx", "vendorInvoice/VendorSettlementInvoiceDocument.tsx"]
      .forEach((file) => expect(`${file}:${read(file).includes("SettlementStatement")}`).toBe(`${file}:true`));
  });
});
