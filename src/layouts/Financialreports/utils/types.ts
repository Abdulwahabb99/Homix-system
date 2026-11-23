/**
 * أنواع بيانات صفحة التقارير المالية (تسويات الصناع).
 * تُمثّل شكل البيانات بعد التطبيع من `query/financialReport`.
 */

/** طريقة الدفع لكل طلب (تبقى للخلايا العامة القابلة لإعادة الاستخدام) */
export type PayMethod = "cod" | "online";

import type { CycleInvoiceRef, VendorBank } from "query/financialInvoices";

/** يوم الفوترة المتاح من الـ BE */
export type BillingDay = 13 | 28;

/** مجاميع مورّد واحد كما تصل من الـ BE (بدون تفصيل الطلبات) */
export interface VendorRow {
  vendorId: number;
  vendorName: string;
  /** عدد الطلبات ضمن الدورة */
  ordersCount: number;
  /** سعر التكلفة (مجموع تكلفة منتجات الطلبات) */
  warehouseCost: number;
  /** إجمالي المبلغ المُحصّل */
  collectionTotal: number;
  /** الغرامات */
  fines: number;
  /** المستحق للبائع */
  vendorDue: number;
  /** المستحق لهوميكس (الإجمالي) */
  companyDue: number;
  /** Σ حصة هوميكس من تسليمات المخزن = التحصيل − التكلفة (للحسابات الداخلية) */
  homixMargin: number;
  /** Σ ما يسدّده الصانع لهوميكس في تسليمات البائع */
  vendorOwes: number;
  /** بيانات حساب البائع — تصل للموظف (finance_settle) وللبائع نفسه فقط؛ undefined = غير مسموح، null = لم تُسجَّل */
  vendorBank?: VendorBank | null;
  orders: SettlementOrder[];
}

export interface SettlementOrder {
  collectionTotal: number;
  companyDue: number;
  companyDueKind?: "margin" | "vendorOwes";
  fines: number;
  id: number;
  operationNumber: string;
  orderId: number;
  orderNumber: string;
  paymentStatus: number | null;
  paymentStatusLabel: string;
  productCode: string;
  productId: number | null;
  shipmentId: number | null;
  vendorDue: number;
  vendorShippingCost: number;
  warehouseCost: number;
  /** وضع هذا الطلب في فاتورة الدورة (يُضاف من التراكب `liveOverlay` فقط إن وُجدت فاتورة) */
  invoiceLine?: LiveLineInfo;
}

/**
 * included = محسوب في الفاتورة، frozen/deferred/removed = غير محسوب،
 * missing = الفاتورة موجودة ولا يوجد بند لهذا الطلب (سُلّم بعد الإصدار أو مفوتَر في فاتورة أخرى)
 */
export type LiveLineState = "included" | "frozen" | "deferred" | "removed" | "missing";

export interface LiveLineInfo {
  /** null = البند محسوب ولم يُعدَّل (لا حاجة لمعرّفه حتى لحظة التعديل) */
  lineId: number | null;
  invoiceId: number;
  state: LiveLineState;
  finesOverride: number | null;
  vendorDueOverride: number | null;
  companyDueOverride: number | null;
  warehouseCostOverride: number | null;
  collectionOverride: number | null;
  vendorShippingCostOverride: number | null;
  /** سبب التعديل / سبب حالة البند — للموظفين فقط */
  reason?: string | null;
  /** القيم قبل التعديل (للموظفين) — تظهر في تلميح الخلية */
  originalFines?: number;
  originalVendorShippingCost?: number;
  originalWarehouseCost?: number;
  originalCollection?: number;
  originalVendorDue?: number;
  originalCompanyDue?: number;
}

/** صانع/مورّد للعرض في الجدول — هوية العرض + مجاميعه */
export interface SettlementSeller {
  id: string;
  name: string;
  /** التصنيف — غير متوفّر من الـ BE حالياً (يُترك فارغاً) */
  cat: string;
  /** تدرّج لوني لصورة الحرف (avatar) — مُشتق محلياً */
  color: string;
  /** الحرف داخل الـ avatar — مُشتق من الاسم */
  initials: string;
  /** مجاميع المورّد (تُشتق منها SellerTotals) */
  row: VendorRow;
  /** فاتورة الصانع في الدورة المعروضة (null = لم تُصدر / غير مرئية له) — تُملأ من التراكب */
  invoice?: CycleInvoiceRef | null;
}

/** إجماليات صانع واحد — تُحسب في `utils/calc` */
export interface SellerTotals {
  orders: number;
  cost: number;
  collect: number;
  fine: number;
  dueSeller: number;
  dueComp: number;
  /** حصة هوميكس (تسليمات المخزن) */
  homixMargin: number;
  /** ما يسدّده الصانع لهوميكس (تسليمات البائع) */
  vendorOwes: number;
  /** إجمالي قيمة الشحن المحفوظة على المورد لطلبات تسليم البائع */
  vendorShippingCost: number;
  /** صافي المستحق الموقّع = مستحق البائع (إجمالي) − مستحق هوميكس − الغرامات (السالب = البائع مدين لهوميكس) */
  net: number;
  /** اسم قديم لنفس `net` (تسويات المخزن: Σ التكلفة − الغرامات) */
  netRequired: number;
}

/** مؤشرات أعلى الصفحة (KPIs) — تُشتق من الملخّص العام للـ BE */
export interface FinancialKpis {
  sellersCount: number;
  totalSales: number;
  totalDueSeller: number;
  totalDueComp: number;
  /** حصة هوميكس من تسليمات المخزن */
  totalHomixMargin: number;
  /** ما يسدّده الصانع لهوميكس (تسليمات البائع) */
  totalVendorOwes: number;
  totalFine: number;
  /** الصافي الموقّع لكل البائعين = المستحق للبائعين − المستحق لهوميكس − الغرامات */
  totalNet: number;
  /** إجمالي عدد الطلبات في الدورة (من الفاتورة الشاملة) */
  ordersCount: number;
  lateSellersCount: number;
  /** نسبة مستحق البائعين من الإجمالي (%) */
  dueSellerPct: number;
  /** نسبة المستحق لهوميكس من الإجمالي (%) */
  dueCompPct: number;
}

/** مفاتيح تبويبات الجدول */
export type SettlementTabKey = "warehouse" | "seller" | "comprehensive";
