import { netDirectionOf, netLabelOf, netToneOf, transferredLabelOf } from "./netDirection";
import { orderNet, rowNet, sellerTotals, signedMoney } from "./calc";
import { overlayKpis } from "./liveOverlay";

describe("net direction (signed net)", () => {
  it("> 0 → للبائع (green), < 0 → لهوميكس (red), 0 → no due (grey/default)", () => {
    expect([netDirectionOf(1), netDirectionOf(-1), netDirectionOf(0), netDirectionOf(0.004)]).toEqual(["vendor", "homix", "settled", "settled"]);
    expect([netLabelOf(5), netLabelOf(-5), netLabelOf(0)]).toEqual(["صافي المستحق للبائع", "صافي المستحق لهوميكس", "لا يوجد مستحق"]);
    expect([netToneOf(5), netToneOf(-5), netToneOf(0)]).toEqual(["green", "red", "default"]);
    expect([transferredLabelOf(5), transferredLabelOf(-5), transferredLabelOf(0)]).toEqual(["تم التحويل للبائع", "تم استلام التحويل من البائع", "تم التحويل"]);
  });
});

describe("net maths (reference model)", () => {
  const row = (o) => ({ vendorDue: 0, companyDue: 0, fines: 0, ...o });
  it("rowNet = vendorDue − companyDue − fines, may be negative", () => {
    expect(rowNet(row({ vendorDue: 1700, fines: 800 }))).toBe(900);
    expect(rowNet(row({ companyDue: 350, fines: 50 }))).toBe(-400);
    expect(rowNet(row({ vendorDue: 100, companyDue: 100 }))).toBe(0);
    expect(rowNet(row({ vendorDue: 0.1, fines: 0.3 }))).toBe(-0.2);
  });
  it("orderNet ignores company due on Homix deliveries (kind margin / shipment)", () => {
    expect(orderNet({ vendorDue: 1200, companyDue: 999, fines: 100, companyDueKind: "margin", shipmentId: 3 })).toBe(1100);
    expect(orderNet({ vendorDue: 0, companyDue: 350, fines: 50, companyDueKind: "vendorOwes", shipmentId: null })).toBe(-400);
  });
  it("sellerTotals exposes the signed net (and the legacy netRequired alias)", () => {
    const t = sellerTotals({ row: { orders: [], ordersCount: 2, warehouseCost: 0, collectionTotal: 0, fines: 50, vendorDue: 0, companyDue: 350, homixMargin: 0, vendorOwes: 350 } });
    expect(t.net).toBe(-400);
    expect(t.netRequired).toBe(-400);
  });
  it("signedMoney prefixes a minus for negatives only", () => {
    expect(signedMoney(-400)).toContain("−");
    expect(signedMoney(400)).not.toContain("−");
  });
});

describe("overlayKpis moves the signed total net by the same delta as the rows", () => {
  const kpis = { sellersCount: 1, totalSales: 1000, totalDueSeller: 800, totalDueComp: 0, totalHomixMargin: 0, totalVendorOwes: 0, totalFine: 100, totalNet: 700, ordersCount: 1, lateSellersCount: 1, dueSellerPct: 0, dueCompPct: 0 };
  const sellerWith = (vendorDue, companyDue, fines) => ({ row: { vendorDue, companyDue, fines, collectionTotal: 1000, homixMargin: 0, vendorOwes: companyDue, ordersCount: 1 } });
  it("a fines override (100 → 250) lowers the net by 150", () => {
    const out = overlayKpis(kpis, [sellerWith(800, 0, 100)], [sellerWith(800, 0, 250)]);
    expect(out.totalNet).toBe(550);
    expect(out.totalFine).toBe(250);
  });
  it("can flip negative when the vendor owes Homix", () => {
    const out = overlayKpis(kpis, [sellerWith(800, 0, 100)], [sellerWith(0, 900, 100)]);
    expect(out.totalNet).toBe(-1000 + 0);
  });
});
