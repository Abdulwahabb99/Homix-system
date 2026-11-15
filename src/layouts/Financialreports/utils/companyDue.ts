/**
 * company due له معنيان مختلفان — نفصلهما في الواجهة والمستندات:
 *  - margin     : هامش هوميكس في تسليمات المخزن = التحصيل − التكلفة (الصانع لا يدين بشيء)
 *  - vendorOwes : مستحق على الصانع في تسليمات البائع = دين يسدّده الصانع لهوميكس
 * الأرقام نفسها لا تتغيّر؛ ولا تدخل أيٌّ منهما في صافي الفاتورة (الصافي = Σ مستحق البائع + التعديلات).
 */
import type { SettlementOrder } from "./types";

export type CompanyDueKind = "margin" | "vendorOwes";

export const MARGIN_LABEL = "هامش هوميكس";
export const MARGIN_TIP = "ما تحتفظ به هوميكس من تسليمات المخزن = التحصيل − التكلفة";
export const OWES_LABEL = "مستحق على الصانع";
export const OWES_TIP = "ما يسدّده الصانع لهوميكس في تسليمات البائع";

/** النوع كما يرسله الـ BE؛ الاحتياطي (تقارير قديمة بلا نوع): تسليم مخزن مُسلَّم = هامش وإلا دين */
export const companyDueKindOf = (order: Pick<SettlementOrder, "companyDueKind" | "shipmentId">): CompanyDueKind =>
  order.companyDueKind ?? (order.shipmentId != null ? "margin" : "vendorOwes");

export const kindLabel = (kind: CompanyDueKind): string => (kind === "margin" ? MARGIN_LABEL : OWES_LABEL);
export const kindTip = (kind: CompanyDueKind): string => (kind === "margin" ? MARGIN_TIP : OWES_TIP);

/** مجموع الهامش والمستحق على الصانع من بنود فاتورة (المحسوبة فقط، بالقيم الفعّالة) */
export function splitCompanyDue(lines: Array<{ companyDue: number; companyDueKind?: CompanyDueKind; isWarehouseDelivery?: boolean; state?: string }>): { homixMargin: number; vendorOwes: number } {
  let homixMargin = 0;
  let vendorOwes = 0;
  lines.forEach((line) => {
    if (line.state && line.state !== "included") return;
    const kind = line.companyDueKind ?? (line.isWarehouseDelivery ? "margin" : "vendorOwes");
    if (kind === "margin") homixMargin += Number(line.companyDue) || 0; else vendorOwes += Number(line.companyDue) || 0;
  });
  return { homixMargin: Math.round(homixMargin * 100) / 100, vendorOwes: Math.round(vendorOwes * 100) / 100 };
}
