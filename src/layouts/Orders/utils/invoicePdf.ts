import html2pdf from "html2pdf.js";

const NATIVE_PRINT_CLASS = "invoice-native-print-target";
const NATIVE_PRINT_STYLE_ID = "invoice-native-print-style";

/**
 * احتياطي عند فشل توليد الـ PDF: طباعة المتصفح الأصلية (Ctrl/Cmd+P) — لا تستخدم
 * canvas فلا تصطدم بحدوده. تُخفي كل شيء في الصفحة أثناء الطباعة إلا العنصر
 * الممرَّر (الفاتورة أو حاوية الفواتير المجمّعة)، وتُعيده كما كان بعد الإغلاق.
 */
export function printElementNatively(element: HTMLElement): void {
  document
    .querySelectorAll(`.${NATIVE_PRINT_CLASS}`)
    .forEach((el) => el.classList.remove(NATIVE_PRINT_CLASS));
  element.classList.add(NATIVE_PRINT_CLASS);

  let styleTag = document.getElementById(NATIVE_PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = NATIVE_PRINT_STYLE_ID;
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = `
    @media print {
      body * { visibility: hidden !important; }
      .${NATIVE_PRINT_CLASS}, .${NATIVE_PRINT_CLASS} * { visibility: visible !important; }
      .${NATIVE_PRINT_CLASS} {
        position: static !important;
        left: auto !important;
        top: auto !important;
        width: auto !important;
        max-width: none !important;
        z-index: auto !important;
      }
    }
  `;

  const cleanup = () => {
    element.classList.remove(NATIVE_PRINT_CLASS);
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);

  window.print();
}

function sanitizeFileBaseName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

/** انتظار خط عربي قبل الرسم داخل الـ canvas حتى لا تسقط على خط بدون أشكال */
async function waitForInvoiceFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const families = ["Cairo", "Noto Sans Arabic"];
  const weights = ["400", "600", "700", "800"] as const;
  try {
    await Promise.all(
      families.flatMap((f) => weights.map((w) => document.fonts.load(`${w} 16px ${f}`)))
    );
  } catch {
    // continue — سيُستخدم الاحتياطي
  }
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
}

/** انتظار تحميل كل الصور (شعار الفاتورة) داخل عنصر قبل التقاطه إلى canvas */
async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    })
  );
}

/* ───────────────────── دقّة الرسم، حدود الـ canvas، والذاكرة ─────────────────────
   سبب فشل التحميل على الموبايل: الدقّة كانت 2×devicePixelRatio، وعلى الهاتف
   dpr = 3 فتصبح 6× — أي canvas بعرض 700×6 = 4200 وارتفاع بالآلاف، نحو 48 مليون
   بكسل ≈ 190MB لوحدها. الأثر مزدوج:
     • متصفحات iOS تحدّ الـ canvas بنحو 16.7M بكسل، فيعود شفافاً بصمت.
     • تجاوز ميزانية ذاكرة التبويب يجعل Safari يقتل الصفحة ويعيد تحميلها —
       وهو ما يظهر للمستخدم كأن «لا شيء يحدث والصفحة تُعاد».
   الحل: نحسب أعلى دقّة تفي بميزانية الجهاز بدل رقم ثابت، ونتحقّق من نجاح الرسم.

   ملاحظة على الذاكرة: html2pdf يحتفظ بالـ canvas الكامل + canvas بحجم صفحة واحدة
   + صور الصفحات داخل jsPDF في نفس اللحظة، فالميزانية أدناه تخصّ الـ canvas الكامل
   فقط ويجب أن تبقى متحفّظة.                                                      */

/** ميزانية الـ canvas الكامل على الموبايل (‏24MB) — تترك مساحة لبقية مراحل التوليد. */
const MOBILE_MAX_CANVAS_PIXELS = 6_000_000;
/** أقصى طول ضلع يقبله canvas على iOS. */
const MOBILE_MAX_CANVAS_SIDE = 8_192;

/** iPadOS يتنكّر كـ macOS، فنكشفه بوجود لمس متعدّد. */
function isCanvasLimitedDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1);
  return isIOS || /Android|Mobile/i.test(ua);
}

