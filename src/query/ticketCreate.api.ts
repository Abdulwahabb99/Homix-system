import type { NavigateFunction } from "react-router-dom";
import type { Ticket } from "layouts/Tickets/utils/constants";
import axiosRequest from "shared/functions/axiosRequest";
import {
  TICKETS_LIST_PATH,
  mapApiItemToTicket,
} from "query/ticketsList.api";

/**
 * GET — بحث طلب لربطه بتذكرة جديدة.
 * صار البحث على نقطتَي نهاية منفصلتين: لكل معرّف مساره ومعامله الخاص.
 */
const TICKETS_ORDERS_LOOKUP_BASE = "/tickets/orders/lookup";
/** `?operationNumber=` */
const LOOKUP_BY_OPERATION_PATH = `${TICKETS_ORDERS_LOOKUP_BASE}/operation-number`;
/** `?orderNumber=` */
const LOOKUP_BY_ORDER_PATH = `${TICKETS_ORDERS_LOOKUP_BASE}/order-number`;

interface ApiEnvelope {
  status?: boolean;
  data?: unknown;
  force_logout?: boolean;
}

export type CreateTicketPayload = {
  orderId: number;
  type: number;
  assignedToUserId: number;
  notes: string;
};

export type ResolvedOrderForTicket = {
  orderId: number;
  orderNumber: string;
  operationNumber: string;
  code: string;
  seller: string;
  /** من `/tickets/orders/lookup` عند التوفر */
  customerName?: string;
};

import { forceLogoutAndNavigate } from "shared/functions/sessionGuard";

function checkLogout(navigate: NavigateFunction, root: ApiEnvelope): void {
  if (root.force_logout) {
    forceLogoutAndNavigate(navigate);
  }
}

function mapLookupPayloadToResolved(rec: Record<string, unknown>): ResolvedOrderForTicket | null {
  const id = Number(rec.id);
  if (!Number.isFinite(id)) return null;
  const sku = String(rec.productSku ?? "").trim();
  const seller = String(rec.sellerName ?? "").trim();
  const op = String(rec.operationNumber ?? "").trim();
  const customer = String(rec.customerName ?? "").trim();
  return {
    orderId: id,
    orderNumber: String(rec.orderNumber ?? ""),
    operationNumber: op,
    code: sku || "—",
    seller: seller || "—",
    ...(customer ? { customerName: customer } : {}),
  };
}

/**
 * جلب طلب لربطه بتذكرة جديدة عبر GET `/tickets/orders/lookup`.
 * يُرسل `orderNumber` (رقم الطلب) و/أو `operationNumber` (رقم العملية) حسب حقل البحث.
 */
export type OrderLookupParams = {
  /** بحث بـ رقم الطلب → ?orderNumber= */
  orderNumber?: string;
  /** بحث بـ رقم العملية → ?operationNumber= */
  operationNumber?: string;
};

export async function resolveOrderForNewTicket(
  navigate: NavigateFunction,
  input: OrderLookupParams
): Promise<ResolvedOrderForTicket | null> {
  const orderNumber = input.orderNumber?.trim();
  const operationNumber = input.operationNumber?.replace(/^OP-?/i, "").trim();

  /**
   * كل معرّف له نقطة نهاية مستقلّة، فلا يمكن إرسال الاثنين معاً.
   * عند تعبئة الحقلين يفوز رقم العملية لأنه الأدقّ (يحدّد سطر طلب بعينه).
   */
  let path: string;
  let params: Record<string, string>;
  if (operationNumber) {
    path = LOOKUP_BY_OPERATION_PATH;
    params = { operationNumber };
  } else if (orderNumber) {
    path = LOOKUP_BY_ORDER_PATH;
    params = { orderNumber };
  } else {
    return null;
  }

  let data: Record<string, unknown>;
  try {
    ({ data } = await axiosRequest.get<Record<string, unknown>>(path, { params }));
  } catch (error) {
    // رقم غير موجود يعود 404 — نُرجع null ليعرض النموذج «لم يتم العثور» لا خطأ عام
    if ((error as { response?: { status?: number } })?.response?.status === 404) return null;
    throw error;
  }

  const root = data as unknown as ApiEnvelope;
  checkLogout(navigate, root);
  if (root.status === false) return null;
  const inner = root.data;
  if (!inner || typeof inner !== "object") return null;
  return mapLookupPayloadToResolved(inner as Record<string, unknown>);
}

/** POST /tickets */
export async function createTicket(
  navigate: NavigateFunction,
  payload: CreateTicketPayload
): Promise<Ticket> {
  const { data } = await axiosRequest.post<Record<string, unknown>>(TICKETS_LIST_PATH, payload);
  const root = data as unknown as ApiEnvelope;
  checkLogout(navigate, root);
  const inner = root.data;
  if (!inner || typeof inner !== "object") {
    throw new Error("CREATE_TICKET_INVALID_RESPONSE");
  }
  const ticket = mapApiItemToTicket(inner as Record<string, unknown>);
  if (!ticket.id) throw new Error("CREATE_TICKET_INVALID_RESPONSE");
  return ticket;
}
