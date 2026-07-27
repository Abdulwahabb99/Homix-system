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
  detail: (id: number | string) => [...userKeys.all(), "detail", String(id)],
};

export const factoryKeys = {
  all: () => ["factories"] as const,
  meta: () => [...factoryKeys.all(), "meta"] as const,
  lists: () => [...factoryKeys.all(), "list"] as const,
  /** @param filtersKey سلسلة JSON ثابتة من فلاتر الصفحة (بحث/حالة/تخصص/ترتيب/صفحة) */
  list: (filtersKey: string) => [...factoryKeys.lists(), filtersKey] as const,
  detail: (factoryId: number | string) =>
    [...factoryKeys.all(), "detail", String(factoryId)] as const,
};

export const shipmentKeys = {
  all: () => ["shipments"] as const,
  lists: () => [...shipmentKeys.all(), "list"] as const,
  list: (filtersKey: string) => [...shipmentKeys.lists(), filtersKey] as const,
  summary: (filtersKey: string) => [...shipmentKeys.all(), "summary", filtersKey] as const,
  meta: () => [...shipmentKeys.all(), "meta"] as const,
  shippingCompanies: () => [...shipmentKeys.all(), "shipping-companies"] as const,
  detail: (shipmentId: string) => [...shipmentKeys.all(), "detail", shipmentId] as const,
  returns: (tab: string, filtersKey: string) => [...shipmentKeys.all(), "returns", tab, filtersKey] as const,
  inventory: (filtersKey: string) => [...shipmentKeys.all(), "inventory", filtersKey] as const,
  accounts: (tab: string, filtersKey: string) => [...shipmentKeys.all(), "accounts", tab, filtersKey] as const,
  performance: (filtersKey: string) => [...shipmentKeys.all(), "performance", filtersKey] as const,
};

export const financialKeys = {
  all: () => ["financial"] as const,
  /** تقرير دورة الفوترة — مفتاح حسب يوم الفوترة (13 / 28) */
  report: (billingDay: number | string) => [...financialKeys.all(), "report", String(billingDay)] as const,
};

export const ticketKeys = {
  all: () => ["tickets"] as const,
  meta: () => [...ticketKeys.all(), "meta"] as const,
  list: (page: number, pageSize: number, filtersKey: string) =>
    [...ticketKeys.all(), "list", page, pageSize, filtersKey] as const,
  detail: (ticketId: string) => [...ticketKeys.all(), "detail", ticketId] as const,
};
