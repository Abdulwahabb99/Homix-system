import { USER_TYPES } from "../../../config/constants";

export const USER_ACCOUNT_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export const USER_ROLE_LABELS = {
  [USER_TYPES.ADMIN]: "مدير",
  [USER_TYPES.LOGISTIC]: "لوجستي",
  [USER_TYPES.OPERATION]: "عمليات",
  [USER_TYPES.VENDOR]: "بائع",
} as const;

export const USER_PERMISSION_GROUPS = [
  {
    key: "orders",
    label: "الطلبات",
    permissions: [
      { key: "orders_view", label: "عرض الطلبات" },
      { key: "orders_edit", label: "تعديل الطلبات" },
      { key: "orders_create", label: "إنشاء طلب" },
      { key: "orders_delete", label: "حذف الطلبات" },
    ],
  },
  {
    key: "factory",
    label: "الصُنّاع",
    permissions: [
      { key: "factory_view", label: "عرض الصُنّاع" },
      { key: "factory_edit", label: "تعديل بيانات المصنع" },
      { key: "factory_delete", label: "حذف مصنع" },
    ],
  },
  {
    key: "ship",
    label: "الشحن والتوصيل",
    permissions: [
      { key: "ship_view", label: "عرض الشحنات" },
      { key: "ship_edit", label: "تعديل الشحنات" },
    ],
  },
  {
    key: "finance",
    label: "المالية",
    permissions: [
      { key: "finance_view", label: "عرض التقارير" },
      { key: "finance_export", label: "تصدير التقارير" },
      { key: "finance_settle", label: "تسوية مالية" },
    ],
  },
  {
    key: "tickets",
    label: "التذاكر",
    permissions: [
      { key: "tickets_view", label: "عرض التذاكر" },
      { key: "tickets_reply", label: "الرد على التذاكر" },
      { key: "tickets_close", label: "إغلاق التذاكر" },
    ],
  },
  {
    key: "users",
    label: "المستخدمون والإعدادات",
    permissions: [
      { key: "users_view", label: "عرض المستخدمين" },
      { key: "users_manage", label: "إدارة الصلاحيات" },
      { key: "settings_view", label: "عرض الإعدادات" },
      { key: "settings_edit", label: "تعديل الإعدادات" },
    ],
  },
] as const;

export const USER_PERMISSION_TEMPLATES = {
  admin: {
    orders_view: true,
    orders_edit: true,
    orders_delete: true,
    orders_create: true,
    factory_view: true,
    factory_edit: true,
    factory_delete: true,
    ship_view: true,
    ship_edit: true,
    finance_view: true,
    finance_export: true,
    finance_settle: true,
    tickets_view: true,
    tickets_reply: true,
    tickets_close: true,
    users_view: true,
    users_manage: true,
    settings_view: true,
    settings_edit: true,
  },
  logistics: {
    ship_view: true,
    ship_edit: true,
    orders_view: true,
    factory_view: true,
  },
  ops: {
    orders_view: true,
    orders_edit: true,
    orders_create: true,
    factory_view: true,
    ship_view: true,
    tickets_view: true,
    tickets_reply: true,
  },
  finance: {
    finance_view: true,
    finance_export: true,
    finance_settle: true,
    orders_view: true,
  },
  none: {},
} as const;

export const ALL_USER_PERMISSION_KEYS = USER_PERMISSION_GROUPS.flatMap((group) => group.permissions.map((permission) => permission.key));

export const getPermissionTemplateForUserType = (userType?: string, roleName?: string): Record<string, boolean> => {
  if (roleName?.includes("مالية")) {
    return { ...USER_PERMISSION_TEMPLATES.finance };
  }

  if (userType === USER_TYPES.ADMIN) {
    return { ...USER_PERMISSION_TEMPLATES.admin };
  }

  if (userType === USER_TYPES.LOGISTIC) {
    return { ...USER_PERMISSION_TEMPLATES.logistics };
  }

  if (userType === USER_TYPES.OPERATION) {
    return { ...USER_PERMISSION_TEMPLATES.ops };
  }

  return { ...USER_PERMISSION_TEMPLATES.none };
};
