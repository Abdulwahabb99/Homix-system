/**
 * مفاتيح React Query — ثبّت الأسماء هنا واستخدم invalidate بنفس الهرمية.
 */
export const orderKeys = {
  all: () => ["orders"] as const,
  meta: () => [...orderKeys.all(), "meta"] as const,
  lists: () => [...orderKeys.all(), "list"] as const,
  /**
   * @param {string} filtersKey سلسلة JSON ثابتة من واجهة الطلبات (فلاتر + صفحة + تواريخ)
   */
  list: (filtersKey: string) => [...orderKeys.lists(), filtersKey] as const,
  /** تفاصيل طلب واحد (للعرض / التعديل) */
  details: () => [...orderKeys.all(), "detail"] as const,
  detail: (orderId: string) => [...orderKeys.details(), orderId] as const,
  /** ملخص البطاقات العلوية — سلسلة مفاتيح الفلاتر (مثل قائمة الطلبات + حقول البحث المحلي) */
  summary: (filtersKey: string) => [...orderKeys.all(), "summary", filtersKey] as const,
};

export const vendorKeys = {
  all: () => ["vendors"],
  list: () => [...vendorKeys.all(), "list"],
};

export const userKeys = {
  all: () => ["users"],
  list: () => [...userKeys.all(), "list"],
};

export const shipmentKeys = {
  all: () => ["shipments"] as const,
  lists: () => [...shipmentKeys.all(), "list"] as const,
  list: (filtersKey: string) => [...shipmentKeys.lists(), filtersKey] as const,
};

export const ticketKeys = {
  all: () => ["tickets"] as const,
  meta: () => [...ticketKeys.all(), "meta"] as const,
  list: (page: number, pageSize: number, filtersKey: string) =>
    [...ticketKeys.all(), "list", page, pageSize, filtersKey] as const,
  detail: (ticketId: string) => [...ticketKeys.all(), "detail", ticketId] as const,
};
