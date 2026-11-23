import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SettlementStatement from "./SettlementStatement";
import { isGroupRow, isSpacerRow, statementFromInvoice } from "./statementFormat";
import { avoidOrphanGroupHeaders, planPages } from "./statementPagination";

jest.mock("html2pdf.js", () => jest.fn());

const SOURCES = [
  { id: 1, code: "INV-2026-0001", billingDay: 13, month: "2026-10", netAmount: -300, dueParty: "homix", ordersCount: 1, status: "reviewed", periodEnd: "2026-10-13T21:59:59.999Z", periodStart: null },
  { id: 2, code: "INV-2026-0002", billingDay: 28, month: "2026-10", netAmount: 900, dueParty: "vendor", ordersCount: 2, status: "draft", periodEnd: "2026-10-28T21:59:59.999Z", periodStart: null },
];
const invoice = (over = {}) => ({
  id: 100, code: "INV-2026-0002-ALL", kind: "consolidated", vendorId: 5, vendorName: "مصنع النور", billingDay: 28, periodEnd: "2026-10-28T21:59:59.999Z", status: "draft",
  statusLabel: "x", ordersCount: 3, vendorDueTotal: 1000, finesTotal: 100, companyDueTotal: 300, adjustmentsTotal: 0, netAmount: 600, dueParty: "vendor", reviewedAt: null, isOverdue: false, ...over,
});
const line = (id, sourceInvoiceId, over = {}) => ({ id, orderId: id, operationNumber: `OP-${id}`, orderNumber: String(id), productCode: "P", isWarehouseDelivery: true, companyDue: 0, vendorDue: 0, fines: 0, state: "included", sourceInvoiceId, ...over });

describe("statement of a consolidated invoice", () => {
  const detail = {
    invoice: invoice(), adjustments: [], sources: SOURCES,
    lines: [line(21, 2, { vendorDue: 1000, fines: 100 }), line(11, 1, { isWarehouseDelivery: false, companyDueKind: "vendorOwes", companyDue: 300 }), line(99, null, { vendorDue: 0 })],
  };

  it("groups the lines under one header per source invoice (in cycle order), extra lines last", () => {
    const data = statementFromInvoice(detail);
    expect(data.title).toBe("كشف تسوية شاملة");
    expect(data.cycleLabel).toBe("شاملة (2 فواتير)");
    const layout = data.lines.map((row) => (isGroupRow(row) ? `H:${row.key}` : row.key));
    expect(layout).toEqual(["H:group-1", 11, "H:group-2", 21, "H:group-extra", 99]);
    const headers = data.lines.filter(isGroupRow);
    expect(headers[0].label).toBe("INV-2026-0001 — دورة 13 — أكتوبر 2026");
    expect(headers[0].sub).toContain("مستحق لهوميكس");
    expect(headers[1].sub).toContain("مستحق للبائع");
  });

  it("totals and the signed net follow the existing model (offsets across cycles)", () => {
    const data = statementFromInvoice(detail);
    expect(data.net).toBe(600); // 1000 − 300 − 100
    expect(data.netDirection).toBe("vendor");
    expect(data.vendorDueTotal).toBe(1000);
    expect(data.companyDueTotal).toBe(300);
    expect(data.transfer.kind).toBe("none"); // no vendorBank for this caller
  });

  it("a normal invoice is untouched (no headers)", () => {
    const data = statementFromInvoice({ ...detail, invoice: invoice({ kind: "standard" }), sources: undefined, lines: [line(1, null, { vendorDue: 5 })] });
    expect(data.title).toBe("كشف تسوية مورد");
    expect(data.lines.every((row) => !isGroupRow(row))).toBe(true);
  });

  it("renders sources as sub-headers and the source net inside the printed statement", () => {
    const out = renderToStaticMarkup(<SettlementStatement data={statementFromInvoice(detail)} />);
    expect(out).toContain("كشف تسوية شاملة");
    expect(out).toContain("INV-2026-0001 — دورة 13 — أكتوبر 2026");
    expect(out).toContain("INV-2026-0002 — دورة 28 — أكتوبر 2026");
    expect(out).toContain("أُضيفت على الفاتورة الشاملة");
    expect(out).toContain("صافي الفاتورة: 300 ج.م — مستحق لهوميكس");
  });
});

describe("pagination with group headers keeps the one-page rules", () => {
  const rowsOf = (groups, perGroup) => Array.from({ length: groups }, (_, g) => g).flatMap((g) => [{ group: true, key: `g${g}` }, ...Array.from({ length: perGroup }, (_, i) => ({ key: `${g}-${i}` }))]);
  const run = (rows, totalRows = 5, stamp = true) => avoidOrphanGroupHeaders(rows, (r) => Boolean(r.group), (i) => ({ spacer: true, key: `s${i}` }), (n) => planPages(n, totalRows, stamp));

  it("never leaves a header as the last row of a non-final page, and rows still add up to the plan", () => {
    for (const perGroup of [1, 3, 5, 9, 12]) {
      for (const groups of [1, 2, 3, 6]) {
        const { rows, plans } = run(rowsOf(groups, perGroup));
        expect(plans.reduce((sum, p) => sum + p.rows, 0)).toBe(rows.length);
        let cursor = 0;
        plans.forEach((plan, index) => {
          cursor += plan.rows;
          if (index < plans.length - 1 && plan.rows > 0) expect(Boolean(rows[cursor - 1].group)).toBe(false);
        });
        expect(plans.filter((p) => p.hasBottom)).toHaveLength(1);
      }
    }
  });

  it("only inserts spacers when needed, and never touches a single page", () => {
    const small = run(rowsOf(2, 2));
    expect(small.rows.some(isSpacerRow)).toBe(false);
    expect(small.plans).toHaveLength(1);
  });

  it("every printed page of a long consolidated statement holds at most the planned rows", () => {
    const lines = Array.from({ length: 60 }, (_, i) => line(i + 1, i % 2 ? 1 : 2, { vendorDue: 10 }));
    const out = renderToStaticMarkup(<SettlementStatement data={statementFromInvoice({ ...{ invoice: invoice({ ordersCount: 60 }), adjustments: [], vendorBank: null, sources: SOURCES }, lines })} />);
    const pages = out.split('class="page"').slice(1);
    expect(pages.length).toBeGreaterThan(1);
    pages.forEach((page) => expect((page.match(/<tr class="row/g) ?? []).length).toBeLessThanOrEqual(25));
  });
});
