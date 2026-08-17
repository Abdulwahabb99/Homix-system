/**
 * يجمع خيارات قوائم حالة الطلب من الـ meta مع ثوابت محلية احتياطية:
 * حالة الطلب، حالة التصنيع، المسؤول (من /users)، حالة التأخير، مكان التسليم.
 */
import { useMemo } from "react";
import { useOrdersMeta } from "query/ordersMeta.api";
import { manufactureStatusOptions } from "shared/utils/constants";
import { DELIVERY_STATUS, statusoptions } from "layouts/Orders/utils/constants";
import { DELIVERY_BY_OPTIONS, SHIPMENT_TYPE_OPTIONS } from "../constants";

export interface SelectOption {
  value: number | string;
  label: string;
}

export interface OrderStatusOptions {
  orderStatusOptions: SelectOption[];
  manufactureOptions: SelectOption[];
  assigneeOptions: SelectOption[];
  deliveryStatusOptions: SelectOption[];
  deliveryByOptions: SelectOption[];
  shipmentTypeOptions: SelectOption[];
}

export function useOrderStatusOptions(users: any[]): OrderStatusOptions {
  const metaQuery = useOrdersMeta();

  /* «حالة التصنيع» من meta.manufactureStatuses؛ الثابت المحلي احتياطي */
  const manufactureOptions = useMemo(() => {
    const fromMeta = metaQuery.data?.manufactureStatuses;
    return fromMeta?.length
      ? fromMeta.map((s) => ({ value: s.id, label: s.label }))
      : manufactureStatusOptions;
  }, [metaQuery.data]);

  /* «حالة الطلب» من meta.statuses؛ الثابت المحلي احتياطي */
  const orderStatusOptions = useMemo(() => {
    const fromMeta = metaQuery.data?.statuses;
    return fromMeta?.length
      ? fromMeta.map((s) => ({ value: s.id, label: s.label }))
      : statusoptions;
  }, [metaQuery.data]);

  const deliveryByOptions = useMemo(() => {
    const fromMeta = metaQuery.data?.deliveryByOptions;
    return fromMeta?.length
      ? fromMeta.map((option) => ({ value: Number(option.id), label: option.label }))
      : DELIVERY_BY_OPTIONS;
  }, [metaQuery.data]);

  /* «المسؤول» من users API (endpoint /users) مباشرةً */
  const assigneeOptions = useMemo(
    () =>
      (users ?? []).map((u: any) => ({
        value: Number(u.id),
        label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || String(u.id),
      })),
    [users]
  );

  return {
    orderStatusOptions,
    manufactureOptions,
    assigneeOptions,
    deliveryStatusOptions: DELIVERY_STATUS,
    deliveryByOptions,
    shipmentTypeOptions: SHIPMENT_TYPE_OPTIONS,
  };
}
