/**
 * ثوابت فاتورة الطلب (HOMIX). عدّل بيانات البائع/النصوص من هنا فقط.
 */

/** بيانات البائع (المُصدِر) — تظهر في خانة «البائع» بالفاتورة */
export const INVOICE_SELLER = {
  name: "هومكس",
  phone: "0221600459",
  address: "G89 - بلوك 12 - مدخل 6 - قسم الست دب - مدينتي",
} as const;

/** بنود الإقرار أسفل الفاتورة (يدعم أجزاء مُبرَزة عبر strong) */
export const INVOICE_DECLARATIONS: {
  tone: "green" | "amber";
  before: string;
  strong: string;
  after: string;
}[] = [
  {
    tone: "green",
    before: "أقر أنا العميل بأنني ",
    strong: "استلمت الطلب المذكور أعلاه",
    after: " وأنه خالٍ من أي عيوب أو أضرار ظاهرية وقت التسليم، ومطابق للمواصفات المتفق عليها.",
  },
  {
    tone: "amber",
    before: "يُرجى ",
    strong: "الاحتفاظ بهذه الفاتورة",
    after: " طوال فترة الضمان — تُعدّ الوثيقة الرسمية الوحيدة لإثبات الشراء والمطالبة بخدمات ما بعد البيع.",
  },
];

export const INVOICE_FOOTER_BRAND = "شكراً لثقتك";
export const INVOICE_FOOTER_NOTE = "وثيقة صادرة إلكترونياً · صفحة 1 من 1";
