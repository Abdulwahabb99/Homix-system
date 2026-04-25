export const salesChartData = [
  { day: 1, dayLabel: "1أبريل", sales: 28, orders: 12 },
  { day: 4, dayLabel: "4أبريل", sales: 42, orders: 18 },
  { day: 7, dayLabel: "7أبريل", sales: 35, orders: 14 },
  { day: 10, dayLabel: "10أبريل", sales: 60, orders: 22 },
  { day: 13, dayLabel: "13أبريل", sales: 48, orders: 19 },
  { day: 16, dayLabel: "16أبريل", sales: 72, orders: 28 },
  { day: 19, dayLabel: "19أبريل", sales: 55, orders: 22 },
  { day: 22, dayLabel: "22أبريل", sales: 80, orders: 32 },
  { day: 25, dayLabel: "25أبريل", sales: 68, orders: 27 },
  { day: 28, dayLabel: "28أبريل", sales: 90, orders: 36 },
];

export const kpiItems = [
  {
    value: "847K",
    label: "إجمالي المبيعات (ج.م)",
    change: { dir: "up" as const, text1: "12.4%", text2: "من الشهر الماضي" },
    bar: "linear-gradient(90deg, var(--accent), #8b5cf6)",
    icon: "revenue" as const,
  },
  {
    value: "720",
    label: "إجمالي الطلبات",
    change: { dir: "up" as const, text1: "8.1%", text2: "من الشهر الماضي" },
    bar: "linear-gradient(90deg, var(--green), #34d399)",
    icon: "orders" as const,
  },
  {
    value: "48",
    label: "طلبات معلقة",
    change: { dir: "down" as const, text1: "5 طلبات", text2: "تحتاج متابعة" },
    bar: "linear-gradient(90deg, var(--amber), #fbbf24)",
    icon: "clock" as const,
  },
  {
    value: "85",
    label: "صُنّاع نشطون",
    change: { dir: "up" as const, text1: "3 صُنّاع", text2: "انضموا هذا الشهر" },
    bar: "linear-gradient(90deg, var(--gold), #fbbf24)",
    icon: "users" as const,
  },
];

export const activityItems: {
  emoji: string;
  bg: string;
  before: string;
  strong: string;
  after: string;
  time: string;
}[] = [
  { emoji: "🛒", bg: "var(--green-light)", before: "طلب جديد ", strong: "#31668", after: " من Lamiaa Saeid", time: "منذ 3 دقائق" },
  { emoji: "🏭", bg: "var(--accent-light)", before: "سيلر جديد ", strong: "مصنع النور", after: " انضم للمنصة", time: "منذ 18 دقيقة" },
  { emoji: "⚠️", bg: "var(--amber-light)", before: "طلب ", strong: "#31650", after: " تجاوز وقت التصنيع", time: "منذ 45 دقيقة" },
  { emoji: "💰", bg: "var(--green-light)", before: "تسوية مالية ", strong: "ركة للأثاث", after: " — 24,800 ج.م", time: "منذ ساعتين" },
  { emoji: "❌", bg: "var(--red-light)", before: "إلغاء طلب ", strong: "#31642", after: " من العميل", time: "منذ 3 ساعات" },
];

export const orderRows = [
  {
    id: "#31668",
    name: "Lamiaa Saeid",
    initials: "LS",
    grad: "linear-gradient(135deg, #6366f1, #a78bfa)",
    product: "غرفة نوم - دريسينج",
    amount: "12,999 ج.م",
    status: "pending" as const,
    when: "منذ 3 د",
  },
  {
    id: "#31667",
    name: "عبير ابوالمجد",
    initials: "ع",
    grad: "linear-gradient(135deg, #10b981, #059669)",
    product: "صالة - ركة",
    amount: "16,999 ج.م",
    status: "mfg" as const,
    when: "منذ 1 س",
  },
  {
    id: "#31666",
    name: "Mohamed Bezan",
    initials: "MB",
    grad: "linear-gradient(135deg, #f59e0b, #d97706)",
    product: "بين باج - سفرة",
    amount: "2,299 ج.م",
    status: "done" as const,
    when: "منذ 2 س",
  },
  {
    id: "#31665",
    name: "Toaa Elgarhy",
    initials: "TE",
    grad: "linear-gradient(135deg, #ef4444, #dc2626)",
    product: "كنبة L - ركة",
    amount: "16,999 ج.م",
    status: "pending" as const,
    when: "منذ 3 س",
  },
  {
    id: "#31664",
    name: "احمد حسام",
    initials: "أح",
    grad: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    product: "دريسينج هاوس",
    amount: "9,775 ج.م",
    status: "cancel" as const,
    when: "أمس",
  },
];

export const topSellers = [
  { rank: "1" as const, name: "ركة للأثاث", sub: "غرف نوم • صالة", initial: "ر", grad: "linear-gradient(135deg, #8c7355, #5a4530)", rev: "284K" },
  { rank: "2" as const, name: "دريسينج هاوس", sub: "دريسينج", initial: "د", grad: "linear-gradient(135deg, #4a7855, #2d5038)", rev: "196K" },
  { rank: "3" as const, name: "بين باج", sub: "سفرة • كراسي", initial: "ب", grad: "linear-gradient(135deg, #a07840, #6b5030)", rev: "143K" },
  { rank: "4" as const, name: "مصنع المودرن", sub: "صالة • مطبخ", initial: "م", grad: "linear-gradient(135deg, #5a4070, #3a2850)", rev: "98K" },
];

export const donutCategories = [
  { name: "غرف النوم", value: 40, sub: "320K ج.م", color: "#6366f1" },
  { name: "الصالة", value: 25, sub: "200K ج.م", color: "#10b981" },
  { name: "السفرة", value: 18, sub: "147K ج.م", color: "#f59e0b" },
  { name: "أخرى", value: 17, sub: "180K ج.م", color: "#c9a96e" },
];
