/**
 * مفاتيح React Query — ثبّت الأسماء هنا واستخدم invalidate بنفس الهرمية.
 */
export const orderKeys = {
  all: () => ["orders"],
  lists: () => [...orderKeys.all(), "list"],
  /**
   * @param {string} filtersKey سلسلة JSON ثابتة من واجهة الطلبات (فلاتر + صفحة + تواريخ)
   */
  list: (filtersKey) => [...orderKeys.lists(), filtersKey],
};

export const vendorKeys = {
  all: () => ["vendors"],
  list: () => [...vendorKeys.all(), "list"],
};

export const userKeys = {
  all: () => ["users"],
  list: () => [...userKeys.all(), "list"],
};
