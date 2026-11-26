/**
 * يبني حمولة PUT /shipments/bulk-update من اختيارات شريط التحديد الجماعي.
 * كل حقل اختياري ويُرسل فقط ما اختاره المستخدم.
 */
import type { BulkUpdateShipmentPayload } from "query/shipmentEdit";
import { cairoDayStartIso } from "./panels/accountsDates";

/** قيمة خاصة في القوائم تعني «تفريغ الحقل» (تُرسل null للخادم). */
export const BULK_CLEAR = "__clear__";

export interface ShipmentsBulkSelection {
  sched: string;
  /** تاريخ الجدولة YYYY-MM-DD */
  date: string;
  /** تاريخ التوصيل الفعلي YYYY-MM-DD */
  deliveryDate: string;
  carrier: string;
  status: string;
}

export function buildShipmentsBulkPayload(sel: ShipmentsBulkSelection): BulkUpdateShipmentPayload {
  const data: BulkUpdateShipmentPayload = {};
  if (sel.sched) data.scheduleStatus = sel.sched === BULK_CLEAR ? null : Number(sel.sched);
  if (sel.date) data.scheduledDeliveryDate = cairoDayStartIso(sel.date);
  if (sel.deliveryDate) {
    const iso = cairoDayStartIso(sel.deliveryDate);
    if (iso) data.deliveryDate = iso;
  }
  if (sel.carrier) data.shippingCompany = sel.carrier === BULK_CLEAR ? null : Number(sel.carrier);
  if (sel.status) data.shipmentStatus = Number(sel.status);
  return data;
}
