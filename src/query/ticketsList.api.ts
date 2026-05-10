import { useQuery } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosRequest from "shared/functions/axiosRequest";
import type { Attachment, ChatMessage, Ticket } from "layouts/Tickets/utils/constants";
import { ticketKeys } from "query/keys";

/**
 * مسار جلب قائمة التذاكر — query params (جميعها اختيارية ما عدا page/size من الواجهة):
 * page, size, assignedToUserId, operationNumber, orderNumber, startDate, endDate, status, type
 */
export const TICKETS_LIST_PATH = "/tickets";
export const TICKETS_META_PATH = "/tickets/meta";

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

export interface ApiSingleTicketResponse {
  status?: boolean;
  data?: Record<string, unknown>;
  force_logout?: boolean;
}

/** غلاف استجابة قائمة التذاكر من الـ API */
export interface ApiTicketsListResponse {
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

/** فلاتر الـ API لـ GET /tickets — القيم غير المحددة لا تُرسل */
export interface TicketsListFilters {
  assignedToUserId?: number;
  operationNumber?: string;
  orderNumber?: string;
  startDate?: string;
  endDate?: string;
  /** حسب الباكند، مثال: 1 مفتوحة، 2 مغلقة */
  status?: number;
  type?: number;
}

/** مفتاح ثابت لـ React Query من الفلاتر */
export function serializeTicketsListFilters(f: TicketsListFilters): string {
  const o = {
    a: f.assignedToUserId ?? null,
    o: f.operationNumber ?? null,
    n: f.orderNumber ?? null,
    s0: f.startDate ?? null,
    s1: f.endDate ?? null,
    st: f.status ?? null,
    ty: f.type ?? null,
  };
  return JSON.stringify(o);
}

function buildTicketsListQueryParams(
  page: number,
  pageSize: number,
  filters: TicketsListFilters | undefined
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page,
    size: pageSize,
  };
  if (!filters) return params;

  if (filters.assignedToUserId != null && Number.isFinite(filters.assignedToUserId)) {
    params.assignedToUserId = filters.assignedToUserId;
  }
  if (filters.operationNumber?.trim()) {
    params.operationNumber = filters.operationNumber.trim();
  }
  if (filters.orderNumber?.trim()) {
    params.orderNumber = filters.orderNumber.trim();
  }
  if (filters.startDate?.trim()) {
    params.startDate = filters.startDate.trim();
  }
  if (filters.endDate?.trim()) {
    params.endDate = filters.endDate.trim();
  }
  if (filters.status != null && Number.isFinite(filters.status)) {
    params.status = filters.status;
  }
  if (filters.type != null && Number.isFinite(filters.type)) {
    params.type = filters.type;
  }

  return params;
}

/** قيم `status` في الـ API — يجب أن تتطابق مع الباكند */
export function ticketStatusUiToApi(statusLabel: string): number | undefined {
  const s = statusLabel.trim();
  if (s === "مفتوحة") return 1;
  if (s === "مغلقة") return 2;
  return undefined;
}

/**
 * تحويل عنوان نوع التذكرة إلى `type` (integer) كما يُنتظر في الـ query.
 * يُفترض أن ترتيب `orderedTypes` يطابق أرقام الأنواع 1..N في السيرفر.
 */
export function ticketTypeLabelToApiType(label: string, orderedTypes: string[]): number | undefined {
  const i = orderedTypes.indexOf(label.trim());
  if (i < 0) return undefined;
  return i + 1;
}

/** إحصائيات البلاطات + خيارات الفلاتر — من `GET /tickets/meta` (داخل `data`) */
export interface TicketMetaAssignee {
  id: number;
  firstName: string;
  lastName: string;
}

export interface TicketMetaOption {
  key: number;
  label: string;
}

export interface TicketsMeta {
  /** الأرقام التالية تُعرض في البلاطات فقط إذا أرجعها السيرفر ضمن نفس الـ meta */
  total?: number;
  open?: number;
  closed?: number;
  overdueOpen?: number;
  averageResolutionDays?: number;
  openBeyond3Days?: number;
  newTicketsWeekDelta?: number;
  totalSubtitle?: string;
  openSubtitle?: string;
  closedSubtitle?: string;
  averageSubtitle?: string;
  overdueSubtitle?: string;
  assignees: TicketMetaAssignee[];
  statuses: TicketMetaOption[];
  types: TicketMetaOption[];
}

export function formatTicketMetaAssigneeName(a: TicketMetaAssignee): string {
  return [a.firstName, a.lastName].filter(Boolean).join(" ").trim() || "—";
}

