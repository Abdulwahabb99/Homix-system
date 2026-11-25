/** المعرّف الذي تُعرض به الشحنات التي لا تحمل حالة (NULL في قاعدة البيانات) — «معلقة». */
export const SHIPMENT_STATUS_PENDING_ID = 1;

/**
 * NULL / 0 / غير رقمي / معرّف غير معروف → «معلقة» (1)، كما يفعل الخادم
 * (COALESCE(shipmentStatus, 1)). `knownIds` اختياري للتحقق من المعرّفات.
 */
export function normalizeShipmentStatusId(value: unknown, knownIds?: ReadonlyArray<number>): number {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  if (!Number.isInteger(n) || n <= 0) return SHIPMENT_STATUS_PENDING_ID;
  if (knownIds && !knownIds.includes(n)) return SHIPMENT_STATUS_PENDING_ID;
  return n;
}

/** القائمة المنسدلة لحالة الشحنة للموظفين فقط؛ البائع يرى شارة للقراءة فقط. */
export function canEditShipmentStatusInline(isVendor: boolean): boolean {
  return !isVendor;
}
