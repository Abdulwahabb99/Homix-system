import { fixesFor, issuesBadgeCount, LOCKED_FIX_TEXT } from "./invoiceIssues";

describe("issuesBadgeCount", () => {
  it("is the total of errors and warnings, null while unknown", () => {
    expect(issuesBadgeCount({ counts: { errors: 2, warnings: 3, total: 5 } })).toBe(5);
    expect(issuesBadgeCount({ counts: { errors: 0, warnings: 0, total: 0 } })).toBe(0);
    expect(issuesBadgeCount(undefined)).toBeNull();
    expect(issuesBadgeCount({})).toBeNull();
  });
});

describe("fixesFor", () => {
  const kinds = (issue, occurrence) => fixesFor(issue, occurrence).map((fix) => fix.kind);
  it("a draft line offers open + remove (and refresh for changed orders)", () => {
    expect(kinds({ type: "dup_in_invoice" }, { invoiceStatus: "draft", lineId: 5 })).toEqual(["open", "remove"]);
    expect(kinds({ type: "order_changed" }, { invoiceStatus: "draft", lineId: 5 })).toEqual(["open", "remove", "refresh"]);
  });
  it("net drift is an invoice-level issue: refresh only", () => {
    expect(kinds({ type: "net_drift" }, { invoiceStatus: "draft", lineId: null })).toEqual(["open", "refresh"]);
  });
  it("reviewed / frozen / transferred invoices show the locked hint instead of a fix button", () => {
    for (const invoiceStatus of ["reviewed", "frozen", "transferred"]) {
      const fixes = fixesFor({ type: "cross_vendor" }, { invoiceStatus, lineId: 5 });
      expect(fixes.map((fix) => fix.kind)).toEqual(["open", "locked"]);
      expect(fixes[1].label).toBe(LOCKED_FIX_TEXT);
      expect(LOCKED_FIX_TEXT).toBe("رجوع لمعلّقة أولًا");
    }
  });
});
