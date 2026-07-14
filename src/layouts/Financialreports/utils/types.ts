/**
 * أنواع بيانات صفحة التقارير المالية (تسويات الصناع).
 * البيانات ثابتة حالياً؛ هذه الأنواع تُمثّل شكل استجابة الـ BE المستقبلية أيضاً
 * حتى يكون الاستبدال لاحقاً في `hooks/useFinancialSettlements` فقط.
 */

/** طريقة الدفع لكل طلب */
export type PayMethod = "cod" | "online";

/** سطر طلب داخل تسوية صانع */
export interface SettlementOrder {
  /** رقم العملية — OP-2401 */
  op: string;
  /** رقم الطلب — 31668 */
  order: string;
  /** كود المنتج — RKA-001 */
  code: string;
  /** سعر التكلفة */
  cost: number;
  /** المبلغ المطلوب تحصيله */
  collect: number;
  /** طريقة الدفع */
  pay: PayMethod;
  /** الغرامات */
  fine: number;
  /** المستحق للبائع */
  dueSeller: number;
  /** المستحق للشركة */
  dueComp: number;
}

/** صانع مع طلباته ضمن دورة الفوترة */
export interface SettlementSeller {
  id: string;
  name: string;
  /** التصنيف — «غرف نوم • صالة» */
  cat: string;
  /** تدرّج لوني لصورة الحرف (avatar) */
  color: string;
  /** الحرف/الحروف داخل الـ avatar */
  initials: string;
  orders: SettlementOrder[];
}

/** إجماليات صانع واحد — تُحسب في `utils/calc` */
export interface SellerTotals {
  orders: number;
  cost: number;
  collect: number;
  fine: number;
  dueSeller: number;
  dueComp: number;
  /** الصافي المطلوب (تسويات المخزن) = التكلفة − الغرامات */
  netRequired: number;
  /** الصافي بعد الغرامات (تسويات البائع) = مستحق البائع − الغرامات */
  netAfterFine: number;
  /** الإجمالي الكلي (الفاتورة الشاملة) = مستحق البائع + مستحق الشركة */
  totalCombined: number;
}

/** مؤشرات أعلى الصفحة (KPIs) — تُشتق من قائمة الصناع */
export interface FinancialKpis {
  sellersCount: number;
  totalSales: number;
  totalDueSeller: number;
  totalDueComp: number;
  totalFine: number;
  lateSellersCount: number;
  /** نسبة مستحق البائعين من الإجمالي (%) */
  dueSellerPct: number;
  /** نسبة مستحق الشركة من الإجمالي (%) */
  dueCompPct: number;
}

/** مفاتيح تبويبات الجدول */
export type SettlementTabKey = "warehouse" | "seller" | "comprehensive";
