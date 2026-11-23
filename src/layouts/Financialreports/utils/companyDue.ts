/**
 * عمود واحد «المستحق لهوميكس» = ما يسدّده الصانع لهوميكس بعد أن حصّل المبلغ بنفسه (تسليمات البائع فقط).
 * تسليمات المخزن لا دَين فيها على الصانع (ما تحققه هوميكس منها لا يُعرض): خليتها «—» ولا تدخل أي مجموع.
 * لا يدخل أيٌّ منهما في صافي الفاتورة.
 */
import type { SettlementOrder } from "./types";

export const COMPANY_DUE_LABEL = "المستحق لهوميكس";
export const COMPANY_DUE_TIP = "ما يسدّده الصانع لهوميكس بعد تحصيله المبلغ بنفسه (تسليمات البائع فقط)";

export type CompanyDueKind = "margin" | "vendorOwes";

/** النوع المخزَّن (للحسابات الداخلية فقط، لا يُستخدم في أي تسمية)؛ الاحتياطي: تسليم مخزن = margin وإلا vendorOwes */
export const companyDueKindOf = (order: Pick<SettlementOrder, "companyDueKind" | "shipmentId">): CompanyDueKind =>
  order.companyDueKind ?? (order.shipmentId != null ? "margin" : "vendorOwes");

/** هل يُحسب «المستحق لهوميكس» لهذا البند؟ تسليمات البائع فقط (vendorOwes) */
export const countsTowardCompanyDue = (
  line: { companyDueKind?: CompanyDueKind | null; shipmentId?: number | null; isWarehouseDelivery?: boolean },
): boolean => {
  const kind = line.companyDueKind ?? (line.shipmentId != null || line.isWarehouseDelivery ? "margin" : "vendorOwes");
  return kind === "vendorOwes";
};

/** مجموع المستحق لهوميكس من بنود فاتورة (المحسوبة فقط، بالقيم الفعّالة، تسليمات البائع فقط) */
export function sumCompanyDue(lines: Array<{ companyDue: number; state?: string; companyDueKind?: CompanyDueKind | null; isWarehouseDelivery?: boolean }>): number {
  const total = lines.reduce((t, line) => (
    (line.state && line.state !== "included") || !countsTowardCompanyDue(line) ? t : t + (Number(line.companyDue) || 0)
  ), 0);
  return Math.round(total * 100) / 100;
}
