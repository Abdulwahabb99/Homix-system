/** أنواع بيانات وثوابت صفحة التذاكر */

export type TicketStatus = "مفتوحة" | "مغلقة";

export type ChatMessage = {
  from: "owner" | "admin";
  name: string;
  msg: string;
  time: string;
  /** معرف الملاحظة من الـ API عند العرض من notesList */
  id?: string;
  /** معرف المستخدم الحقيقي لكاتب الملاحظة (مقارنة مع المستخدم المسجّل) */
  authorUserId?: number;
};

export type Attachment = {
  type: "image" | "video" | "link" | "file";
  name: string;
  id?: number;
  /** مسار نسبي أو URL كامل من الـ API */
  url?: string;
  description?: string;
  createdAt?: string;
};

export type Ticket = {
  id: string;
  op: string;
  order: string;
  code: string;
  seller: string;
  type: string;
  openDate: string;
  closeDate: string;
  days: number;
  status: TicketStatus;
  resp: string;
  adminReply: string;
  ownerReply: string;
  notes: string;
  chat: ChatMessage[];
  attachments: Attachment[];
  /** إن وُجد من الـ API على كائن الطلب — إجمالي مالي للعرض */
  orderTotalEgp?: number;
};

export type MockOp = {
  op: string;
  order: string;
  code: string;
  seller: string;
};

export const DEFAULT_TICKET_TYPES = [
  "تأخير في التوصيل",
  "إلغاء",
  "استرجاع الأموال",
  "استرجاع منتج",
  "رفض الاستلام",
  "فشل في التوصيل",
  "صيانة",
  "استبدال",
  "التحقق",
];

export const DEFAULT_QUICK_REPLIES = [
  "التوصيل خلال أسبوع",
  "التوصيل خلال 72 ساعة",
  "التوصيل خلال 48 ساعة",
  "ملغي",
  "تم استرداد المبلغ",
  "غير قابل للاسترداد",
  "لا يشمله الضمان",
  "غير صالح",
  "بسبب سوء الاستخدام",
  "قابل للإرجاع",
  "غير مقبول",
  "يعتمد على DC",
  "تم إبلاغ البائع",
  "استبدال",
  "تمت الموافقة على الإصلاح",
  "تم التوصيل",
];

