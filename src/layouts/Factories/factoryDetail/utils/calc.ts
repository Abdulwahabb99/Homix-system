/**
 * مساعدات خاصة بصفحة تفاصيل المصنع. المساعدات المشتركة (fmt / money / initials /
 * specPalette) تُستورد من `layouts/Factories/utils/calc`.
 */
import type { FactoryDocument } from "query/factoryDetail";
import type { AttStatusTone } from "./styles";

/** تاريخ عربي مطوّل بأرقام لاتينية — «15 يناير 2024» */
export function fmtLongDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** امتداد الملف من اسمه (بلا نقطة، بحروف صغيرة) */
export function fileExtension(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(String(name ?? "").trim());
  return match ? match[1].toLowerCase() : "";
}

/** رمز تعبيري بحسب نوع الملف — نفس منطق التصميم */
export function fileEmoji(name: string): string {
  const ext = fileExtension(name);
  if (ext === "pdf") return "📄";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "🖼️";
  return "📎";
}

/** خلفية أيقونة الملف — تدرّج ثابت بحسب نوع المستند */
const ICON_BACKGROUNDS = ["#fff3e0", "#e8f5e9", "#e3f2fd", "#f3e5f5", "#fce4ec"];

export function documentIconBg(typeId: number | null | undefined): string {
  if (typeId == null) return ICON_BACKGROUNDS[2];
  return ICON_BACKGROUNDS[Math.abs(typeId) % ICON_BACKGROUNDS.length];
}

/**
 * نبرة شارة حالة المستند. الانتهاء يسبق حالة التوثيق: مستند موثّق لكن منتهي
 * يجب أن يظهر أحمر لا أخضر.
 */
export function documentStatusTone(doc: FactoryDocument): AttStatusTone {
  if (isExpired(doc.expiresAt)) return "expired";
  const label = (doc.verificationStatusLabel ?? "").trim();
  // الـ API يرسل التسمية جاهزة؛ نستدل على «موثّق» منها أو من المعرّف الأعلى
  if (/موثق|موثّق|verified/i.test(label)) return "verified";
  return "pending";
}

/** هل انتهى المستند؟ (تاريخ الانتهاء قبل اليوم) */
export function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

/** نص شارة الحالة مع رمزها */
export function documentStatusLabel(doc: FactoryDocument): string {
  if (isExpired(doc.expiresAt)) return "منتهي";
  return (doc.verificationStatusLabel ?? "").trim() || "قيد المراجعة";
}

/** يجزّئ رقم الحساب لمجموعات رباعية لسهولة القراءة */
export function groupAccountNumber(value: string): string {
  const digits = String(value ?? "").replace(/\s+/g, "");
  if (!digits) return "";
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
