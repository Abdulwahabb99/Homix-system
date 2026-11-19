/**
 * عمود واحد «المستحق لهوميكس» = ما تستحقه هوميكس:
 * حصة هوميكس في تسليمات المخزن (التحصيل − التكلفة)، أو ما يسدّده الصانع لهوميكس في تسليمات البائع.
 * الحالتان مبلغ مستحق لهوميكس فيُعرضان في عمود واحد؛ ولا يدخل أيٌّ منهما في صافي الفاتورة.
 */
import type { SettlementOrder } from "./types";

export const COMPANY_DUE_LABEL = "المستحق لهوميكس";
export const COMPANY_DUE_TIP = "ما تستحقه هوميكس = التحصيل − التكلفة (تسليمات المخزن)، أو ما يسدّده الصانع لهوميكس (تسليمات البائع)";

export type CompanyDueKind = "margin" | "vendorOwes";

/** النوع المخزَّن (للحسابات الداخلية فقط، لا يُستخدم في أي تسمية)؛ الاحتياطي: تسليم مخزن = margin وإلا vendorOwes */
export const companyDueKindOf = (order: Pick<SettlementOrder, "companyDueKind" | "shipmentId">): CompanyDueKind =>
  order.companyDueKind ?? (order.shipmentId != null ? "margin" : "vendorOwes");

/** مجموع المستحق لهوميكس من بنود فاتورة (المحسوبة فقط، بالقيم الفعّالة) */
export function sumCompanyDue(lines: Array<{ companyDue: number; state?: string }>): number {
  const total = lines.reduce((t, line) => (line.state && line.state !== "included" ? t : t + (Number(line.companyDue) || 0)), 0);
  return Math.round(total * 100) / 100;
}
