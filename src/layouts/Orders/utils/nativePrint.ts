export const NATIVE_PRINT_CLASS = "invoice-native-print-target";
export const NATIVE_PRINT_ANCESTOR_CLASS = "invoice-native-print-ancestor";
export const NATIVE_PRINT_HIDDEN_CLASS = "invoice-native-print-hidden";

/** A4 بهوامش صفر (يُلغي ترويسة/تذييل المتصفح: التاريخ والعنوان والـ URL) + حشوة داخلية. */
export const PRINT_PAGE_PADDING_MM = 10;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 96 / 25.4;
/** أصغر تصغير مقبول لإدخال الفاتورة في صفحة واحدة؛ تحته نسمح بصفحة ثانية. */
/** الطباعة تعطي ارتفاعاً أكبر قليلاً من القياس على الشاشة (قِيس ~1.5-2%): هامش أمان. */
const FIT_SAFETY = 0.95;
const MIN_FIT_SCALE = 0.72;

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT", "TEMPLATE"]);

/**
 * CSS الطباعة الأصلية: يجب أن يحتوي التخطيط المطبوع على الفاتورة فقط.
 * - كل ما ليس في سلسلة أجداد الفاتورة يأخذ display:none (وليس visibility:hidden
 *   لأنه يُبقي ارتفاعه في التخطيط فتظهر صفحات فارغة قبل/بعد الفاتورة).
 * - سلسلة الأجداد تُحيَّد (static/overflow visible/height auto) لأن الفاتورة تُرسم
 *   داخل حاوية خارج الشاشة (position: fixed; left: -10000px; overflow: hidden).
 */
export function buildNativePrintCss(
  targetClass: string = NATIVE_PRINT_CLASS,
  ancestorClass: string = NATIVE_PRINT_ANCESTOR_CLASS,
  hiddenClass: string = NATIVE_PRINT_HIDDEN_CLASS
): string {
  return `
    @media print {
      @page { size: A4; margin: 0; }
      html, body {
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        background: #fff !important;
        margin: 0 !important;
        padding: ${PRINT_PAGE_PADDING_MM}mm !important;
        position: static !important;
        display: block !important;
      }
      html { padding: 0 !important; }
      .${hiddenClass} { display: none !important; }
      .${ancestorClass} {
        display: block !important;
        position: static !important;
        left: auto !important;
        top: auto !important;
        right: auto !important;
        bottom: auto !important;
        width: auto !important;
        height: auto !important;
        min-height: 0 !important;
        max-width: none !important;
        max-height: none !important;
        overflow: visible !important;
        transform: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        background: #fff !important;
        z-index: auto !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }
      .${targetClass} {
        display: block !important;
        position: static !important;
        left: auto !important;
        top: auto !important;
        width: 100% !important;
        max-width: none !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 auto !important;
        z-index: auto !important;
        visibility: visible !important;
        opacity: 1 !important;
        transform: none !important;
        box-shadow: none !important;
      }
      .${targetClass} table, .${targetClass} tr, .${targetClass} img { break-inside: avoid; }
    }
  `;
}

function isElement(node: Node | null): node is HTMLElement {
  return !!node && node.nodeType === 1;
}

/**
 * يجهّز التخطيط للطباعة: يعلّم الهدف وأجداده وكل أخوة هذه السلسلة (كل ما ليس في
 * شجرة الهدف) ثم يعيد دالة تُرجع كل شيء كما كان. دالة نقية على DOM فتعمل في jest
 * وفي صفحة الاختبار الحقيقية.
 */
export function applyPrintLayout(
  element: HTMLElement,
  options: { fitToOnePage?: boolean } = {}
): () => void {
  const doc = element.ownerDocument;
  const added: Array<[HTMLElement, string]> = [];
  const mark = (el: HTMLElement, cls: string) => {
    if (!el.classList.contains(cls)) {
      el.classList.add(cls);
      added.push([el, cls]);
    }
  };

  // تنظيف أي علامات متبقية من طباعة سابقة لم تصلها afterprint
  [NATIVE_PRINT_CLASS, NATIVE_PRINT_ANCESTOR_CLASS, NATIVE_PRINT_HIDDEN_CLASS].forEach((cls) =>
    doc.querySelectorAll(`.${cls}`).forEach((el) => el.classList.remove(cls))
  );

  // ارتفاع الفاتورة قبل تغيير التخطيط (هي أصلاً بعرضها الطبيعي)
  const naturalHeight = options.fitToOnePage ? element.getBoundingClientRect().height : 0;

  mark(element, NATIVE_PRINT_CLASS);
  const hideSiblings = (el: HTMLElement) => {
    const parent = el.parentElement;
    if (!parent) return;
    Array.from(parent.children).forEach((sib) => {
      if (sib !== el && isElement(sib) && !SKIP_TAGS.has(sib.tagName)) mark(sib, NATIVE_PRINT_HIDDEN_CLASS);
    });
  };
  hideSiblings(element);
  for (let el = element.parentElement; el && el !== doc.body && el !== doc.documentElement; el = el.parentElement) {
    mark(el, NATIVE_PRINT_ANCESTOR_CLASS);
    hideSiblings(el);
  }

  let zoomApplied = false;
  if (options.fitToOnePage && naturalHeight > 0) {
    const availablePx = (A4_HEIGHT_MM - 2 * PRINT_PAGE_PADDING_MM) * MM_TO_PX * FIT_SAFETY;
    const scale = availablePx / naturalHeight;
    if (scale < 1 && scale >= MIN_FIT_SCALE) {
      (element.style as any).zoom = String(scale);
      zoomApplied = true;
    }
  }

  return () => {
    added.forEach(([el, cls]) => el.classList.remove(cls));
    if (zoomApplied) (element.style as any).zoom = "";
  };
}
