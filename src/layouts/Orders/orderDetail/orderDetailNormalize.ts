export type FlowStepState = "done" | "active" | "pending";

const FLOW_STEP_LABELS = ["الطلب", "المخزن", "التصنيع", "الشحن", "التسليم"] as const;

/**
 * يطابق منطق الشريط السابق: رقم الخطوة النشطة (0…4) من حالة الطلب وحالة التصنيع الحالية.
 * — معلق: المخزن نشط (1)، مؤكد+: التصنيع نشط (2)، في المخزن/قيد التصنيع: (2)، الشحن/التسليم من manufactureStatus.
 */
export function computeActiveIndexFromStatus(st: number, mfg: number | null | undefined): number {
  const m = mfg == null || Number.isNaN(Number(mfg)) ? null : Number(mfg);
  if (st === 1) return 1;
  if (st === 8) return 2;
  if (st === 2 || m === 2) return 2;
  if (m === 3) return 3;
  if (m != null && m >= 4) return 4;
  if (st >= 3) return 2;
  return 1;
}

function orderStatusesImplyDelivered(codes: Iterable<number>): boolean {
  for (const c of codes) {
    if (c === 5) return true;
  }
  return false;
}

/** شكل الـ API الحالي: صفوف قالب بـ isActive / status — بدون fromStatus / toStatus */
export function isPipelineStatusHistoryTemplate(rows: any[] | null | undefined): boolean {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  return rows.some((h) => h != null && Object.prototype.hasOwnProperty.call(h, "isActive"));
}

/**
 * شريط التقدّم من قالب `statusHistory`: كل خطوة = `statusLabel`، السابقة للـ isActive خضراء،
 * صف `isActive === true` بنفسجي (active)، الباقي pending.
 */
export function getPipelineTemplateProgressSteps(
  orderDetails: any,
  statusHistory?: any[] | null
): { label: string; state: FlowStepState }[] | null {
  const hist = statusHistory ?? orderDetails?.statusHistory;
  if (!isPipelineStatusHistoryTemplate(hist) || !Array.isArray(hist)) return null;

  const rows = hist.slice().sort((a: any, b: any) => Number(a.status) - Number(b.status));

  let activeIdx = rows.findIndex((r) => r?.isActive === true);
  if (activeIdx < 0) {
    const st = Number(orderDetails?.status ?? 0);
    activeIdx = rows.findIndex((r) => Number(r?.status) === st);
  }
  if (activeIdx < 0) activeIdx = 0;

  return rows.map((r: any, i: number) => ({
    label: String(r?.statusLabel ?? "").trim() || "—",
    state: (i < activeIdx ? "done" : i === activeIdx ? "active" : "pending") as FlowStepState,
  }));
}

/**
 * شريط التقدّم الخمسي (الطلب / المخزن / …): للبيانات القديمة — عندما لا يكون `statusHistory` قالبًا بـ isActive.
 */
export function getOrderFlowSteps(
  orderDetails: any,
  manufactureStatus: number | null,
  statusHistory?: any[] | null
): { label: string; state: FlowStepState }[] {
  const labels = [...FLOW_STEP_LABELS];
  const mfg = manufactureStatus == null ? null : Number(manufactureStatus);
  const hist = statusHistory ?? orderDetails?.statusHistory;

  if (isPipelineStatusHistoryTemplate(hist)) {
    const fallback = getPipelineTemplateProgressSteps(orderDetails, hist);
    return fallback ?? labels.map((label) => ({ label, state: "pending" as const }));
  }

  const st = Number(orderDetails?.status ?? 0);

  const codes: number[] = [st];
  if (Array.isArray(hist)) {
    for (const h of hist) {
      if (h?.fromStatus != null && h.fromStatus !== "") codes.push(Number(h.fromStatus));
      if (h?.toStatus != null && h.toStatus !== "") codes.push(Number(h.toStatus));
    }
  }

  if (st === 5 || orderStatusesImplyDelivered(codes)) {
    return labels.map((label) => ({ label, state: "done" as const }));
  }

  let activeIdx = computeActiveIndexFromStatus(st, mfg);

  if (Array.isArray(hist) && hist.length > 0) {
    for (const h of hist) {
      const pairs = [h?.fromStatus, h?.toStatus];
      for (const raw of pairs) {
        if (raw == null || raw === "") continue;
        const code = Number(raw);
        if (code === 5) {
          return labels.map((label) => ({ label, state: "done" as const }));
        }
        activeIdx = Math.max(activeIdx, computeActiveIndexFromStatus(code, mfg));
      }
    }
  }

  activeIdx = Math.min(activeIdx, labels.length - 1);

  return labels.map((label, i) => {
    if (i < activeIdx) return { label, state: "done" as const };
    if (i === activeIdx) return { label, state: "active" as const };
    return { label, state: "pending" as const };
  });
}

