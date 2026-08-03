/**
 * مفاتيح الصلاحيات في النظام = `{group}_{action}` — مصدرها رد `/users/login`
 * و`GET /users/:id` (خريطة `permissions` المسطّحة). مصدر واحد للأسماء عبر التطبيق.
 */

/** مجموعات الصلاحيات (أقسام النظام) */
export const PERMISSION_GROUPS = [
  "dashboard",
  "orders",
  "factory",
  "products",
  "vendors",
  "employees",
  "customers",
  "ship",
  "finance",
  "tickets",
  "notifications",
  "users",
  "settings",
] as const;
export type PermissionGroup = (typeof PERMISSION_GROUPS)[number];

/** أفعال الصلاحيات (لاحقة المفتاح) */
export const PERMISSION_ACTIONS = [
  "view",
  "edit",
  "create",
  "delete",
  "import",
  "export",
  "settle",
  "reply",
  "close",
  "manage",
] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/**
 * المفاتيح المعروفة حاليًا من الـ API — للإكمال التلقائي (autocomplete) فقط.
 * `can()` تقبل أي نص، فأي مفتاح جديد من الباك يشتغل بدون تعديل هنا.
 */
export type KnownPermissionKey =
  | "dashboard_view"
  | "orders_view" | "orders_edit" | "orders_create" | "orders_delete"
  | "factory_view" | "factory_edit" | "factory_delete"
  | "products_view" | "products_edit" | "products_import"
  | "vendors_view" | "vendors_create" | "vendors_edit" | "vendors_delete"
  | "employees_view" | "employees_create" | "employees_edit" | "employees_delete"
  | "customers_view" | "customers_edit"
  | "ship_view" | "ship_edit"
  | "finance_view" | "finance_export" | "finance_settle"
  | "tickets_view" | "tickets_reply" | "tickets_close"
  | "notifications_view" | "notifications_manage"
  | "users_view" | "users_manage"
  | "settings_view" | "settings_edit";

/** نوع مفتاح الصلاحية — يقبل المفاتيح المعروفة (بإكمال تلقائي) أو أي نص آخر */
// eslint-disable-next-line @typescript-eslint/ban-types
export type PermissionKey = KnownPermissionKey | (string & {});

/** خريطة صلاحيات المستخدم كما تأتي من الـ API */
export type PermissionMap = Record<string, boolean>;

/** بناء مفتاح صلاحية من المجموعة والفعل — `permKey("orders","create") → "orders_create"` */
export const permKey = (group: PermissionGroup, action: PermissionAction): string =>
  `${group}_${action}`;
