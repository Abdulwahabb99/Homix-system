/**
 * أنواع بيانات صفحة التقارير المالية (تسويات الصناع).
 * تُمثّل شكل البيانات بعد التطبيع من `query/financialReport`.
 */

/** طريقة الدفع لكل طلب (تبقى للخلايا العامة القابلة لإعادة الاستخدام) */
export type PayMethod = "cod" | "online";

/** يوم الفوترة المتاح من الـ BE */
export type BillingDay = 13 | 28;

/** مجاميع مورّد واحد كما تصل من الـ BE (بدون تفصيل الطلبات) */
export interface VendorRow {
  vendorId: number;
  vendorName: string;
  /** عدد الطلبات ضمن الدورة */
  ordersCount: number;
  /** تكلفة المخزن */
  warehouseCost: number;
  /** إجمالي المبلغ المُحصّل */
  collectionTotal: number;
  /** الغرامات */
  fines: number;
  /** المستحق للبائع */
  vendorDue: number;
  /** المستحق للشركة */
  companyDue: number;
  orders: SettlementOrder[];
}

export interface SettlementOrder {
  collectionTotal: number;
  companyDue: number;
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
}

/** إجماليات صانع واحد — تُحسب في `utils/calc` */
export interface SellerTotals {
  orders: number;
  cost: number;
  collect: number;
  fine: number;
  dueSeller: number;
  dueComp: number;
  /** إجمالي قيمة الشحن المحفوظة على المورد لطلبات تسليم البائع */
  vendorShippingCost: number;
  /** الصافي المطلوب (تسويات المخزن) = التكلفة − الغرامات */
  netRequired: number;
  /** الإجمالي الكلي (الفاتورة الشاملة) = مستحق البائع + مستحق الشركة */
  totalCombined: number;
}

/** مؤشرات أعلى الصفحة (KPIs) — تُشتق من الملخّص العام للـ BE */
export interface FinancialKpis {
  sellersCount: number;
  totalSales: number;
  totalDueSeller: number;
  totalDueComp: number;
  totalFine: number;
  /** إجمالي عدد الطلبات في الدورة (من الفاتورة الشاملة) */
  ordersCount: number;
  lateSellersCount: number;
  /** نسبة مستحق البائعين من الإجمالي (%) */
  dueSellerPct: number;
  /** نسبة مستحق الشركة من الإجمالي (%) */
  dueCompPct: number;
}

/** مفاتيح تبويبات الجدول */
export type SettlementTabKey = "warehouse" | "seller" | "comprehensive";
