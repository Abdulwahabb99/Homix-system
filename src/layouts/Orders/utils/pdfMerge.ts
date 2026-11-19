/**
 * دمج إيصال التحويل في نهاية PDF الفاتورة (على جهاز المستخدم، بلا رفع ولا endpoint جديد).
 * pdf-lib يُحمَّل كسولاً (dynamic import) فلا يدخل الحزمة الرئيسية.
 *
 * - نحدد نوع الإيصال من البايتات الأولى لا من الاسم/الـ mime (قد يكذبان).
 * - PDF: تُنسخ صفحاته كما هي بمقاساتها. صورة (JPEG/PNG/GIF): تُرسم على canvas أبيض
 *   (يطبّق اتجاه EXIF، ويسطّح شفافية PNG، ويأخذ أول إطار من GIF) ثم تُضمَّن JPEG — فالذاكرة
 *   والحجم محدودان مهما كان الأصل (حتى 16MB).
 */

export class UnsupportedReceiptError extends Error {
  constructor(message = "unsupported receipt type") {
    super(message);
    this.name = "UnsupportedReceiptError";
  }
}

export type ReceiptKind = "pdf" | "jpeg" | "png" | "gif";

const startsWith = (bytes: Uint8Array, signature: number[]) => signature.every((b, i) => bytes[i] === b);

/** نوع الملف من الـ magic bytes، أو null إن لم يكن من الأنواع المقبولة. */
export function sniffReceiptKind(bytes: Uint8Array): ReceiptKind | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "pdf"; // %PDF
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return "png";
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return "gif"; // GIF8
  return null;
}

/* ───────── هندسة الصفحة (نقية) ───────── */

export const A4_PORTRAIT: [number, number] = [595.28, 841.89];
export const A4_LANDSCAPE: [number, number] = [841.89, 595.28];
export const RECEIPT_PAGE_MARGIN = 28;
const MAX_UPSCALE = 2;
const LANDSCAPE_ASPECT = 1.6;
/** أطول ضلع وإجمالي بكسلات الصورة بعد التصغير (iOS يحدّ الـ canvas بنحو 16.7M). */
export const MAX_IMAGE_SIDE = 3000;
export const MAX_IMAGE_PIXELS = 12_000_000;

/** صفحة A4 طولية، أو عرضية للصور العريضة جداً. */
export function pageSizeForImage(width: number, height: number): [number, number] {
  return width / height > LANDSCAPE_ASPECT ? A4_LANDSCAPE : A4_PORTRAIT;
}

/** موضع الصورة داخل الصفحة: تتّسع بين الهوامش وتتوسّط، بلا تكبير فوق ‎2×‎ من حجمها بالنقاط. */
export function computeImagePlacement(
  imageWidth: number,
  imageHeight: number,
  pageWidth: number,
  pageHeight: number,
  margin = RECEIPT_PAGE_MARGIN
): { x: number; y: number; width: number; height: number } {
  const availableW = pageWidth - 2 * margin;
  const availableH = pageHeight - 2 * margin;
  const ratio = Math.min(availableW / imageWidth, availableH / imageHeight, MAX_UPSCALE);
  const width = imageWidth * ratio;
  const height = imageHeight * ratio;
  return { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height };
}

/** أبعاد الرسم بعد التصغير ليحقق الحدّين (ضلع وبكسلات). لا تكبير أبداً. */
export function fitWithinLimits(
  width: number,
  height: number,
  maxSide = MAX_IMAGE_SIDE,
  maxPixels = MAX_IMAGE_PIXELS
): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height), Math.sqrt(maxPixels / (width * height)));
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}

/* ───────── قراءة وتحويل الصور (متصفح) ───────── */

export async function readBlobBytes(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === "function") return new Uint8Array(await blob.arrayBuffer());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

export interface JpegResult {
  bytes: Uint8Array;
  width: number;
  height: number;
}

type DecodedImage = { source: CanvasImageSource; width: number; height: number; release: () => void };

async function decodeImage(blob: Blob): Promise<DecodedImage> {
  try {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" } as unknown as ImageBitmapOptions);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch {
    // متصفحات بلا createImageBitmap(blob, options): <img> يطبّق EXIF افتراضياً
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image decode failed"));
        img.src = url;
      });
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => undefined };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/** أي صورة (JPEG/PNG/GIF) → JPEG مصغّر على خلفية بيضاء. */
export async function imageToJpeg(blob: Blob): Promise<JpegResult> {
  const decoded = await decodeImage(blob);
  const canvas = document.createElement("canvas");
  try {
    const { width, height } = fitWithinLimits(decoded.width, decoded.height);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(decoded.source, 0, 0, width, height);
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!jpeg) throw new Error("jpeg encoding failed");
    return { bytes: await readBlobBytes(jpeg), width, height };
  } finally {
    decoded.release();
    canvas.width = 0;
    canvas.height = 0;
  }
}

/* ───────── الدمج ───────── */

export interface MergeDeps {
  imageToJpeg: (blob: Blob) => Promise<JpegResult>;
}

/**
 * يلحق الإيصال بنهاية PDF الفاتورة ويُرجع PDF واحداً (صفحات الفاتورة أولاً).
 * يرمي `UnsupportedReceiptError` لنوع غير معروف، وأي خطأ آخر (PDF تالف/مشفّر بكلمة مرور…)
 * يصعد كما هو — المستدعي يحفظ الفاتورة وحدها عند أي فشل.
 */
export async function appendReceiptToPdf(
  invoicePdf: Blob,
  receipt: Blob,
  deps: MergeDeps = { imageToJpeg }
): Promise<Blob> {
  const receiptBytes = await readBlobBytes(receipt);
  const kind = sniffReceiptKind(receiptBytes);
  if (!kind) throw new UnsupportedReceiptError();

  const { PDFDocument } = await import("pdf-lib");
  const out = await PDFDocument.load(await readBlobBytes(invoicePdf));

  if (kind === "pdf") {
    const source = await PDFDocument.load(receiptBytes, { ignoreEncryption: true });
    const pages = await out.copyPages(source, source.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  } else {
    const jpeg = await deps.imageToJpeg(receipt);
    const embedded = await out.embedJpg(jpeg.bytes);
    const [pageW, pageH] = pageSizeForImage(jpeg.width, jpeg.height);
    const page = out.addPage([pageW, pageH]);
    const place = computeImagePlacement(jpeg.width, jpeg.height, pageW, pageH);
    page.drawImage(embedded, place);
  }

  const merged = await out.save();
  return new Blob([merged], { type: "application/pdf" });
}
