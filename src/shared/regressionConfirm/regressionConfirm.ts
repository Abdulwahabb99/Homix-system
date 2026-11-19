/**
 * تأكيد «الرجوع بحالة الطلب»: الباك إند يردّ بـ 409 REGRESSION_NEEDS_CONFIRMATION
 * على PUT /orders/:id و PUT /orders/bulk-update، وتُعاد نفس الطلب مع
 * `confirmRegression: true` في أعلى الجسم. للبائع 403 REGRESSION_FORBIDDEN (لا تأكيد).
 */
export const REGRESSION_NEEDS_CONFIRMATION = "REGRESSION_NEEDS_CONFIRMATION";
export const REGRESSION_FORBIDDEN = "REGRESSION_FORBIDDEN";

export type RegressionChange = {
  field: string;
  fieldLabel: string;
  from: unknown;
  fromLabel?: string;
  to: unknown;
  toLabel?: string;
  origin?: "explicit" | "derived";
};

export type RegressionItem = {
  orderId: number | string;
  orderNumber?: string | number;
  reasons: string[];
  reasonLabels: string[];
  changes: RegressionChange[];
};

export type RegressionConflict = {
  message: string;
  regressions: RegressionItem[];
};

/** يُرفض به الوعد عندما يضغط المستخدم «إلغاء» في نافذة التأكيد. */
export class RegressionCancelledError extends Error {
  constructor() {
    super("REGRESSION_CANCELLED");
    this.name = "RegressionCancelledError";
  }
}

export function isRegressionCancelled(error: unknown): boolean {
  return error instanceof RegressionCancelledError;
}

function asResponse(error: any): { status?: number; data?: any } {
  return { status: error?.response?.status, data: error?.response?.data };
}

/** يعيد تفاصيل التعارض إن كان الخطأ 409 REGRESSION_NEEDS_CONFIRMATION، وإلا null. */
export function parseRegressionConflict(error: unknown): RegressionConflict | null {
  const { status, data } = asResponse(error);
  if (status !== 409 || data?.code !== REGRESSION_NEEDS_CONFIRMATION) return null;
  const raw = Array.isArray(data?.details?.regressions) ? data.details.regressions : [];
  const regressions: RegressionItem[] = raw.map((r: any) => ({
    orderId: r?.orderId,
    orderNumber: r?.orderNumber,
    reasons: Array.isArray(r?.reasons) ? r.reasons : [],
    reasonLabels: Array.isArray(r?.reasonLabels) ? r.reasonLabels : [],
    changes: Array.isArray(r?.changes) ? r.changes : [],
  }));
  return { message: typeof data?.message === "string" ? data.message : "", regressions };
}

export function isRegressionForbidden(error: unknown): boolean {
  const { status, data } = asResponse(error);
  return status === 403 && data?.code === REGRESSION_FORBIDDEN;
}

/** نفس الجسم مع `confirmRegression: true` في أعلاه (للتعديل الفردي والجماعي). */
export function withConfirmRegression<T extends Record<string, any>>(
  body: T,
  confirm: boolean
): T | (T & { confirmRegression: true }) {
  return confirm ? { ...body, confirmRegression: true } : body;
}

function display(label: unknown, raw: unknown): string {
  if (typeof label === "string" && label !== "") return label;
  if (raw == null || raw === "") return "—";
  return String(raw);
}

/** «حقل: من ← إلى» */
export function formatRegressionChange(change: RegressionChange): string {
  return `${change.fieldLabel || change.field}: ${display(change.fromLabel, change.from)} ← ${display(
    change.toLabel,
    change.to
  )}`;
}

/** رسالة الخطأ للمستخدم: تفضّل رسالة الـ API (تشمل 403 REGRESSION_FORBIDDEN). */
export function getRegressionAwareErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

/** true عند 409 REGRESSION_NEEDS_CONFIRMATION (يُعالَج بنافذة التأكيد فلا يُعرض كخطأ). */
export function isRegressionConflict(error: unknown): boolean {
  return parseRegressionConflict(error) !== null;
}

/**
 * رسالة toast للخطأ: لـ 403 REGRESSION_FORBIDDEN رسالة الـ API العربية، وإلا `fallback`.
 * تُرجع null عند 409 (نافذة التأكيد تتولّاه) فلا يُعرض شيء.
 */
export function getRegressionToastMessage(error: unknown, fallback: string): string | null {
  if (isRegressionConflict(error)) return null;
  if (isRegressionForbidden(error)) {
    const message = (error as any)?.response?.data?.message;
    if (typeof message === "string" && message !== "") return message;
  }
  return fallback;
}
