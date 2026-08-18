import html2pdf from "html2pdf.js";

/**
 * توليد الفاتورة عبر html2pdf يعتمد على html2canvas برسم DOM كامل في canvas
 * بدقة عالية — عملية ثقيلة وتصطدم بحدود حجم الـ canvas الصغيرة في متصفحات
 * الموبايل (خصوصاً Safari iOS) فتُنتج صفحة فارغة بصمت. على الشاشات الصغيرة
 * نستخدم بديلاً أخف: طباعة المتصفح الأصلية (printElementNatively) بدل الحجب.
 * نفس حد "ديسكتوب" المستخدم في DateRangePickerWrapper.
 */
export function isInvoicePrintSupportedViewport(): boolean {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= 769;
}

const NATIVE_PRINT_CLASS = "invoice-native-print-target";
const NATIVE_PRINT_STYLE_ID = "invoice-native-print-style";

/**
 * بديل للموبايل: طباعة المتصفح الأصلية (Ctrl/Cmd+P) بدل html2canvas — لا تصطدم
 * بحدود حجم canvas لأنها لا تستخدم canvas أصلاً، فتعمل بثبات على أي جهاز. تُخفي
 * كل شيء في الصفحة أثناء الطباعة إلا العنصر الممرَّر (الفاتورة أو حاوية الفواتير
 * المجمّعة)، وتُعيده كما كان بعد إغلاق مربع حوار الطباعة.
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

export async function downloadOrderInvoicePdf(
  element: HTMLElement,
  fileBaseName: string
): Promise<void> {
  await waitForInvoiceFonts();
  await waitForImages(element);

  const safe = sanitizeFileBaseName(fileBaseName) || "invoice";
  const filename = `${safe}.pdf`;

  const opt = {
    margin: [5, 5, 5, 5] as [number, number, number, number],
    filename,
    // PNG is lossless, so Arabic glyphs and thin table rules stay crisp; JPEG at
    // 0.92 was visibly smearing them.
    image: { type: "png", quality: 1 },
    html2canvas: {
      // Render at >=3x device pixels and let jsPDF downscale into the A4 page.
      scale: Math.max(3, typeof window === "undefined" ? 3 : window.devicePixelRatio * 2),
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      /* مهم: scale في onclone يفسد أشكال الحروف على canvas */
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
  };

  await html2pdf().set(opt).from(element).save();
}
