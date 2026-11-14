import { documentItemCount, documentVendorLabel, normalizePrintedDocuments } from "./receiptDocuments";

const doc = (number, vendorName, items = 1) => ({
  number,
  issuedAt: null,
  vendorName,
  items: Array.from({ length: items }, (_, i) => ({ orderId: i, vendorName })),
});

test("a multi-factory response yields every document", () => {
  const documents = [doc("RCV-1", "أ", 2), doc("RCV-2", "ب")];
  expect(normalizePrintedDocuments({ documents })).toEqual(documents);
});
test("a legacy single-document response is wrapped into one document", () => {
  const legacy = doc("RCV-1", "أ");
  expect(normalizePrintedDocuments(legacy)).toEqual([legacy]);
  expect(normalizePrintedDocuments(null)).toEqual([]);
  expect(normalizePrintedDocuments({})).toEqual([]);
});
test("labels fall back to item vendors and then to 'بدون مصنع'", () => {
  expect(documentVendorLabel(doc("R", "مصنع أ"))).toBe("مصنع أ");
  expect(documentVendorLabel({ ...doc("R", ""), vendorName: undefined, items: [{ vendorName: "ج" }] })).toBe("ج");
  expect(documentVendorLabel(doc("R", ""))).toBe("بدون مصنع");
});
test("item count prefers the server value", () => {
  expect(documentItemCount({ ...doc("R", "أ", 3), itemCount: 5 })).toBe(5);
  expect(documentItemCount(doc("R", "أ", 3))).toBe(3);
});
