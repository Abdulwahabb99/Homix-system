import { apiErrorMessage, serializeParams } from "./financialInvoices";
import { buildFinancialReportQuery } from "./financialReport";

describe("financial invoice query helpers", () => {
  it("serializes params, dropping empty values and joining arrays", () => {
    expect(serializeParams({ status: ["draft", "reviewed"], search: "", page: 2, vendorId: undefined, overdue: true }))
      .toBe("status=draft%2Creviewed&page=2&overdue=true");
  });

  it("surfaces the API message for failed mutations", () => {
    expect(apiErrorMessage({ response: { data: { message: "الفاتورة مقفلة" } } })).toBe("الفاتورة مقفلة");
    expect(apiErrorMessage(new Error("x"), "fallback")).toBe("fallback");
  });

  it("sends a custom range only when both ends are set", () => {
    expect(buildFinancialReportQuery(28, undefined, { startDate: "2026-10-01", endDate: "2026-10-10" }))
      .toBe("billingDay=28&startDate=2026-10-01&endDate=2026-10-10");
    expect(buildFinancialReportQuery(28, "2026-10-20", { startDate: "2026-10-01", endDate: "" })).toBe("billingDay=28&referenceDate=2026-10-20");
  });
});