/**
 * على الديسكتوب نُبقي الدقّة كما هي اليوم (3× أو 2×dpr) حتى يبقى الملف مطابقاً
 * تماماً لما يُنتجه الآن. على الموبايل نُنزلها لأعلى قيمة تفي بالميزانية — نفس
 * المستند ونفس الصفحات والمقاسات (‏.paper بعرض 700px ثابت)، فرقٌ في دقّة الرسم فقط.
 */
function resolveCanvasScale(element: HTMLElement): number {
  const dpr = typeof window === "undefined" ? 1.5 : window.devicePixelRatio || 1;
  const desired = Math.max(3, dpr * 2);
  if (!isCanvasLimitedDevice()) return desired;

  const width = element.scrollWidth || element.offsetWidth || 700;
  const height = element.scrollHeight || element.offsetHeight || 1000;
  const byArea = Math.sqrt(MOBILE_MAX_CANVAS_PIXELS / (width * height));
  const bySide = Math.min(MOBILE_MAX_CANVAS_SIDE / width, MOBILE_MAX_CANVAS_SIDE / height);
  return Math.max(0.5, Math.min(desired, byArea, bySide));
}

/** canvas تجاوز حدود الجهاز يعود شفافاً بالكامل — نكشفه لنُعيد المحاولة بدقّة أقل. */
function isBlankCanvas(canvas: HTMLCanvasElement): boolean {
  if (!canvas.width || !canvas.height) return true;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  // عيّنة من أعلى منتصف الصفحة الأولى — الفاتورة مرسومة على خلفية بيضاء غير شفافة
  const w = Math.min(canvas.width, 64);
  const h = Math.min(canvas.height, 64);
  const x = Math.max(0, Math.floor(canvas.width / 2 - w / 2));
  try {
    const { data } = ctx.getImageData(x, 0, w, h);
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) return false;
    return true;
  } catch {
    return false; // tainted canvas — لا نستطيع الحكم، نمرّره
  }
}

class BlankCanvasError extends Error {}

function buildOptions(filename: string, scale: number) {
  return {
    margin: [5, 5, 5, 5] as [number, number, number, number],
    filename,
    // PNG is lossless, so Arabic glyphs and thin table rules stay crisp; JPEG at
    // 0.92 was visibly smearing them.
    image: { type: "png", quality: 1 },
    html2canvas: {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      /* مهم: scale في onclone يفسد أشكال الحروف على canvas */
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
  };
}

/**
 * نُخرج Blob بدل استدعاء save() مباشرة: التنزيل يصبح خطوة نتحكّم بها ونعرف إن
 * فشلت، بدل أن يُبتلع الفشل داخل html2pdf فلا يرى المستخدم شيئاً.
 */
async function renderInvoiceBlob(
  element: HTMLElement,
  filename: string,
  scale: number
): Promise<Blob> {
  // نمرّ على toCanvas أولاً للتحقّق أن الرسم نجح — الفشل على الموبايل صامت
  // (canvas شفاف)، ورفع الخطأ داخل السلسلة يمنع بناء PDF فارغ من الأصل.
  const blob = await html2pdf()
    .set(buildOptions(filename, scale))
    .from(element)
    .toCanvas()
    .get("canvas")
    .then((canvas: HTMLCanvasElement) => {
      if (canvas && isBlankCanvas(canvas)) {
        throw new BlankCanvasError(`blank canvas at scale ${scale}`);
      }
    })
    .toPdf()
    .output("blob");

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("empty pdf blob");
  }
  return blob;
}

/** تنزيل Blob باسم ملف — يعمل على iOS Safari 13+ وأندرويد بنفس المسار. */
function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // الإبطال الفوري يقطع التنزيل على بعض المتصفحات — نؤجّله.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadOrderInvoicePdf(
  element: HTMLElement,
  fileBaseName: string
): Promise<void> {
  await waitForInvoiceFonts();
  await waitForImages(element);

  const safe = sanitizeFileBaseName(fileBaseName) || "invoice";
  const filename = `${safe}.pdf`;
  const scale = resolveCanvasScale(element);

  let blob: Blob;
  try {
    blob = await renderInvoiceBlob(element, filename, scale);
  } catch (error) {
    // canvas فارغ يعني أننا فوق حدّ الجهاز — محاولة واحدة بدقّة أقل قبل الاستسلام.
    if (!(error instanceof BlankCanvasError)) throw error;
    blob = await renderInvoiceBlob(element, filename, Math.max(0.5, scale * 0.6));
  }

  saveBlob(blob, filename);
}
