/**
 * دوال مساعدة نقية لصفحة تفاصيل الطلب (تنسيق، اشتقاق أسماء/وسوم…).
 * لا تحتوي على JSX — قابلة لإعادة الاستخدام والاختبار.
 */
import type React from "react";
import CheckIcon from "@mui/icons-material/Check";
import ScheduleIcon from "@mui/icons-material/Schedule";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { OD } from "./odTheme";

/** تنسيق مبلغ بالجنيه بدون كسور — "12,200" */
export function formatMoney(value: unknown): string {
  return Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** اسم صاحب التعليق — يدعم أشكال الـ API المختلفة (user / createdBy / author / userName)،
    ومع وجود userId فقط يُستخرج الاسم من قائمة المستخدمين. */
export function resolveCommenterName(comment: any, users: any[]): string {
  const p = comment?.user ?? comment?.createdBy ?? comment?.author ?? {};
  const nested =
    [p.firstName ?? p.first_name, p.lastName ?? p.last_name].filter(Boolean).join(" ").trim() ||
    (typeof p.name === "string" ? p.name.trim() : "") ||
    (typeof p.fullName === "string" ? p.fullName.trim() : "");
  if (nested) return nested;

  const flat = comment?.userName ?? comment?.authorName ?? comment?.createdByName;
  if (typeof flat === "string" && flat.trim()) return flat.trim();

  const uid =
    comment?.userId ?? comment?.user?.id ?? comment?.createdBy?.id ?? comment?.authorUserId;
  if (uid != null && Array.isArray(users)) {
    const u = users.find((x) => String(x.id) === String(uid));
    if (u) {
      const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
      if (name) return name;
    }
  }
  return "—";
}

/** الأحرف الأولى من الاسم (حتى حرفين) للأفاتار */
export function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

/** أيقونة/لون حدث سجل الأحداث حسب نوعه */
export function timelineEventStyle(eventType: string): {
  bg: string;
  color: string;
  Icon: React.ElementType;
} {
  switch (eventType) {
    case "order_received":
      return { bg: OD.gl, color: OD.green, Icon: CheckIcon };
    case "notification_sent":
      return { bg: OD.bl, color: OD.blue, Icon: NotificationsNoneOutlinedIcon };
    default:
      return { bg: OD.al, color: OD.accent, Icon: ScheduleIcon };
  }
}

/** "٥ يوليو ٢٠٢٦، ١:٠٠ ص" — تنسيق عربي لوقت الحدث */
export function formatEventTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** وسوم بطاقة المنتج (المقاس/اللون/الخامة/النوع/SKU) */
export function buildProductLineTags(order: any): string[] {
  return [
    order?.size && `📐 ${order.size}`,
    order?.color && `🎨 ${order.color}`,
    order?.material && order.material,
    order?.product?.type?.name,
    order?.sku && `SKU ${order.sku}`,
  ].filter(Boolean) as string[];
}

/** اسم العميل المعروض من الحقول المختلفة (name أو firstName+lastName) */
export function getCustomerDisplayName(customer: any): string {
  if (!customer) return "";
  return (
    customer.name ?? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`
  )
    .toString()
    .trim();
}
