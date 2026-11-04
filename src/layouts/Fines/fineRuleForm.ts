/**
 * منطق نموذج قاعدة الغرامة (بدون React): تحويل "طريقة الحساب" إلى حقول الـ API،
 * بناء الـ payload، والتحقق مع رسائل عربية مهذّبة. يطابق zod schema في
 * homix/src/modules/fines/fine.routes.ts (حقل بحقل).
 */

export type Method = "fixed" | "percentage" | "percentage_daily" | "tiered_daily" | "commission_percent";
export type Trigger = "delivery_delay" | "late_cancellation" | "customer_refusal" | "manual";
export type Basis = "subtotal" | "total" | "commission" | "cost";

/** ما يعيده GET /fines/rules (الأرقام قد تصل كنص من NUMERIC) */
export type FineRule = {
  id: number; name: string; description: string | null; trigger: string; amountType: string; amount: number | string;
  frequency: string; basis: string; graceHours: number | string; maxAmount: number | string | null; effectiveFrom: string; active: boolean;
};

/** حالة النموذج: كل الحقول الرقمية نصوص لتجنّب مشاكل الكتابة (مثل "0.") */
export type RuleForm = {
  id?: number; name: string; description: string; trigger: Trigger; method: Method; basis: Basis;
  amount: string; maxAmount: string; graceHours: string;
  /** صيغة datetime-local بالتوقيت المحلي: YYYY-MM-DDTHH:mm */
  effectiveFrom: string; active: boolean;
};

/** الجسم المرسَل فعليًا إلى POST/PUT /fines/rules */
export type RulePayload = {
  name: string; description: string; trigger: Trigger; amountType: "fixed" | "percent"; amount: number; frequency: "once" | "daily";
  basis: Basis; graceHours: number; maxAmount: number | null; effectiveFrom: string; active: boolean;
};

export type RuleErrors = Partial<Record<"name" | "description" | "trigger" | "amount" | "maxAmount" | "graceHours" | "effectiveFrom", string>>;

export const MAX_MONEY = 1_000_000_000;
export const MAX_GRACE_HOURS = 87_600;
export const DAILY_METHODS: Method[] = ["percentage_daily", "tiered_daily"];
/** القاعدة اليدوية تُطبَّق مرة واحدة على طلب بعينه: لا معنى لتكرار يومي أو فترة سماح */
export const MANUAL_METHODS: Method[] = ["fixed", "percentage", "commission_percent"];

export const methodOf = (rule: { amountType: string; frequency: string; basis: string }): Method => {
  if (rule.amountType === "fixed") return rule.frequency === "daily" ? "tiered_daily" : "fixed";
  if (rule.frequency === "daily") return "percentage_daily";
  return rule.basis === "commission" ? "commission_percent" : "percentage";
};

/** عند تغيير الطريقة: تأكد أن الأساس مناسب (commission_percent => commission، والنسب الأخرى لا تُبقي commission بالخطأ) */
export const applyMethod = (form: RuleForm, method: Method): RuleForm => {
  const fixed = method === "fixed" || method === "tiered_daily";
  const basis: Basis = method === "commission_percent" ? "commission" : fixed ? form.basis : form.basis === "commission" ? "cost" : form.basis;
  return { ...form, method, basis };
};

/** تغيير سبب التطبيق إلى "يدوي" يعيد الطريقة إلى واحدة مدعومة */
export const applyTrigger = (form: RuleForm, trigger: Trigger): RuleForm => {
  if (trigger === "manual" && !MANUAL_METHODS.includes(form.method)) {
    return { ...applyMethod(form, form.method === "percentage_daily" ? "percentage" : "fixed"), trigger, graceHours: "0" };
  }
  return { ...form, trigger };
};

const pad = (value: number) => String(value).padStart(2, "0");
export const toLocalInput = (value: string | Date): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const emptyForm = (now = new Date()): RuleForm => ({
  name: "", description: "", trigger: "delivery_delay", method: "fixed", basis: "cost", amount: "", maxAmount: "", graceHours: "24",
  effectiveFrom: toLocalInput(now), active: true,
});

export const toForm = (rule: FineRule): RuleForm => ({
  id: rule.id, name: rule.name, description: rule.description ?? "", trigger: rule.trigger as Trigger,
  method: methodOf(rule), basis: rule.basis as Basis,
  amount: String(Number(rule.amount)), maxAmount: rule.maxAmount == null ? "" : String(Number(rule.maxAmount)),
  graceHours: String(Number(rule.graceHours) || 0), effectiveFrom: toLocalInput(rule.effectiveFrom), active: rule.active,
});

const parse = (value: string): number => (value.trim() === "" ? NaN : Number(value));
const decimals = (value: string) => (value.split(".")[1] ?? "").length;