export function ticketsMetaHasKpi(m: TicketsMeta | null | undefined): boolean {
  if (!m) return false;
  return (
    m.total != null ||
    m.open != null ||
    m.closed != null ||
    m.overdueOpen != null ||
    m.averageResolutionDays != null
  );
}

export interface ApiMetaResponse {
  status?: boolean;
  data?: Record<string, unknown>;
  force_logout?: boolean;
}

/* ── تحويل عنصر الـ API → Ticket (قائمة أو تفاصيل) ───────────────────────── */

/** notesList من تفاصيل التذكرة → رسائل المحادثة (مرتبة من الأقدم للأحدث) */
function mapNotesListToChat(raw: Record<string, unknown>): ChatMessage[] | null {
  const list = raw.notesList;
  if (!Array.isArray(list) || list.length === 0) return null;

  const createdBy =
    raw.createdBy && typeof raw.createdBy === "object"
      ? (raw.createdBy as Record<string, unknown>)
      : {};
  const assignedTo =
    raw.assignedTo && typeof raw.assignedTo === "object"
      ? (raw.assignedTo as Record<string, unknown>)
      : {};
  const createdById = Number(createdBy.id);
  const assignedToId = Number(assignedTo.id);

  const sorted = [...list].sort((a, b) => {
    const oa = a && typeof a === "object" ? (a as Record<string, unknown>) : {};
    const ob = b && typeof b === "object" ? (b as Record<string, unknown>) : {};
    return String(oa.createdAt ?? "").localeCompare(String(ob.createdAt ?? ""));
  });

  return sorted.map((item) => {
    const n = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const text = String(n.text ?? n.message ?? "").trim();
    const created = String(n.createdAt ?? "");
    const u = n.user && typeof n.user === "object" ? (n.user as Record<string, unknown>) : {};
    const uid = Number(u.id);
    const fn = String(u.firstName ?? "").trim();
    const ln = String(u.lastName ?? "").trim();
    const name = [fn, ln].filter(Boolean).join(" ").trim() || "—";

    /** المسند = رد الدعم؛ منشئ التذكرة (غير المسند) = صاحب التذكرة */
    let from: ChatMessage["from"] = "admin";
    if (Number.isFinite(assignedToId) && uid === assignedToId) {
      from = "admin";
    } else if (Number.isFinite(createdById) && uid === createdById) {
      from = "owner";
    } else {
      from = "admin";
    }

    const time =
      created.length >= 16 ? `${created.slice(0, 10)} ${created.slice(11, 16)}` : created;
    const noteId = n.id != null && String(n.id).trim() !== "" ? String(n.id) : undefined;

    return {
      from,
      name,
      msg: text,
      time,
      ...(noteId ? { id: noteId } : {}),
      ...(Number.isFinite(uid) ? { authorUserId: uid } : {}),
    } satisfies ChatMessage;
  });
}

/** تحويل عنصر الـ API → Ticket (قائمة أو تفاصيل) */
export function mapApiItemToTicket(raw: Record<string, unknown>): Ticket {
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

  const fromNotes = mapNotesListToChat(raw);
  const chat: ChatMessage[] =
    fromNotes ?? (Array.isArray(raw.chat) ? (raw.chat as ChatMessage[]) : []);
  const attachments: Attachment[] = Array.isArray(raw.attachments)
    ? (raw.attachments as Attachment[])
    : [];

  const totalRaw =
    order.totalPrice ??
    order.totalAmount ??
    order.orderTotal ??
    order.subTotalPrice ??
    order.totalRevenue;
  let orderTotalEgp: number | undefined;
  if (totalRaw != null && totalRaw !== "") {
    const tn = Number(totalRaw);
    if (Number.isFinite(tn)) orderTotalEgp = tn;
  }

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
    ...(orderTotalEgp != null ? { orderTotalEgp } : {}),
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

function pickStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s || undefined;
}

function mapAssignees(raw: unknown): TicketMetaAssignee[] {
  if (!Array.isArray(raw)) return [];
  const out: TicketMetaAssignee[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const id = Number(o.id);
    if (!Number.isFinite(id)) continue;
    out.push({
      id,
      firstName: String(o.firstName ?? ""),
      lastName: String(o.lastName ?? ""),
    });
  }
  return out;
}

