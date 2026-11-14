import { orderStatusValues } from "layouts/Orders/utils/constants";
import { getShipmentStatusLabel } from "shared/utils/constants";

/**
 * حالة الطلب / الشحنة / التأكيد مرتبطة في الباك إند (order-status-sync): تعديل
 * إحداها يغيّر الباقي. نقارن قيم الصف قبل التعديل وبعد رد الخادم، ونستثني الحقول
 * التي عدّلها المستخدم بنفسه، فما تبقّى هو ما تغيّر تلقائياً.
 */
export type StatusSnapshot = {
  status?: unknown;
  shipmentStatus?: unknown;
  confirmationStatus?: unknown;
};

export type DerivedStatusChange = {
  field: "status" | "shipmentStatus" | "confirmationStatus";
  to: number;
  message: string;
};

const FIELDS = ["status", "shipmentStatus", "confirmationStatus"] as const;

const asNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function getDerivedStatusChanges(
  before: StatusSnapshot | null | undefined,
  after: StatusSnapshot | null | undefined,
  editedFields: string[] = []
): DerivedStatusChange[] {
  if (!before || !after) return [];
  const changes: DerivedStatusChange[] = [];
  for (const field of FIELDS) {
    if (editedFields.includes(field)) continue;
    const next = asNumber(after[field]);
    if (next === null || next === asNumber(before[field])) continue;
    const label =
      field === "status"
        ? (orderStatusValues[next] ?? "").trim()
        : field === "shipmentStatus"
          ? getShipmentStatusLabel(next)
          : "";
    const message =
      field === "status"
        ? `حالة الطلب اتحدثت تلقائيًا لـ «${label}»`
        : field === "shipmentStatus"
          ? `حالة الشحنة اتحدثت تلقائيًا لـ «${label}»`
          : "حالة التأكيد اتحدثت تلقائيًا";
    changes.push({ field, to: next, message });
  }
  return changes;
}
