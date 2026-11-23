import { describeEventDetail, validateReceiptFile, RECEIPT_SIZE_ERROR, RECEIPT_TYPE_ERROR } from "./shared";

describe("validateReceiptFile (same rules as the server)", () => {
  const file = (name, type, size = 1000) => ({ name, type, size });
  it("accepts jpeg, png, gif and pdf", () => {
    ["a.jpg", "a.JPEG", "a.png", "a.gif", "a.pdf"].forEach((name) => {
      const type = name.toLowerCase().endsWith("pdf") ? "application/pdf" : `image/${name.toLowerCase().endsWith("png") ? "png" : name.toLowerCase().endsWith("gif") ? "gif" : "jpeg"}`;
      expect(validateReceiptFile(file(name, type))).toBeNull();
    });
  });
  it("rejects webp, heic and extension/type mismatches", () => {
    expect(validateReceiptFile(file("a.webp", "image/webp"))).toBe(RECEIPT_TYPE_ERROR);
    expect(validateReceiptFile(file("a.heic", "image/heic"))).toBe(RECEIPT_TYPE_ERROR);
    expect(validateReceiptFile(file("a.pdf", "text/plain"))).toBe(RECEIPT_TYPE_ERROR);
  });
  it("rejects files over 16MB", () => {
    expect(validateReceiptFile(file("a.pdf", "application/pdf", 17 * 1024 * 1024))).toBe(RECEIPT_SIZE_ERROR);
  });
});

describe("describeEventDetail", () => {
  it("renders a number edit like the artifact: operation — field: old ← new", () => {
    expect(describeEventDetail({ operationNumber: "OP-1", changes: { warehouseCostOverride: { from: null, to: 1000 }, finesOverride: { from: 50, to: 0 } } }))
      .toBe("OP-1 — سعر التكلفة: تلقائي ← 1000 ج.م — الغرامة: 50 ج.م ← 0 ج.م");
  });
  it("labels a vendor shipping change", () => {
    expect(describeEventDetail({ changes: { vendorShippingCostOverride: { from: null, to: 120 } } })).toBe("شحن البائع: تلقائي ← 120 ج.م");
  });
  it("renders a reset as automatic", () => {
    expect(describeEventDetail({ changes: { vendorDueOverride: { from: 700, to: null } } })).toBe("مستحق البائع: 700 ج.م ← تلقائي");
  });
});