export function validateRuleForm(form: RuleForm): RuleErrors {
  const errors: RuleErrors = {};
  const name = form.name.trim();
  if (!name) errors.name = "من فضلك أدخل اسم القاعدة";
  else if (name.length < 2) errors.name = "اسم القاعدة قصير جدًا، من فضلك أدخل حرفين على الأقل";
  else if (name.length > 150) errors.name = "اسم القاعدة طويل جدًا، الحد الأقصى 150 حرفًا";
  if (form.description.trim().length > 2000) errors.description = "الوصف طويل جدًا، الحد الأقصى 2000 حرف";

  const percent = form.method === "percentage" || form.method === "percentage_daily" || form.method === "commission_percent";
  const amount = parse(form.amount);
  if (form.amount.trim() === "") errors.amount = percent ? "من فضلك أدخل النسبة" : "من فضلك أدخل قيمة الغرامة";
  else if (!Number.isFinite(amount)) errors.amount = "من فضلك أدخل رقمًا صحيحًا";
  else if (amount <= 0) errors.amount = percent ? "من فضلك أدخل نسبة أكبر من صفر" : "من فضلك أدخل قيمة أكبر من صفر";
  else if (percent && amount > 100) errors.amount = "النسبة المئوية يجب أن تكون بين 0 و100";
  else if (amount > MAX_MONEY) errors.amount = "القيمة كبيرة جدًا، من فضلك أدخل قيمة أقل";
  else if (decimals(form.amount) > 2) errors.amount = "من فضلك أدخل رقمًا بحد أقصى خانتين عشريتين";

  if (form.maxAmount.trim() !== "") {
    const cap = parse(form.maxAmount);
    if (!Number.isFinite(cap)) errors.maxAmount = "من فضلك أدخل رقمًا صحيحًا أو اترك الحقل فارغًا";
    else if (cap < 0) errors.maxAmount = "الحد الأقصى لا يمكن أن يكون أقل من صفر";
    else if (cap > MAX_MONEY) errors.maxAmount = "الحد الأقصى كبير جدًا، من فضلك أدخل قيمة أقل";
    else if (decimals(form.maxAmount) > 2) errors.maxAmount = "من فضلك أدخل رقمًا بحد أقصى خانتين عشريتين";
  }

  const grace = parse(form.graceHours);
  if (form.graceHours.trim() === "") errors.graceHours = "من فضلك أدخل فترة السماح، أو اكتب 0 لعدم وجود سماح";
  else if (!Number.isFinite(grace) || !Number.isInteger(grace)) errors.graceHours = "من فضلك أدخل عددًا صحيحًا من الساعات";
  else if (grace < 0) errors.graceHours = "فترة السماح لا يمكن أن تكون أقل من صفر";
  else if (grace > MAX_GRACE_HOURS) errors.graceHours = "فترة السماح كبيرة جدًا";

  const date = new Date(form.effectiveFrom);
  if (!form.effectiveFrom) errors.effectiveFrom = "من فضلك اختر تاريخ السريان";
  else if (!Number.isFinite(date.getTime()) || date.getFullYear() < 2000 || date.getFullYear() > 2100) errors.effectiveFrom = "تاريخ السريان غير صالح، من فضلك اختر تاريخًا صحيحًا";
  return errors;
}

/** يحوّل النموذج إلى الجسم الذي يقبله الـ API. افترض أن validateRuleForm نجح. */
export function buildPayload(form: RuleForm): RulePayload {
  const fixed = form.method === "fixed" || form.method === "tiered_daily";
  const manual = form.trigger === "manual";
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    trigger: form.trigger,
    amountType: fixed ? "fixed" : "percent",
    amount: Number(form.amount),
    frequency: DAILY_METHODS.includes(form.method) ? "daily" : "once",
    basis: form.method === "commission_percent" ? "commission" : form.basis,
    graceHours: manual ? 0 : Number(form.graceHours),
    maxAmount: form.maxAmount.trim() === "" ? null : Number(form.maxAmount),
    effectiveFrom: new Date(form.effectiveFrom).toISOString(),
    active: form.active,
  };
}

/** رسالة عربية واضحة من خطأ axios: نعرض رسالة السيرفر فقط لأخطاء 4xx (وهي عربية ومهذّبة) */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { status?: number; data?: { message?: unknown } } })?.response;
  if (!response) return "تعذر الاتصال بالخادم، من فضلك تحقق من الإنترنت وحاول مرة أخرى";
  const message = response.data?.message;
  const status = response.status ?? 0;
  if (status === 403) return "ليس لديك صلاحية لتنفيذ هذا الإجراء";
  if (status >= 400 && status < 500 && typeof message === "string" && /[؀-ۿ]/.test(message)) return message;
  return status >= 500 ? "حدث خطأ غير متوقع في الخادم، من فضلك حاول مرة أخرى بعد قليل" : fallback;
}

/** payload لقاعدة محفوظة بدون تعديل تاريخ السريان (يُستخدم مع مفتاح التفعيل السريع) */
export const rulePayload = (rule: FineRule, overrides: Partial<RulePayload> = {}): RulePayload => ({
  name: rule.name, description: rule.description ?? "", trigger: rule.trigger as Trigger,
  amountType: rule.amountType as "fixed" | "percent", amount: Number(rule.amount), frequency: rule.frequency as "once" | "daily",
  basis: rule.basis as Basis, graceHours: Number(rule.graceHours) || 0, maxAmount: rule.maxAmount == null ? null : Number(rule.maxAmount),
  effectiveFrom: new Date(rule.effectiveFrom).toISOString(), active: rule.active, ...overrides,
});