export function formatOrderDetailDate(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatOrderDetailDateTime(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** نص واحد لعرض بند `statusHistory` في الواجهة. */
export function getStatusHistoryEntryMessage(ev: any): string {
  const to = String(ev?.toStatusLabel ?? "").trim();
  const from = String(ev?.fromStatusLabel ?? "").trim();
  if (from) return `من ${from} إلى ${to || "—"}`;
  if (to) return `تم تعيين الحالة إلى: ${to}`;
  return "—";
}

/** نص عنوان لبند `timeline` (رسالة الحدث). */
export function getTimelineEntryTitle(ev: any): string {
  const msg = String(ev?.message ?? "").trim();
  if (msg) return msg;
  return getStatusHistoryEntryMessage(ev);
}

/** مصفوفة الأحداث للعرض: `timeline` من الـ API إن وُجدت (بما فيها الفارغة)، وإلا `statusHistory`. */
export function getOrderEventLogEntries(orderDetails: any): any[] {
  const tl = orderDetails?.timeline;
  if (Array.isArray(tl)) {
    return tl;
  }
  const sh = orderDetails?.statusHistory;
  return Array.isArray(sh) ? sh : [];
}

export function getOrderLineProductDescriptionPlainText(line: any): string {
  const p = line?.product;
  if (!p) return "";
  const raw = p.description ?? p.bodyHtml ?? p.body_html;
  if (raw == null) return "";
  const s = String(raw);
  if (!s.trim()) return "";
  return s
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * يدعم شكل الاستجابة الجديد (order + items + financial + customer + notes)
 * والشكل القديم (orderLines وحقول مسطّحة على نفس الكائن).
 */
export function normalizeOrderDetailPayload(apiResponse: any): any | null {
  const root = apiResponse?.data ?? apiResponse;
  if (!root || typeof root !== "object") return null;

  const hasNewFormat =
    root.order != null && Array.isArray(root.items) && root.orderLines == null;

  if (!hasNewFormat) {
    const legacy = { ...root };
    if (legacy.customer?.name != null && legacy.customer.firstName == null) {
      const seg = String(legacy.customer.name).trim().split(/\s+/).filter(Boolean);
      legacy.customer = {
        ...legacy.customer,
        firstName: seg[0] ?? "",
        lastName: seg.slice(1).join(" "),
      };
    }
    if (!Array.isArray(legacy.orderLines)) legacy.orderLines = [];
    legacy.createdAt = legacy.createdAt ?? legacy.orderDate;
    legacy.deliveryStatus = legacy.deliveryStatus ?? legacy.manufactureStatus;
    if (!Array.isArray(legacy.statusHistory)) legacy.statusHistory = [];
    return legacy;
  }

  const order = root.order;
  const financial = root.financial ?? {};
  const items = Array.isArray(root.items) ? root.items : [];
  const customerRaw = root.customer;

  const sellTotal = Number(financial.totalPrice ?? order.totalPrice ?? 0);
  const totalQty = items.reduce((sum: number, it: any) => sum + Number(it.quantity ?? 1), 0) || 1;

  const orderLines = items.map((it: any) => {
    const qty = Number(it.quantity ?? 1);
    const explicitSell = Number(it.unitPrice ?? it.price ?? it.sellingPrice ?? 0);
    const unitSell = explicitSell > 0 ? explicitSell : sellTotal / totalQty;
    const uc = Number(it.unitCost ?? 0);
    return {
      ...it,
      title: it.productName ?? it.title,
      price: unitSell,
      quantity: qty,
      unitCost: uc,
      cost: uc,
      sku: it.sku,
      product: {
        image: it.image ?? it.product?.image,
        variants: [{ price: unitSell, title: it.size || "Default Title" }],
        type: { name: it.typeName ?? it.product?.type?.name },
        description: it.product?.description,
        bodyHtml: it.product?.bodyHtml ?? it.product?.body_html,
      },
    };
  });

  const orderPrice = orderLines.reduce((s: number, l: any) => s + Number(l.price) * Number(l.quantity), 0);
  const orderCost = orderLines.reduce((s: number, l: any) => s + Number(l.unitCost) * Number(l.quantity), 0);

  const customer = customerRaw
    ? {
        ...customerRaw,
        firstName:
          customerRaw.firstName ??
          (typeof customerRaw.name === "string"
            ? customerRaw.name.trim().split(/\s+/).filter(Boolean)[0] ?? ""
            : ""),
        lastName:
          customerRaw.lastName ??
          (typeof customerRaw.name === "string"
            ? customerRaw.name.trim().split(/\s+/).filter(Boolean).slice(1).join(" ")
            : ""),
      }
    : null;

  const notesRaw = root.notes ?? root.notesList ?? [];
  const notesList = Array.isArray(notesRaw) ? notesRaw : [];

  const rawHistory = Array.isArray(root.statusHistory) ? root.statusHistory : [];
  const isPipelineTemplate = rawHistory.some(
    (x: any) => x != null && Object.prototype.hasOwnProperty.call(x, "isActive")
  );
  const statusHistory = isPipelineTemplate
    ? rawHistory.slice().sort((a: any, b: any) => Number(a.status) - Number(b.status))
    : rawHistory
        .slice()
        .sort((a: any, b: any) => new Date(b.changedAt || 0).getTime() - new Date(a.changedAt || 0).getTime());

  const rawTimeline = Array.isArray(root.timeline) ? root.timeline : [];
  const timeline = rawTimeline
    .slice()
    .sort((a: any, b: any) => new Date(b.changedAt || 0).getTime() - new Date(a.changedAt || 0).getTime());

  const merged = {
    ...order,
    name: order.orderNumber != null ? `#${order.orderNumber}` : order.code ?? order.name,
    code: order.code ?? order.operationNumber,
    createdAt: order.orderDate ?? order.createdAt,
    customer,
    orderLines,
    notesList,
    financial,
    subTotalPrice: Number(financial.totalPrice ?? order.totalPrice ?? orderPrice),
    shippingFees: Number(financial.shippingFees ?? 0),
    totalDiscounts: Number(financial.discount ?? 0),
    totalPrice: Number(financial.totalPrice ?? order.totalPrice ?? orderPrice),
    totalCost: Number(financial.totalCost ?? order.totalCost ?? orderCost),
    downPayment: Number(financial.downPayment ?? 0),
    toBeCollected: Number(financial.amountToCollect ?? 0),
    commission: Number(financial.commission ?? 0),
    shippedFromInventory: order.deliveryBy === 1 || order.deliveryBy === "1",
    userId: order.userId,
    userName: order.userName,
    assigneeName: root.assigneeName ?? "",
    statusHistory,
    timeline,
  };

  return merged;
}
