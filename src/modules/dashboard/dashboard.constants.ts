import type {
  DashboardGoalProgressItem,
  DashboardQuickActionItem,
  DashboardRole,
  DashboardSalesDistributionItem,
} from "./dashboard.types";

type GoalConfig = Omit<DashboardGoalProgressItem, "currentValue" | "progressPercentage">;

const SALES_COLOR = "#6366F1";
const ORDERS_COLOR = "#10B981";
const ACCENT_ORANGE = "#F59E0B";
const ACCENT_GOLD = "#C4A15A";

export const DISTRIBUTION_COLORS: string[] = [
  SALES_COLOR,
  ORDERS_COLOR,
  ACCENT_ORANGE,
  ACCENT_GOLD,
  "#94A3B8",
];

export const QUICK_ACTIONS: Record<DashboardRole, DashboardQuickActionItem[]> = {
  admin: [
    {
      description: "إضافة صانع جديد",
      icon: "user-plus",
      key: "add-maker",
      label: "صانع جديد",
      route: "/vendors/new",
    },
    {
      description: "رفع منتج جديد",
      icon: "package",
      key: "add-product",
      label: "إضافة منتج",
      route: "/products/new",
    },
    {
      description: "صرف للصنّاع",
      icon: "credit-card",
      key: "financial-settlement",
      label: "تسوية مالية",
      route: "/vendors/settlements",
    },
    {
      description: "Excel / PDF",
      icon: "file-text",
      key: "export-report",
      label: "تصدير تقرير",
      route: "/reports/export",
    },
  ],
  vendor: [
    {
      description: "رفع منتج جديد",
      icon: "package",
      key: "add-product",
      label: "إضافة منتج",
      route: "/products/new",
    },
    {
      description: "عرض الطلبات الحالية",
      icon: "shopping-cart",
      key: "view-orders",
      label: "الطلبات",
      route: "/orders",
    },
    {
      description: "تحديث الملف التجاري",
      icon: "settings",
      key: "update-profile",
      label: "تحديث الملف",
      route: "/vendors/profile",
    },
    {
      description: "تحميل تقرير مبيعات",
      icon: "file-text",
      key: "export-report",
      label: "تقرير المبيعات",
      route: "/reports/sales",
    },
  ],
};

export const GOAL_CONFIGS: Record<DashboardRole, GoalConfig[]> = {
  admin: [
    { color: SALES_COLOR, key: "salesTarget", label: "هدف المبيعات", targetValue: 1_000_000 },
    { color: ORDERS_COLOR, key: "ordersTarget", label: "عدد الطلبات", targetValue: 1_000 },
    { color: ACCENT_ORANGE, key: "makersTarget", label: "صُنّاع نشطون", targetValue: 10 },
    { color: ACCENT_GOLD, key: "deliveredTarget", label: "طلبات مسلمة", targetValue: 100 },
  ],
  vendor: [
    { color: SALES_COLOR, key: "salesTarget", label: "هدف المبيعات", targetValue: 250_000 },
    { color: ORDERS_COLOR, key: "ordersTarget", label: "عدد الطلبات", targetValue: 150 },
    { color: ACCENT_ORANGE, key: "productsTarget", label: "منتجات نشطة", targetValue: 25 },
    { color: ACCENT_GOLD, key: "deliveredTarget", label: "طلبات مسلمة", targetValue: 60 },
  ],
};

export const OTHER_DISTRIBUTION_ITEM = (
  value: number,
  percentage: number,
): DashboardSalesDistributionItem => ({
  color: DISTRIBUTION_COLORS[4] ?? "#94A3B8",
  label: "أخرى",
  percentage,
  value,
});
