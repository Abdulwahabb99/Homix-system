/**
 * Notification center helpers (pure, no React): categories, routing, titles and
 * relative time. The categories mirror the backend (src/modules/notification):
 * orders | shipments | tickets, derived from the notification `entityType`.
 */
export type NotificationCategory = "orders" | "shipments" | "tickets";
export type NotificationTab = "all" | NotificationCategory;

export type NotificationItem = {
  id?: string | number;
  text?: string;
  readAt?: string | null;
  createdAt?: string | null;
  category?: string;
  entityId?: string | number | null;
  entityType?: string;
  orderId?: string | number | null;
};

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = ["orders", "shipments", "tickets"];

export const NOTIFICATION_TABS: { key: NotificationTab; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "orders", label: "الطلبات" },
  { key: "shipments", label: "الشحنات" },
  { key: "tickets", label: "التذاكر" },
];

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  orders: "الطلبات",
  shipments: "الشحنات",
  tickets: "التذاكر",
};

const SHIPMENT_TYPES = ["shipment", "shipments"];
const TICKET_TYPES = ["ticket", "tickets"];

/** Same rule as the backend: shipment/ticket by entityType, everything else is an order. */
export function getNotificationCategory(n: NotificationItem): NotificationCategory {
  if (n?.category && (NOTIFICATION_CATEGORIES as string[]).includes(n.category)) {
    return n.category as NotificationCategory;
  }
  const type = String(n?.entityType ?? "").trim().toLowerCase();
  if (SHIPMENT_TYPES.includes(type)) return "shipments";
  if (TICKET_TYPES.includes(type)) return "tickets";
  return "orders";
}

export type NotificationCounts = Record<NotificationTab, number>;

export function countUnread(notifications: NotificationItem[]): NotificationCounts {
  const counts: NotificationCounts = { all: 0, orders: 0, shipments: 0, tickets: 0 };
  for (const n of notifications ?? []) {
    if (n.readAt) continue;
    counts[getNotificationCategory(n)] += 1;
    counts.all += 1;
  }
  return counts;
}

export function filterByTab(notifications: NotificationItem[], tab: NotificationTab) {
  return tab === "all"
    ? notifications
    : notifications.filter((n) => getNotificationCategory(n) === tab);
}

/** Page to open when a notification is clicked; null when it has no detail page. */
export function getNotificationRoute(n: NotificationItem): string | null {
  const type = String(n?.entityType ?? "").trim().toLowerCase();
  // Real-time order payloads carry `orderId` and no entityType.
  const id = n?.entityId ?? n?.orderId;
  if (id == null || id === "") return null;
  const encoded = encodeURIComponent(String(id));
  if (SHIPMENT_TYPES.includes(type)) return `/shipments/${encoded}`;
  if (TICKET_TYPES.includes(type)) return `/tickets/${encoded}`;
  if (type === "order" || (!type && n?.orderId != null)) return `/orders/${encoded}`;
  return null;
}

const TITLE_PREFIXES = [
  "تم تحديث حالة التصنيع",
  "تم تحديث حالة الطلب",
  "تم اضافة ملاحظة جديدة",
  "تم اضافة طلب جديد",
  "تم إضافة بائع جديد",
  // shipments (backend: src/modules/shipments/shipment.notifications.ts)
  "تم تغيير حالة الشحنة",
  "تم جدولة الشحنة",
  "تم تغيير حالة جدولة الشحنة",
  "تم إلغاء حالة جدولة الشحنة",
  // tickets (backend: src/modules/tickets/ticket.notifications.ts)
  "تم إنشاء تذكرة جديدة",
  "تم إسناد التذكرة",
  "تم تغيير حالة التذكرة",
  "تم إضافة رد جديد على التذكرة",
];

// Aggregated bulk text: "تم تغيير حالة 5 شحنة إلى …" (the count is part of the leading phrase).
// Schedule-status bulk: "تم تغيير حالة جدولة 5 شحنة إلى …" / "تم إلغاء حالة جدولة 5 شحنة".
const TITLE_PATTERNS = [/^تم تغيير حالة \d+ شحنة/, /^تم تغيير حالة جدولة \d+ شحنة/, /^تم إلغاء حالة جدولة \d+ شحنة/];

const FALLBACK_TITLES: Record<NotificationCategory, string> = {
  orders: "إشعار طلب",
  shipments: "إشعار شحنة",
  tickets: "إشعار تذكرة",
};

/** The backend stores a single `text`; the list shows the action phrase as the bold title. */
export function getNotificationTitle(n: NotificationItem): string {
  const text = String(n?.text ?? "");
  const prefix = TITLE_PREFIXES.find((p) => text.startsWith(p));
  if (prefix) return prefix;
  const pattern = TITLE_PATTERNS.map((re) => re.exec(text)?.[0]).find(Boolean);
  return pattern ?? FALLBACK_TITLES[getNotificationCategory(n)];
}

/** Relative time in Arabic, same buckets as the reference design. */
export function formatRelativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const minutes = Math.round((now - ts) / 60000);
  if (minutes < 1) return "دلوقتي";
  if (minutes < 60) return `من ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `من ${hours} ساعة`;
  const days = Math.round(hours / 24);
  return days === 1 ? "امبارح" : `من ${days} أيام`;
}

export function formatBadge(count: number): string {
  return count > 9 ? "9+" : String(count);
}
