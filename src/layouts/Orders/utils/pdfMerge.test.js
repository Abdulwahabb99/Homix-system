import { PDFDocument } from "pdf-lib";
import {
  A4_PORTRAIT, UnsupportedReceiptError, appendReceiptToPdf, computeImagePlacement, fitWithinLimits, pageSizeForImage, sniffReceiptKind,
} from "./pdfMerge";

const JPEG_B64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAADAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDgqKKK8M/VD//Z";
const jpegBytes = () => Uint8Array.from(Buffer.from(JPEG_B64, "base64"));
const PNG_HEAD = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]);
const GIF_HEAD = Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

async function makePdf(sizes) {
  const doc = await PDFDocument.create();
  sizes.forEach((s) => doc.addPage(s));
  return new Blob([await doc.save()], { type: "application/pdf" });
}
const pagesOf = async (blob) => (await PDFDocument.load(new Uint8Array(await new Response(blob).arrayBuffer()))).getPages().map((p) => p.getSize());

describe("sniffReceiptKind", () => {
  it("detects by magic bytes", () => {
    expect(sniffReceiptKind(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe("pdf");
    expect(sniffReceiptKind(jpegBytes())).toBe("jpeg");
    expect(sniffReceiptKind(PNG_HEAD)).toBe("png");
    expect(sniffReceiptKind(GIF_HEAD)).toBe("gif");
    expect(sniffReceiptKind(Uint8Array.from([1, 2, 3, 4]))).toBeNull();
  });
});

describe("geometry", () => {
  it("fits inside margins, centred, upscale capped at 2x", () => {
    const big = computeImagePlacement(2000, 3000, 595.28, 841.89);
    expect(big.x).toBeGreaterThanOrEqual(28 - 1e-6);
    expect(big.x + big.width).toBeLessThanOrEqual(595.28 - 28 + 1e-6);
    expect(big.y + big.height).toBeLessThanOrEqual(841.89 - 28 + 1e-6);
    const small = computeImagePlacement(10, 10, 595.28, 841.89);
    expect(small.width).toBe(20);
    expect(small.x).toBeCloseTo((595.28 - 20) / 2);
  });
  it("landscape page only for very wide images", () => {
    expect(pageSizeForImage(1000, 1000)).toEqual(A4_PORTRAIT);
    expect(pageSizeForImage(3000, 1000)[0]).toBeGreaterThan(pageSizeForImage(3000, 1000)[1]);
  });
  it("downscales to side and pixel limits, never upscales", () => {
    const r = fitWithinLimits(6000, 4000);
    expect(Math.max(r.width, r.height)).toBeLessThanOrEqual(3000);
    expect(r.width * r.height).toBeLessThanOrEqual(12_000_000);
    expect(fitWithinLimits(100, 50)).toEqual({ width: 100, height: 50 });
  });
});

describe("appendReceiptToPdf", () => {
  it("appends PDF receipt pages keeping their sizes", async () => {
    const inv = await makePdf([[595.28, 841.89]]);
    const rec = await makePdf([[300, 400], [500, 200]]);
    const sizes = await pagesOf(await appendReceiptToPdf(inv, rec));
    expect(sizes).toHaveLength(3);
    expect(sizes[1]).toEqual({ width: 300, height: 400 });
    expect(sizes[2]).toEqual({ width: 500, height: 200 });
  });

  it("puts an image receipt on an A4 page via imageToJpeg (png/gif too)", async () => {
    for (const head of [jpegBytes(), PNG_HEAD, GIF_HEAD]) {
      const inv = await makePdf([[595.28, 841.89]]);
      const imageToJpeg = jest.fn().mockResolvedValue({ bytes: jpegBytes(), width: 4, height: 3 });
      const out = await appendReceiptToPdf(inv, new Blob([head], { type: "text/plain" }), { imageToJpeg });
      expect(imageToJpeg).toHaveBeenCalledTimes(1);
      const sizes = await pagesOf(out);
      expect(sizes).toHaveLength(2);
      expect(sizes[1].width).toBeCloseTo(595.28, 1);
      expect(sizes[1].height).toBeCloseTo(841.89, 1);
    }
  });

  it("throws UnsupportedReceiptError for unknown bytes even with a lying mime", async () => {
    const inv = await makePdf([[595.28, 841.89]]);
    await expect(appendReceiptToPdf(inv, new Blob([Uint8Array.from([9, 9, 9, 9])], { type: "application/pdf" })))
      .rejects.toBeInstanceOf(UnsupportedReceiptError);
  });

  it("rejects a corrupt PDF receipt so the caller can fall back", async () => {
    const inv = await makePdf([[595.28, 841.89]]);
    const bad = new Blob([Buffer.from("%PDF-1.4 garbage")], { type: "application/pdf" });
    await expect(appendReceiptToPdf(inv, bad)).rejects.toBeTruthy();
  });
});