function mapKeyedOptions(raw: unknown): TicketMetaOption[] {
  if (!Array.isArray(raw)) return [];
  const out: TicketMetaOption[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const key = Number(o.key ?? o.id);
    const label = String(o.label ?? "").trim();
    if (!Number.isFinite(key) || !label) continue;
    out.push({ key, label });
  }
  return out;
}

function emptyTicketsMeta(): TicketsMeta {
  return {
    assignees: [],
    statuses: [],
    types: [],
  };
}

/** يدعم camelCase و snake_case من الـ backend */
function mapApiToTicketsMeta(raw: Record<string, unknown>): TicketsMeta {
  const optNum = (v: unknown): number | undefined =>
    v !== undefined && v !== null && String(v).trim() !== "" && Number.isFinite(Number(v))
      ? Number(v)
      : undefined;

  return {
    total: optNum(raw.total),
    open: optNum(raw.open),
    closed: optNum(raw.closed),
    overdueOpen: optNum(raw.overdueOpen ?? raw.overdue_open),
    averageResolutionDays: optNum(
      raw.averageResolutionDays ?? raw.average_resolution_days
    ),
    openBeyond3Days: optNum(raw.openBeyond3Days ?? raw.open_beyond_3_days),
    newTicketsWeekDelta: optNum(
      raw.newTicketsWeekDelta ?? raw.new_tickets_week_delta
    ),
    totalSubtitle: pickStr(raw.totalSubtitle ?? raw.total_subtitle),
    openSubtitle: pickStr(raw.openSubtitle ?? raw.open_subtitle),
    closedSubtitle: pickStr(raw.closedSubtitle ?? raw.closed_subtitle),
    averageSubtitle: pickStr(raw.averageSubtitle ?? raw.average_subtitle),
    overdueSubtitle: pickStr(raw.overdueSubtitle ?? raw.overdue_subtitle),
    assignees: mapAssignees(raw.assignees),
    statuses: mapKeyedOptions(raw.statuses),
    types: mapKeyedOptions(raw.types),
  };
}

export async function fetchTicketsMeta(navigate: NavigateFunction): Promise<TicketsMeta> {
  const { data } = await axiosRequest.get<Record<string, unknown>>(TICKETS_META_PATH);

  const root = data as unknown as ApiMetaResponse;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }

  const inner = root.data;
  if (!inner || typeof inner !== "object") {
    return emptyTicketsMeta();
  }

  return mapApiToTicketsMeta(inner as Record<string, unknown>);
}

export function useTicketsMeta(enabled = true) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ticketKeys.meta(),
    queryFn: () => fetchTicketsMeta(navigate),
    staleTime: 30_000,
    enabled,
  });
}

export async function fetchTicketById(navigate: NavigateFunction, ticketId: string): Promise<Ticket> {
  const path = `${TICKETS_LIST_PATH}/${encodeURIComponent(ticketId)}`;
  const { data } = await axiosRequest.get<Record<string, unknown>>(path);

  const root = data as unknown as ApiSingleTicketResponse;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }

  const inner = root.data;
  if (!inner || typeof inner !== "object") {
    throw new Error("TICKET_NOT_FOUND");
  }

  const ticket = mapApiItemToTicket(inner as Record<string, unknown>);
  if (!ticket.id) {
    throw new Error("TICKET_NOT_FOUND");
  }
  return ticket;
}

export function useTicketDetail(ticketId: string, enabled = true) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: () => fetchTicketById(navigate, ticketId),
    staleTime: 30_000,
    enabled: enabled && Boolean(ticketId),
  });
}

export async function fetchTicketsList(
  navigate: NavigateFunction,
  params: { page: number; pageSize: number; filters?: TicketsListFilters }
): Promise<TicketsListResult> {
  const queryParams = buildTicketsListQueryParams(params.page, params.pageSize, params.filters);

  const { data } = await axiosRequest.get<ApiTicketsListResponse>(TICKETS_LIST_PATH, {
    params: queryParams,
  });

  const root = data as unknown as ApiTicketsListResponse;
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
  filters?: TicketsListFilters;
  /** تعطيل الجلب (مثلاً أثناء شاشة تفاصيل) */
  enabled?: boolean;
}

export function useTicketsList({ page, pageSize, filters, enabled = true }: UseTicketsListParams) {
  const navigate = useNavigate();
  const filtersKey = serializeTicketsListFilters(filters ?? {});

  return useQuery({
    queryKey: ticketKeys.list(page, pageSize, filtersKey),
    queryFn: () => fetchTicketsList(navigate, { page, pageSize, filters }),
    staleTime: 30_000,
    enabled,
  });
}
