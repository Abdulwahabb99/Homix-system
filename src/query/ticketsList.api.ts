import { useQuery } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosRequest from "shared/functions/axiosRequest";
import type { Attachment, ChatMessage, Ticket } from "layouts/Tickets/utils/constants";
import { ticketKeys } from "query/keys";

/**
 * مسار جلب قائمة التذاكر — يُرسل كـ query: `page`, `size`
 */
export const TICKETS_LIST_PATH = "/tickets";

/* ── شكل الاستجابة من الـ backend ───────────────────────────────────────── */

export interface TicketsSummary {
  averageResolutionDays: number;
  closed: number;
  open: number;
  overdueOpen: number;
  total: number;
}

export interface TicketsListEnvelope {
  items: Record<string, unknown>[];
  page: number;
  size: number;
  summary: TicketsSummary;
  totalCount: number;
}

export interface ApiListResponse {
  status?: boolean;
  data?: TicketsListEnvelope;
  force_logout?: boolean;
}

export interface TicketsListResult {
  items: Ticket[];
  page: number;
  size: number;
  totalCount: number;
  summary: TicketsSummary;
}

/* ── تحويل عنصر الـ API → Ticket (واجهة الصفحة) ───────────────────────── */

function mapApiItemToTicket(raw: Record<string, unknown>): Ticket {
  const order =
    raw.order && typeof raw.order === "object"
      ? (raw.order as Record<string, unknown>)
      : {};
  const assignedTo =
    raw.assignedTo && typeof raw.assignedTo === "object"
      ? (raw.assignedTo as Record<string, unknown>)
      : {};

  const first = String(assignedTo.firstName ?? "").trim();
  const last = String(assignedTo.lastName ?? "").trim();
  const resp = [first, last].filter(Boolean).join(" ") || "—";

  const statusLabel = String(raw.statusLabel ?? "");
  let status: Ticket["status"] = "مفتوحة";
  if (statusLabel.includes("مغلق") || Number(raw.status) === 2) {
    status = "مغلقة";
  }

  const createdAt = raw.createdAt != null ? String(raw.createdAt) : "";
  const closedAt = raw.closedAt;

  const chat: ChatMessage[] = Array.isArray(raw.chat) ? (raw.chat as ChatMessage[]) : [];
  const attachments: Attachment[] = Array.isArray(raw.attachments)
    ? (raw.attachments as Attachment[])
    : [];

  return {
    id: String(raw.id ?? ""),
    op: String(order.operationNumber ?? ""),
    order: String(order.orderNumber ?? ""),
    code: String(order.productSku ?? ""),
    seller: String(order.sellerName ?? ""),
    type: String(raw.typeLabel ?? raw.type ?? ""),
    openDate: createdAt ? createdAt.slice(0, 10) : "",
    closeDate:
      closedAt == null || closedAt === ""
        ? "—"
        : String(closedAt).slice(0, 10),
    days: Number(raw.daysOpen ?? 0),
    status,
    resp,
    adminReply: String(raw.assigneeReply ?? ""),
    ownerReply: String(raw.creatorReply ?? ""),
    notes: String(raw.notes ?? ""),
    chat,
    attachments,
  };
}

function emptySummary(): TicketsSummary {
  return {
    averageResolutionDays: 0,
    closed: 0,
    open: 0,
    overdueOpen: 0,
    total: 0,
  };
}

export async function fetchTicketsList(
  navigate: NavigateFunction,
  params: { page: number; pageSize: number }
): Promise<TicketsListResult> {
  const { data } = await axiosRequest.get<TicketsListEnvelope & { force_logout?: boolean }>(
    TICKETS_LIST_PATH,
    {
      params: {
        page: params.page,
        size: params.pageSize,
      },
    }
  );

  const root = data as unknown as ApiListResponse;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }

  const inner = root.data;
  if (!inner || !Array.isArray(inner.items)) {
    return {
      items: [],
      page: params.page,
      size: params.pageSize,
      totalCount: 0,
      summary: emptySummary(),
    };
  }

  const items = inner.items
    .map((row) => mapApiItemToTicket(row))
    .filter((t) => t.id);

  return {
    items,
    page: inner.page,
    size: inner.size,
    totalCount: inner.totalCount,
    summary: inner.summary ?? emptySummary(),
  };
}

export interface UseTicketsListParams {
  /** صفحة السيرفر (تبدأ من 1 عادةً) */
  page: number;
  pageSize: number;
  /** تعطيل الجلب (مثلاً أثناء شاشة تفاصيل) */
  enabled?: boolean;
}

export function useTicketsList({ page, pageSize, enabled = true }: UseTicketsListParams) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ticketKeys.list(page, pageSize),
    queryFn: () => fetchTicketsList(navigate, { page, pageSize }),
    staleTime: 30_000,
    enabled,
  });
}
