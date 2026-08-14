import { useQuery } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosRequest from "shared/functions/axiosRequest";
import { forceLogoutAndNavigate } from "shared/functions/sessionGuard";
import { orderKeys } from "query/keys";

export const ORDERS_META_PATH = "/orders/meta";

export interface OrdersMetaAssignee {
  id: number;
  label: string;
}

export interface OrdersMetaIdLabel {
  id: number;
  label: string;
}

export interface OrdersMetaPriority {
  id: string;
  label: string;
}

export interface OrdersMeta {
  assignees: OrdersMetaAssignee[];
  /** خيارات «التوصيل بواسطة» (هوميكس / بائع …) */
  deliveryByOptions: OrdersMetaIdLabel[];
  manufactureStatuses: OrdersMetaIdLabel[];
  /** مصادر الطلب (شو رووم / اونلاين …) */
  orderSources: OrdersMetaIdLabel[];
  paymentStatuses: OrdersMetaIdLabel[];
  priorities: OrdersMetaPriority[];
  statuses: OrdersMetaIdLabel[];
  vendors: OrdersMetaIdLabel[];
}

interface ApiMetaResponse {
  status?: boolean;
  data?: Record<string, unknown>;
  force_logout?: boolean;
}

function pickStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s || undefined;
}

function mapAssignees(raw: unknown): OrdersMetaAssignee[] {
  if (!Array.isArray(raw)) return [];
  const out: OrdersMetaAssignee[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = o.id;
    const label = pickStr(o.label ?? o.name);
    if (id == null || !Number.isFinite(Number(id)) || !label) continue;
    out.push({ id: Number(id), label });
  }
  return out;
}

function mapIdLabelOptions(raw: unknown): OrdersMetaIdLabel[] {
  if (!Array.isArray(raw)) return [];
  const out: OrdersMetaIdLabel[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = o.id ?? o.key;
    const label = pickStr(o.label ?? o.name);
    if (id == null || !Number.isFinite(Number(id)) || !label) continue;
    out.push({ id: Number(id), label });
  }
  return out;
}

function mapPriorities(raw: unknown): OrdersMetaPriority[] {
  if (!Array.isArray(raw)) return [];
  const out: OrdersMetaPriority[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    // نقبل أشكال المفاتيح المختلفة القادمة من الـ API (id/key/value، label/name/text)
    const idRaw = o.id ?? o.key ?? o.value ?? o.deliveryPriority;
    const label = pickStr(o.label ?? o.name ?? o.text ?? o.title ?? o.deliveryPriorityLabel);
    if (idRaw == null || !label) continue;
    out.push({ id: String(idRaw), label });
  }
  return out;
}

function emptyOrdersMeta(): OrdersMeta {
  return {
    assignees: [],
    deliveryByOptions: [],
    manufactureStatuses: [],
    orderSources: [],
    paymentStatuses: [],
    priorities: [],
    statuses: [],
    vendors: [],
  };
}

/** يدعم الحقول بصيغة camelCase أو snake_case */
export function mapApiToOrdersMeta(raw: Record<string, unknown>): OrdersMeta {
  return {
    assignees: mapAssignees(raw.assignees),
    deliveryByOptions: mapIdLabelOptions(
      raw.deliveryByOptions ?? raw.delivery_by_options
    ),
    manufactureStatuses: mapIdLabelOptions(
      raw.manufactureStatuses ?? raw.manufacture_statuses
    ),
    orderSources: mapIdLabelOptions(raw.orderSources ?? raw.order_sources),
    paymentStatuses: mapIdLabelOptions(raw.paymentStatuses ?? raw.payment_statuses),
    priorities: mapPriorities(
      raw.priorities ?? raw.deliveryPriorities ?? raw.delivery_priorities
    ),
    statuses: mapIdLabelOptions(raw.statuses),
    vendors: mapIdLabelOptions(raw.vendors),
  };
}

export async function fetchOrdersMeta(navigate: NavigateFunction): Promise<OrdersMeta> {
  const { data } = await axiosRequest.get<Record<string, unknown>>(ORDERS_META_PATH);

  const root = data as unknown as ApiMetaResponse;
  if (root.force_logout) {
    forceLogoutAndNavigate(navigate);
  }

  const inner = root.data;
  if (!inner || typeof inner !== "object") {
    return emptyOrdersMeta();
  }

  return mapApiToOrdersMeta(inner as Record<string, unknown>);
}

export function useOrdersMeta(enabled = true) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: orderKeys.meta(),
    queryFn: () => fetchOrdersMeta(navigate),
    staleTime: 30_000,
    enabled,
  });
}

/** تجهيز قائمة البائعين للفلتر (هوميكس اختياري + من الـ meta) */
export function mergeHomixVendorOptions(
  metaVendors: OrdersMetaIdLabel[],
  homixLabel = "هوميكس",
  homixValue = "0"
): { label: string; value: string }[] {
  const fromMeta = metaVendors.map((v) => ({ label: v.label, value: String(v.id) }));
  const hasZero = fromMeta.some((v) => v.value === homixValue);
  if (hasZero) return fromMeta;
  return [{ label: homixLabel, value: homixValue }, ...fromMeta];
}
