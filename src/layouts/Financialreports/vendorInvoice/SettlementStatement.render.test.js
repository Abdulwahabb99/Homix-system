import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SettlementStatement from "./SettlementStatement";
import { statementFromInvoice } from "./statementFormat";

jest.mock("html2pdf.js", () => jest.fn());

const BANK = { bankName: "CIB", accountHolder: "أحمد علي", accountNumber: "1001", walletNumber: null, instaPayNumber: "ahmed@instapay" };
const invoice = (over = {}) => ({
  id: 1, code: "INV-2026-0007", vendorId: 5, vendorName: "مصنع النور", billingDay: 13, periodEnd: "2026-11-13T00:00:00.000Z", status: "reviewed",
  statusLabel: "x", ordersCount: 1, vendorDueTotal: 0, finesTotal: 0, companyDueTotal: 0, adjustmentsTotal: 0, netAmount: 0, dueParty: null,
  reviewedAt: "2026-11-14T10:00:00.000Z", isOverdue: false, ...over,
});
const line = (over = {}) => ({ id: 1, orderId: 1, operationNumber: "OP-1", orderNumber: "1", productCode: "P", isWarehouseDelivery: true, companyDue: 0, vendorDue: 0, fines: 0, state: "included", ...over });
const html = (detail) => renderToStaticMarkup(<SettlementStatement data={statementFromInvoice(detail)} />);

describe("SettlementStatement transfer block and equation", () => {
  it("net > 0: vendor's bank block (name, data, note); gross total row first, then − homix, − fines", () => {
    const out = html({ invoice: invoice({ vendorDueTotal: 1000, finesTotal: 100, netAmount: 900 }), adjustments: [], lines: [line({ vendorDue: 1000, fines: 100 })], vendorBank: BANK });
    expect(out).toContain("بيانات حساب البائع — مصنع النور");
    expect(out).toContain("1001");
    expect(out).toContain("ahmed@instapay");
    expect(out).toContain("سيتم تحويل الصافي المستحق للبائع على الحساب الموضح وفق دورة السداد.");
    expect(out).not.toContain("بيانات التحويل البنكي — هوميكس");
    expect(out).toContain("صافي المستحق للبائع");
    expect(out.indexOf("مستحق البائع (إجمالي)")).toBeLessThan(out.indexOf("مستحق هوميكس</span><span"));
  });

  it("net > 0 and no vendor bank data: the missing-data note", () => {
    const out = html({ invoice: invoice({ vendorDueTotal: 1000, netAmount: 1000 }), adjustments: [], lines: [line({ vendorDue: 1000 })], vendorBank: null });
    expect(out).toContain("بيانات حساب البائع — مصنع النور");
    expect(out).toContain("لم تُسجَّل بيانات بنكية لهذا البائع بعد.");
  });

  it("net < 0: Homix bank block + receipt note, label «لهوميكس», reordered rows (homix + fines − seller)", () => {
    const out = html({ invoice: invoice({ finesTotal: 50, netAmount: -400 }), adjustments: [], lines: [line({ isWarehouseDelivery: false, companyDueKind: "vendorOwes", companyDue: 350, fines: 50 })], vendorBank: BANK });
    expect(out).toContain("بيانات التحويل البنكي — هوميكس");
    expect(out).toContain("يُرجى تحويل الصافي المستحق لهوميكس وإرسال صورة إيصال التحويل.");
    expect(out).not.toContain("1001");
    expect(out).toContain("صافي المستحق لهوميكس");
    const rows = out.match(/data-eq="(\w+)"/g);
    expect(rows).toEqual(['data-eq="company"', 'data-eq="fines"', 'data-eq="vendor"']);
  });

  it("net == 0: no bank block at all and the neutral label", () => {
    const out = html({ invoice: invoice(), adjustments: [], lines: [line()], vendorBank: BANK });
    expect(out).not.toContain("بيانات حساب البائع");
    expect(out).not.toContain("بيانات التحويل البنكي");
    expect(out).toContain("لا يوجد مستحق");
  });

  it("a caller that may not see vendor bank data (undefined) gets no block when the net is owed to the vendor", () => {
    const out = html({ invoice: invoice({ vendorDueTotal: 1000, netAmount: 1000 }), adjustments: [], lines: [line({ vendorDue: 1000 })] });
    expect(out).not.toContain("بيانات حساب البائع");
    expect(out).not.toContain("1001");
  });
});
