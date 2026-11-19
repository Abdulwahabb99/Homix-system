import fs from "fs";
import path from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CONT_ROWS_TOP, FIRST_ROWS_TOP, FOOTER_H, PAGE_H, ROW_H, SAFETY, bottomBlockHeight, planPages } from "./statementPagination";
import SettlementStatement from "./SettlementStatement";
import { STATEMENT_PDF_OPTIONS } from "../../Orders/utils/invoicePdf";

jest.mock("html2pdf.js", () => jest.fn());

const LIMIT = PAGE_H - FOOTER_H - SAFETY;

describe("planPages", () => {
  it("small statements are exactly one page (no blank first page, no orphan footer)", () => {
    [0, 1, 2, 3, 4].forEach((n) => expect(planPages(n, 6, true)).toEqual([expect.objectContaining({ rows: n, hasBottom: true })]));
  });

  it("every page fits the A4 content area; rows add up; only the last page carries the totals block", () => {
    for (const stamp of [true, false]) {
      for (const totalRows of [3, 4, 6]) {
        for (let n = 0; n <= 150; n += 1) {
          const plans = planPages(n, totalRows, stamp);
          expect(plans.reduce((t, p) => t + p.rows, 0)).toBe(n);
          plans.forEach((p, i) => {
            expect(p.rows).toBeGreaterThanOrEqual(0);
            expect(p.hasBottom).toBe(i === plans.length - 1);
            const top = i === 0 ? FIRST_ROWS_TOP : CONT_ROWS_TOP;
            const used = top + p.rows * ROW_H + (p.hasBottom ? bottomBlockHeight(totalRows, p.stampMode) : 0);
            expect(used).toBeLessThanOrEqual(LIMIT);
            if (!p.hasBottom) expect(p.rows).toBeGreaterThan(0);
          });
        }
      }
    }
  });

  it("capacity: the owner's 9-row seller statement and up to 10 rows fit one page; stamped ones fall back to the beside layout", () => {
    // 5 totals rows (seller: 3 + collection + shipping), no stamp
    [3, 9, 10].forEach((n) => expect(planPages(n, 5, false)).toHaveLength(1));
    expect(planPages(11, 5, false)).toHaveLength(2);
    // stamped: approved "below" layout while it fits, then "beside" (under the bank box), then a new page
    expect(planPages(3, 5, true)[0].stampMode).toBe("below");
    expect(planPages(8, 5, true)).toEqual([expect.objectContaining({ rows: 8, stampMode: "beside" })]);
    expect(planPages(9, 5, true)).toHaveLength(2);
  });

  it("page count never decreases as lines are added", () => {
    let last = 1;
    for (let n = 0; n <= 150; n += 1) {
      const count = planPages(n, 6, true).length;
      expect(count).toBeGreaterThanOrEqual(last);
      last = count;
    }
  });
});

describe("page geometry guards (html2pdf blank-page regression)", () => {
  const css = fs.readFileSync(path.join(__dirname, "SettlementStatement.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("page height is fixed and never an exact multiple of html2pdf's 1122px page (else a whole blank page is inserted)", () => {
    const block = css.slice(css.indexOf(".page {"), css.indexOf("}", css.indexOf(".page {")));
    expect(block).toContain(`height: ${PAGE_H}px`);
    expect(block).not.toMatch(/min-height/);
    expect(PAGE_H % 1122).not.toBe(0);
    expect(PAGE_H).toBeLessThan(1122);
    expect(block).toContain("break-after: page");
  });

  it("statement PDFs use css page-break mode only (avoid-all pushed the tall root to page 2)", () => {
    expect(STATEMENT_PDF_OPTIONS.pagebreakMode).toEqual(["css"]);
  });

  it("renders one .page element per planned page", () => {
    const base = {
      title: "t", extraTotals: [], number: "#V1-11-C1", cycleLabel: "", monthLabel: "", issueDateLabel: "", status: "open", statusLabel: "مفتوحة", overdue: false,
      vendorName: "x", ordersCount: 0, operationsCount: 0, vendorDueTotal: 0, companyDueTotal: 0, finesTotal: 0, adjustmentsTotal: null, net: 0, netOwedToHomix: false, stampDate: null,
    };
    for (const n of [0, 3, 9, 20, 40]) {
      const lines = Array.from({ length: n }, (_, i) => ({ key: i, operationNumber: `OP-${i}`, orderNumber: String(i), productCode: "", homixDelivery: false, companyDue: 0, vendorDue: 1, fines: 0 }));
      const html = renderToStaticMarkup(<SettlementStatement data={{ ...base, lines }} />);
      expect((html.match(/class="page"/g) || []).length).toBe(planPages(n, 3, false).length);
      expect((html.match(/<footer/g) || []).length).toBe(planPages(n, 3, false).length);
    }
  });
});
