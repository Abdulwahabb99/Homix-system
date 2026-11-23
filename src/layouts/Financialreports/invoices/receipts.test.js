import { RECEIPTS_MAX_PER_INVOICE, RECEIPTS_MAX_PER_UPLOAD, pickReceiptFiles, receiptKindOf } from "./shared";

const f = (name, type, size = 1000) => ({ name, type, size });

describe("pickReceiptFiles (multi-file picker)", () => {
  it("keeps the valid files in order and reports the rejected ones with a reason", () => {
    const { accepted, rejected } = pickReceiptFiles([f("a.pdf", "application/pdf"), f("b.webp", "image/webp"), f("c.png", "image/png"), f("big.pdf", "application/pdf", 20 * 1024 * 1024)], 0);
    expect(accepted.map((x) => x.name)).toEqual(["a.pdf", "c.png"]);
    expect(rejected.map((x) => x.name)).toEqual(["b.webp", "big.pdf"]);
    expect(rejected[0].reason).toMatch(/صورة/);
    expect(rejected[1].reason).toMatch(/16/);
  });
  it("caps one request and the invoice total", () => {
    const many = Array.from({ length: RECEIPTS_MAX_PER_UPLOAD + 2 }, (_, i) => f(`f${i}.pdf`, "application/pdf"));
    const first = pickReceiptFiles(many, 0);
    expect(first.accepted).toHaveLength(RECEIPTS_MAX_PER_UPLOAD);
    expect(first.rejected).toHaveLength(2);
    const room = pickReceiptFiles(many, RECEIPTS_MAX_PER_INVOICE - 3);
    expect(room.accepted).toHaveLength(3);
    expect(room.rejected[0].reason).toMatch(/20/);
  });
});

describe("receiptKindOf", () => {
  it("image / pdf / other by mime or name", () => {
    expect(receiptKindOf("image/png")).toBe("image");
    expect(receiptKindOf("application/octet-stream", "x.JPG")).toBe("image");
    expect(receiptKindOf("application/pdf")).toBe("pdf");
    expect(receiptKindOf("application/octet-stream", "x.pdf")).toBe("pdf");
    expect(receiptKindOf("text/plain", "x.txt")).toBe("file");
  });
});