export const MOCK_OPS: Record<string, MockOp> = {
  "OP-3001": { op: "OP-3001", order: "31668", code: "RKA-001", seller: "ركة للأثاث" },
  "OP-3002": { op: "OP-3002", order: "31667", code: "RKA-002", seller: "ركة للأثاث" },
  "OP-3003": { op: "OP-3003", order: "31666", code: "DRS-101", seller: "دريسينج هاوس" },
  "OP-3004": { op: "OP-3004", order: "31665", code: "DRS-102", seller: "دريسينج هاوس" },
  "OP-3005": { op: "OP-3005", order: "31661", code: "BNG-201", seller: "بين باج" },
  "OP-3006": { op: "OP-3006", order: "31660", code: "BNG-202", seller: "بين باج" },
  "OP-3007": { op: "OP-3007", order: "31658", code: "MOD-301", seller: "مصنع المودرن" },
};

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "TK-001",
    op: "OP-3001",
    order: "31668",
    code: "RKA-001",
    seller: "ركة للأثاث",
    type: "تأخير في التوصيل",
    openDate: "2025-04-15",
    closeDate: "—",
    days: 8,
    status: "مفتوحة",
    resp: "أحمد هشام",
    adminReply: "التوصيل خلال 72 ساعة",
    ownerReply: "متى بالظبط؟",
    notes: "تم التواصل مع شركة الشحن",
    chat: [
      { from: "owner", name: "الشركة", msg: "الطلب متأخر عن الموعد المحدد", time: "2025-04-15 10:00" },
      { from: "admin", name: "أحمد هشام", msg: "سيتم التوصيل خلال 72 ساعة، نعتذر عن التأخير", time: "2025-04-15 11:30" },
      { from: "owner", name: "الشركة", msg: "متى بالظبط؟ العميل بيتصل علينا", time: "2025-04-15 14:00" },
    ],
    attachments: [],
  },
  {
    id: "TK-002",
    op: "OP-3002",
    order: "31667",
    code: "RKA-002",
    seller: "ركة للأثاث",
    type: "استرجاع منتج",
    openDate: "2025-04-12",
    closeDate: "2025-04-14",
    days: 0,
    status: "مغلقة",
    resp: "سارة محمود",
    adminReply: "قابل للإرجاع",
    ownerReply: "تم الاستلام",
    notes: "تم إرجاع المنتج للمخزن",
    chat: [
      { from: "owner", name: "الشركة", msg: "العميل يريد إرجاع المنتج بسبب عيب في التصنيع", time: "2025-04-12 09:00" },
      { from: "admin", name: "سارة محمود", msg: "تمت الموافقة على الإرجاع، سيتم إرسال مندوب", time: "2025-04-12 10:30" },
      { from: "owner", name: "الشركة", msg: "تم استلام المنتج بنجاح", time: "2025-04-14 16:00" },
    ],
    attachments: [],
  },
  {
    id: "TK-003",
    op: "OP-3003",
    order: "31666",
    code: "DRS-101",
    seller: "دريسينج هاوس",
    type: "رفض الاستلام",
    openDate: "2025-04-10",
    closeDate: "—",
    days: 13,
    status: "مفتوحة",
    resp: "محمد علي",
    adminReply: "تم إبلاغ البائع",
    ownerReply: "بانتظار القرار",
    notes: "العميل رفض المنتج لأسباب غير واضحة",
    chat: [
      { from: "owner", name: "الشركة", msg: "العميل رفض استلام الأوردر دون سبب واضح", time: "2025-04-10 13:00" },
      { from: "admin", name: "محمد علي", msg: "تم إبلاغ البائع وننتظر تقييم الحالة", time: "2025-04-10 15:00" },
    ],
    attachments: [],
  },
  {
    id: "TK-004",
    op: "OP-3004",
    order: "31665",
    code: "DRS-102",
    seller: "دريسينج هاوس",
    type: "صيانة",
    openDate: "2025-04-18",
    closeDate: "—",
    days: 2,
    status: "مفتوحة",
    resp: "أحمد هشام",
    adminReply: "تمت الموافقة على الإصلاح",
    ownerReply: "—",
    notes: "",
    chat: [
      { from: "owner", name: "الشركة", msg: "المنتج وصل به خدش في الدهان", time: "2025-04-18 11:00" },
      { from: "admin", name: "أحمد هشام", msg: "تمت الموافقة على الإصلاح، سيتم إرسال فني", time: "2025-04-18 14:00" },
    ],
    attachments: [],
  },
  {
    id: "TK-005",
    op: "OP-3005",
    order: "31661",
    code: "BNG-201",
    seller: "بين باج",
    type: "فشل في التوصيل",
    openDate: "2025-04-16",
    closeDate: "2025-04-17",
    days: 0,
    status: "مغلقة",
    resp: "سارة محمود",
    adminReply: "تم التوصيل",
    ownerReply: "ممتاز",
    notes: "تم إعادة الجدولة بنجاح",
    chat: [
      { from: "owner", name: "الشركة", msg: "فشل التوصيل مرتين، العميل غير متاح", time: "2025-04-16 10:00" },
      { from: "admin", name: "سارة محمود", msg: "سيتم إعادة جدولة التوصيل ليوم غد", time: "2025-04-16 12:00" },
      { from: "owner", name: "الشركة", msg: "تم التسليم بنجاح، شكراً", time: "2025-04-17 15:00" },
    ],
    attachments: [],
  },
  {
    id: "TK-006",
    op: "OP-3006",
    order: "31660",
    code: "BNG-202",
    seller: "بين باج",
    type: "استرجاع الأموال",
    openDate: "2025-04-14",
    closeDate: "—",
    days: 6,
    status: "مفتوحة",
    resp: "محمد علي",
    adminReply: "غير قابل للاسترداد",
    ownerReply: "سنكلم المسئول",
    notes: "العميل طالب باسترداد بعد التسليم",
    chat: [
      { from: "owner", name: "الشركة", msg: "العميل يطلب استرداد المبلغ بعد تسلم المنتج", time: "2025-04-14 09:00" },
      { from: "admin", name: "محمد علي", msg: "وفقاً للسياسة، غير قابل للاسترداد بعد التسليم", time: "2025-04-14 11:00" },
    ],
    attachments: [],
  },
  {
    id: "TK-007",
    op: "OP-3007",
    order: "31658",
    code: "MOD-301",
    seller: "مصنع المودرن",
    type: "استبدال",
    openDate: "2025-04-19",
    closeDate: "—",
    days: 1,
    status: "مفتوحة",
    resp: "أحمد هشام",
    adminReply: "استبدال",
    ownerReply: "—",
    notes: "",
    chat: [
      { from: "owner", name: "الشركة", msg: "العميل يريد تغيير اللون، هل ممكن الاستبدال؟", time: "2025-04-19 10:00" },
      { from: "admin", name: "أحمد هشام", msg: "نعم، سيتم الاستبدال مع الطلب القادم", time: "2025-04-19 12:30" },
    ],
    attachments: [],
  },
];

/** لون الأيام بناءً على العدد وحالة التذكرة */
export function getDayCounterVariant(days: number, isOpen: boolean): "ok" | "warn" | "danger" | "closed" {
  if (!isOpen || days === 0) return "closed";
  if (days <= 3) return "ok";
  if (days <= 7) return "warn";
  return "danger";
}

/** map: نوع التذكرة → مجموعة الألوان */
export const TICKET_TYPE_COLOR: Record<
  string,
  { bg: string; color: string; dot: string }
> = {
  "تأخير في التوصيل": { bg: "rgba(245,158,11,0.16)", color: "#78350f", dot: "#d97706" },
  "إلغاء": { bg: "rgba(75,85,99,0.12)", color: "#1f2937", dot: "#6b7280" },
  "استرجاع الأموال": { bg: "rgba(59,130,246,0.16)", color: "#1e3a8a", dot: "#3b82f6" },
  "استرجاع منتج": { bg: "rgba(139,92,246,0.16)", color: "#4c1d95", dot: "#8b5cf6" },
  "رفض الاستلام": { bg: "rgba(239,68,68,0.16)", color: "#7f1d1d", dot: "#ef4444" },
  "فشل في التوصيل": { bg: "rgba(244,63,94,0.16)", color: "#831843", dot: "#f43f5e" },
  "صيانة": { bg: "rgba(20,184,166,0.16)", color: "#115e59", dot: "#14b8a6" },
  "استبدال": { bg: "rgba(99,102,241,0.16)", color: "#312e81", dot: "#6366f1" },
  "التحقق": { bg: "rgba(16,185,129,0.16)", color: "#064e3b", dot: "#10b981" },
};

export const DEFAULT_TYPE_COLOR = { bg: "rgba(99,102,241,0.16)", color: "#312e81", dot: "#6366f1" };

export const RESPONSIBLE_OPTIONS = ["أحمد هشام", "سارة محمود", "محمد علي"];
