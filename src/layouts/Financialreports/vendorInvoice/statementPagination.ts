/**
 * تقسيم بنود الكشف على صفحات A4 (794×1122 px) — دالة نقية.
 *
 * لماذا نقسّم نحن بدل html2pdf: html2pdf يقصّ صورة واحدة كبيرة، ومع وضع avoid-all كان يدفع
 * العنصر الجذر (أطول من صفحة) إلى صفحة ثانية فتخرج صفحة أولى فارغة وثالثة بسطر واحد من التذييل.
 * هنا كل صفحة عنصر مستقل ارتفاعه 1122px بالضبط (ترويسة الجدول تتكرر، والتذييل على كل صفحة، والإجماليات
 * + البنك + الختم في الصفحة الأخيرة)، فلا يبقى لـ html2pdf إلا فاصل `break-after: page` بين العناصر.
 * ارتفاع الصف ثابت (ROW_H) كي يكون الحساب حتمياً؛ الثوابت تُراجَع بـ harness الرسم (انظر الاختبار).
 */
/** ارتفاع عنصر الصفحة 1120px (لا 1122): انظر تعليق `.page` في CSS — حشوة فواصل html2pdf */
export const PAGE_H = 1120;
export const FOOTER_H = 49;
export const ROW_H = 40;
/** هامش أمان فوق التذييل */
export const SAFETY = 4;
/** بداية الصفوف في الصفحة الأولى (بعد الترويسة والبطاقات والمورد ورأس الجدول) */
export const FIRST_ROWS_TOP = 412;
/** بداية الصفوف في صفحات المتابعة (شريط علوي + رأس الجدول) */
export const CONT_ROWS_TOP = 118;
/** هامش كتلة الأسفل (علوي 24 + حدّ الجدول 1 | سفلي 8) — مقيس من الرسم الفعلي */
const BOTTOM_MARGIN = 25 + 8;
const BANK_H = 139;
const TOTAL_ROW_H = 33.3;
const NET_H = 52;
/** الختم تحت الإجماليات (وضع النموذج المعتمد): 10px فراغ + canvas بارتفاع 170 */
const STAMP_BELOW_H = 180;
/** الختم تحت صندوق البنك في العمود الأيمن (وضع التوفير): ارتفاعه المرئي ~150 */
const STAMP_BESIDE_H = 154;

const LIMIT = PAGE_H - FOOTER_H - SAFETY;

/** below = الختم تحت الإجماليات كما في النموذج؛ beside = تحت صندوق البنك (أقصر) حين لا يتسع الأول؛ none = بلا ختم */
export type StampMode = "below" | "beside" | "none";

const totalsHeight = (totalRows: number) => Math.ceil(totalRows * TOTAL_ROW_H) + NET_H;

/** ارتفاع كتلة الأسفل (بنك + إجماليات + ختم) بما فيها هامشها العلوي */
export function bottomBlockHeight(totalRows: number, stamp: StampMode, bankH: number = BANK_H): number {
  const totals = totalsHeight(totalRows);
  if (stamp === "below") return BOTTOM_MARGIN + Math.max(bankH, totals + STAMP_BELOW_H);
  if (stamp === "beside") return BOTTOM_MARGIN + Math.max(totals, bankH + STAMP_BESIDE_H);
  return BOTTOM_MARGIN + Math.max(bankH, totals);
}

/**
 * ارتفاع صندوق التحويل: العنوان + صفوف البيانات (22px) + ملاحظة اختيارية؛ لا ينزل عن ارتفاع الصندوق القياسي.
 * `rowCount = 0` وبلا ملاحظة = لا صندوق (الصافي صفر) ← ارتفاع 0.
 */
export function bankBoxHeight(rowCount: number, hasNote: boolean): number {
  if (rowCount <= 0 && !hasNote) return 0;
  return Math.max(BANK_H, 14 + 16 + 6 + rowCount * 22 + (hasNote ? 40 : 0) + 8);
}

export interface PagePlan {
  /** عدد الصفوف في هذه الصفحة */
  rows: number;
  /** هل تحمل كتلة الإجماليات/البنك/الختم */
  hasBottom: boolean;
  /** موضع الختم في الصفحة الأخيرة */
  stampMode: StampMode;
}

/**
 * `totalRows` = صفوف الإجماليات (3 + الإضافية + التعديلات). عند عدم وجود بنود تبقى صفحة واحدة بحالة «لا بنود».
 * في الصفحة الأخيرة نفضّل وضع الختم المعتمد (below) ثم beside ثم نرحّل الكتلة إلى صفحة جديدة.
 */
export function planPages(lineCount: number, totalRows: number, hasStamp: boolean, bankH: number = BANK_H): PagePlan[] {
  const top = (page: number) => (page === 0 ? FIRST_ROWS_TOP : CONT_ROWS_TOP);
  const cap = (page: number, bottomHeight: number) => Math.max(0, Math.floor((LIMIT - top(page) - bottomHeight) / ROW_H));
  const modes: StampMode[] = hasStamp ? ["below", "beside"] : ["none"];
  const plans: PagePlan[] = [];
  let remaining = Math.max(0, lineCount);
  for (let page = 0; ; page += 1) {
    const mode = modes.find((m) => remaining <= cap(page, bottomBlockHeight(totalRows, m, bankH)));
    if (mode) {
      plans.push({ rows: remaining, hasBottom: true, stampMode: mode });
      return plans;
    }
    const rows = Math.min(Math.max(1, cap(page, 0)), remaining);
    plans.push({ rows, hasBottom: false, stampMode: "none" });
    remaining -= rows;
  }
}
