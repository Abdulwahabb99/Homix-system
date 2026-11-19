import {
  formatRegressionChange,
  getRegressionAwareErrorMessage,
  getRegressionToastMessage,
  isRegressionConflict,
  isRegressionForbidden,
  parseRegressionConflict,
  withConfirmRegression,
} from "./regressionConfirm";

const body409 = {
  code: "REGRESSION_NEEDS_CONFIRMATION",
  status: false,
  message: "رجوع",
  details: {
    regressions: [
      {
        orderId: 7,
        orderNumber: "A-7",
        reasons: ["r"],
        reasonLabels: ["رجوع بالحالة"],
        changes: [
          { field: "status", fieldLabel: "حالة الطلب", from: 3, fromLabel: "تم", to: 1, toLabel: "جديد", origin: "explicit" },
        ],
      },
    ],
  },
};
const err = (status, data) => ({ response: { status, data } });

describe("parseRegressionConflict", () => {
  it("parses a 409 REGRESSION_NEEDS_CONFIRMATION body", () => {
    const c = parseRegressionConflict(err(409, body409));
    expect(c?.message).toBe("رجوع");
    expect(c?.regressions[0].orderNumber).toBe("A-7");
    expect(c?.regressions[0].changes).toHaveLength(1);
  });
  it("returns null for other statuses, codes or non-axios errors", () => {
    expect(parseRegressionConflict(err(403, { ...body409, code: "REGRESSION_FORBIDDEN" }))).toBeNull();
    expect(parseRegressionConflict(err(409, { code: "OTHER" }))).toBeNull();
    expect(parseRegressionConflict(new Error("x"))).toBeNull();
    expect(parseRegressionConflict(undefined)).toBeNull();
  });
  it("tolerates missing details", () => {
    const c = parseRegressionConflict(err(409, { code: "REGRESSION_NEEDS_CONFIRMATION" }));
    expect(c?.regressions).toEqual([]);
  });
});

describe("helpers", () => {
  it("detects the vendor 403", () => {
    expect(isRegressionForbidden(err(403, { code: "REGRESSION_FORBIDDEN" }))).toBe(true);
    expect(isRegressionForbidden(err(409, { code: "REGRESSION_FORBIDDEN" }))).toBe(false);
  });
  it("formats «field: from ← to» with raw fallback", () => {
    expect(formatRegressionChange(body409.details.regressions[0].changes[0])).toBe("حالة الطلب: تم ← جديد");
    expect(formatRegressionChange({ field: "x", fieldLabel: "", from: 2, to: null })).toBe("x: 2 ← —");
  });
  it("prefers the API message", () => {
    expect(getRegressionAwareErrorMessage(err(403, { message: "ممنوع" }), "f")).toBe("ممنوع");
  });
});

describe("withConfirmRegression (retry payload)", () => {
  it("leaves the first attempt untouched", () => {
    const b = { status: 1 };
    expect(withConfirmRegression(b, false)).toBe(b);
  });
  it("adds top-level confirmRegression on single edits and keeps the rest", () => {
    expect(withConfirmRegression({ status: 1 }, true)).toEqual({ status: 1, confirmRegression: true });
  });
  it("adds it at the top level of bulk bodies, not inside orderData", () => {
    const out = withConfirmRegression({ orderIds: [1, 2], orderData: { status: 1 } }, true);
    expect(out.confirmRegression).toBe(true);
    expect(out.orderData).toEqual({ status: 1 });
  });
});

describe("isRegressionConflict / getRegressionToastMessage", () => {
  const conflict = { response: { status: 409, data: body409 } };
  const forbidden = { response: { status: 403, data: { code: "REGRESSION_FORBIDDEN", message: "غير مسموح" } } };
  const other = { response: { status: 500, data: { message: "x" } } };

  it("detects only the 409 confirmation conflict", () => {
    expect(isRegressionConflict(conflict)).toBe(true);
    expect(isRegressionConflict(forbidden)).toBe(false);
    expect(isRegressionConflict(other)).toBe(false);
  });

  it("is silent on 409, shows API Arabic message on 403, fallback otherwise", () => {
    expect(getRegressionToastMessage(conflict, "fb")).toBeNull();
    expect(getRegressionToastMessage(forbidden, "fb")).toBe("غير مسموح");
    expect(getRegressionToastMessage(other, "fb")).toBe("fb");
    expect(getRegressionToastMessage(new Error("net"), "fb")).toBe("fb");
  });
});
