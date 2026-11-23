/**
 * إجراءات الطلب على الصف الحي (تجميد / حذف / تحويل لدورة أخرى / إضافة طلب) — دوال نقية.
 * القواعد تطابق قائمة نافذة الفاتورة؛ الخادم هو الحَكَم (يُنشئ المسودة تلقائياً ويرفض غير المسودات بـ 409).
 */
import type { LineAction } from "query/financialInvoices";
import type { LiveEditContext } from "./liveOverlay";
import type { LiveLineState, SettlementSeller } from "./types";

export interface LiveActionItem {
  action: LineAction;
  label: string;
  danger?: boolean;
  /** يطلب تأكيداً قبل التنفيذ */
  confirm?: boolean;
  /** يسأل عن سبب (اختياري) */
  askReason?: boolean;
}

const DEFER: LiveActionItem = { action: "defer", label: "تحويل لدورة أخرى", askReason: true };
const FREEZE: LiveActionItem = { action: "freeze", label: "تجميد الطلب", askReason: true };
const UNFREEZE: LiveActionItem = { action: "unfreeze", label: "فك التجميد" };
const RESTORE: LiveActionItem = { action: "restore", label: "رجّعه للفاتورة دي" };
const REMOVE: LiveActionItem = { action: "delete", label: "حذف من الفاتورة", danger: true, confirm: true, askReason: true };

/** الإجراءات المتاحة لحالة بند الطلب. بلا فاتورة/«غير مضمّن» = كأنه محسوب (الخادم يُنشئ المسودة ويضمّنه). */
export function liveActionsFor(state: LiveLineState | undefined): LiveActionItem[] {
  switch (state) {
    case undefined:
    case "included":
    case "missing": return [DEFER, FREEZE, REMOVE];
    case "frozen": return [UNFREEZE, DEFER, REMOVE];
    case "deferred": return [RESTORE, REMOVE];
    default: return []; // removed = نهائي
  }
}

export interface LiveActionsAvailability {
  /** الزر/القائمة موجود أصلاً (موظف بصلاحية التسوية على دورة فوترة) */
  visible: boolean;
  /** يمكن تنفيذه الآن */
  enabled: boolean;
  reason?: string;
}

/** هل تظهر إجراءات الطلب لهذا الصانع الآن؟ مسودة أو بلا فاتورة فقط؛ المقفلة تبقى بلا إجراءات (مسار «رجوع لمعلّقة») */
export function liveActionsAvailability(seller: Pick<SettlementSeller, "invoice">, ctx: LiveEditContext): LiveActionsAvailability {
  if (ctx.isVendor || !ctx.canSettle || ctx.cycleState === "custom") return { visible: false, enabled: false };
  if (ctx.invoicesState === "loading") return { visible: true, enabled: false, reason: "جارٍ تحميل حالة الفواتير..." };
  if (ctx.invoicesState !== "ready") return { visible: true, enabled: false, reason: "تعذّر تحميل حالة الفواتير" };
  const invoice = seller.invoice;
  if (invoice && invoice.status !== "draft") {
    return {
      visible: true, enabled: false,
      reason: invoice.status === "reviewed"
        ? "الفاتورة تمت مراجعتها — استرجعها لمسودة (رجوع لمعلّقة) للتعديل"
        : `الفاتورة ${invoice.statusLabel} — أرجعها إلى «معلّقة» أولاً للتعديل`,
    };
  }
  return { visible: true, enabled: true };
}

const TOASTS: Record<LineAction, string> = {
  defer: "اتحوّل الطلب لدورة أخرى",
  delete: "اتحذف الطلب من الفاتورة",
  freeze: "اتجمّد الطلب",
  restore: "رجع الطلب للفاتورة",
  unfreeze: "اتفك تجميد الطلب",
};

export const liveActionToast = (action: LineAction): string => TOASTS[action];
export const LIVE_ADD_ORDER_TOAST = "اتضاف الطلب للفاتورة";
export const LIVE_ADD_ORDER_EXISTS_TOAST = "الطلب موجود بالفعل في الفاتورة";
