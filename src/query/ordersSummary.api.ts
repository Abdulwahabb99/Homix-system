import { useQuery } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosRequest from "shared/functions/axiosRequest";
import { forceLogoutAndNavigate } from "shared/functions/sessionGuard";
import { orderKeys } from "query/keys";

export const ORDERS_SUMMARY_PATH = "/orders/summary";

/** معلمات `/orders/summary` — كلها اختيارية؛ لا تُرسَل إذا كانت فارغة */
export type OrdersSummaryParams = {
  orderNumber?: string | null;
  operationCode?: string | null;
  customerName?: string | null;
  productCode?: string | null;
  vendorName?: string | null;
  vendorId?: string | null;
  status?: string | null;
  manufactureStatus?: string | null;
  paymentStatus?: string | null;
  deliveryBy?: string | null;
  shippingCompany?: string | null;
  userId?: number | string | null;
  startDate?: string | null;
  endDate?: string | null;
  priority?: string | null;
  deliveryStatus?: string | null;
};

export type OrderSummaryCardDto = {
  key: string;
  label: string;
  value: number | string;
};

interface ApiOrdersSummaryResponse {
  status?: boolean;
  force_logout?: boolean;
  data?: {
    cards?: unknown;
  };
}

function pickStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s !== "" ? s : undefined;
}

function appendKnownString(qs: URLSearchParams, apiKey: keyof OrdersSummaryParams, value: unknown) {
  const s = pickStr(value);
  if (s) qs.set(apiKey, s);
}

/**
 * بناء سلسلة الاستعلام لـ `/orders/summary` (camelCase كما توثّق الـ API).
 */
export function buildOrdersSummarySearchParams(params: OrdersSummaryParams): string {
  const qs = new URLSearchParams();

  appendKnownString(qs, "orderNumber", params.orderNumber);
  appendKnownString(qs, "operationCode", params.operationCode);
  appendKnownString(qs, "customerName", params.customerName);
  appendKnownString(qs, "productCode", params.productCode);
  appendKnownString(qs, "vendorName", params.vendorName);
  appendKnownString(qs, "vendorId", params.vendorId);
  appendKnownString(qs, "status", params.status);
  appendKnownString(qs, "manufactureStatus", params.manufactureStatus);
  appendKnownString(qs, "paymentStatus", params.paymentStatus);
  appendKnownString(qs, "deliveryBy", params.deliveryBy);
  appendKnownString(qs, "shippingCompany", params.shippingCompany);
  appendKnownString(qs, "startDate", params.startDate);
  appendKnownString(qs, "endDate", params.endDate);
  appendKnownString(qs, "priority", params.priority);
  appendKnownString(qs, "deliveryStatus", params.deliveryStatus);

  const uid = params.userId;
  if (uid != null && uid !== "") {
    const n = Number(uid);
    if (Number.isFinite(n)) qs.set("userId", String(Math.trunc(n)));
  }

  return qs.toString();
}

function normalizeCard(row: unknown): OrderSummaryCardDto | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const label = pickStr(o.label);
  const keyRaw = pickStr(o.key ?? o.cardKey ?? o.id);
  if (!label || !keyRaw) return null;
  const rawVal = o.value;
  let value: number | string =
    typeof rawVal === "number" && Number.isFinite(rawVal)
      ? rawVal
      : pickStr(rawVal) ?? "—";
  return { key: keyRaw, label, value };
}

export async function fetchOrdersSummary(
  params: OrdersSummaryParams,
  navigate: NavigateFunction
): Promise<OrderSummaryCardDto[]> {
  const q = buildOrdersSummarySearchParams(params);
  const url = q ? `${ORDERS_SUMMARY_PATH}?${q}` : ORDERS_SUMMARY_PATH;
  const { data } = await axiosRequest.get(url);

  const root = data as ApiOrdersSummaryResponse;
  if (root.force_logout) {
    forceLogoutAndNavigate(navigate);
    return [];
  }

  const rawCards = root.data?.cards;
  if (!Array.isArray(rawCards)) return [];

  return rawCards.map(normalizeCard).filter((c): c is OrderSummaryCardDto => Boolean(c));
}

export function useOrdersSummaryQuery(filtersKey: string, params: OrdersSummaryParams, enabled = true) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: orderKeys.summary(filtersKey),
    queryFn: () => fetchOrdersSummary(params, navigate),
    enabled,
    staleTime: 20_000,
  });
}
