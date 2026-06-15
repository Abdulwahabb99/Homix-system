export function formatOrderDetailDate(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
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
    delete legacy.statusHistory;
    delete legacy.timeline;
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
  };

  delete (merged as any).statusHistory;
  delete (merged as any).timeline;

  return merged;
}
