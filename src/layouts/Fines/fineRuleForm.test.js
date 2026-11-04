import { applyMethod, applyTrigger, apiErrorMessage, buildPayload, emptyForm, methodOf, rulePayload, toForm, validateRuleForm } from "./fineRuleForm";

const NOW = new Date(2026, 9, 1, 10, 30); // local time
const form = (method, extra = {}) => ({ ...emptyForm(NOW), name: "قاعدة اختبار", method, amount: "5", ...extra });

/** Same fixtures are fed to the backend zod schema in homix fine-rule-payloads.test.ts */
const EXPECTED = (iso) => ({
  fixed: { name: "قاعدة اختبار", description: "", trigger: "delivery_delay", amountType: "fixed", amount: 5, frequency: "once", basis: "cost", graceHours: 24, maxAmount: null, effectiveFrom: iso, active: true },
  percentage: { amountType: "percent", frequency: "once", basis: "cost" },
  percentage_daily: { amountType: "percent", frequency: "daily", basis: "cost" },
  tiered_daily: { amountType: "fixed", frequency: "daily", basis: "cost" },
  commission_percent: { amountType: "percent", frequency: "once", basis: "commission" },
});

describe("buildPayload per calculation method", () => {
  const iso = NOW.toISOString();
  const expected = EXPECTED(iso);
  test.each(["fixed", "percentage", "percentage_daily", "tiered_daily", "commission_percent"])("%s", (method) => {
    const payload = buildPayload(applyMethod(form(method), method));
    expect(payload).toEqual({ ...expected.fixed, ...expected[method] });
    expect(methodOf(payload)).toBe(method);
    expect(typeof payload.amount).toBe("number");
  });
  test("empty cap becomes null, filled cap a number; manual forces zero grace", () => {
    expect(buildPayload(form("tiered_daily", { maxAmount: "250" })).maxAmount).toBe(250);
    expect(buildPayload(form("fixed", { maxAmount: " " })).maxAmount).toBeNull();
    expect(buildPayload(form("fixed", { trigger: "manual", graceHours: "48" })).graceHours).toBe(0);
  });
  test("percentage basis commission is not kept silently when switching method", () => {
    expect(applyMethod(form("commission_percent", { basis: "commission" }), "percentage").basis).toBe("cost");
    expect(applyMethod(form("fixed"), "commission_percent").basis).toBe("commission");
  });
  test("choosing manual coerces a daily method", () => {
    const next = applyTrigger(form("percentage_daily"), "manual");
    expect(next.method).toBe("percentage");
    expect(next.graceHours).toBe("0");
    expect(applyTrigger(form("tiered_daily"), "manual").method).toBe("fixed");
  });
});

describe("edit round trip", () => {
  test("DB row (numeric strings, null description) maps to a valid form and payload", () => {
    const row = { id: 4, name: "تأخير", description: null, trigger: "delivery_delay", amountType: "percent", amount: "1.50", frequency: "daily", basis: "subtotal", graceHours: 24, maxAmount: "250.00", effectiveFrom: "2026-10-01T00:00:00.000Z", active: true };
    const f = toForm(row);
    expect(f).toMatchObject({ method: "percentage_daily", amount: "1.5", maxAmount: "250", description: "" });
    expect(validateRuleForm(f)).toEqual({});
    expect(buildPayload(f)).toMatchObject({ amount: 1.5, maxAmount: 250, basis: "subtotal", effectiveFrom: "2026-10-01T00:00:00.000Z" });
    expect(rulePayload(row, { active: false })).toMatchObject({ amount: 1.5, description: "", active: false, maxAmount: 250 });
  });
});

describe("validateRuleForm", () => {
  test("a valid form has no errors", () => expect(validateRuleForm(form("fixed"))).toEqual({}));
  test("required and range errors are polite Arabic", () => {
    expect(validateRuleForm(form("fixed", { name: " " })).name).toBe("من فضلك أدخل اسم القاعدة");
    expect(validateRuleForm(form("fixed", { name: "ا" })).name).toMatch(/حرفين/);
    expect(validateRuleForm(form("fixed", { amount: "" })).amount).toMatch(/من فضلك/);
    expect(validateRuleForm(form("fixed", { amount: "0" })).amount).toMatch(/أكبر من صفر/);
    expect(validateRuleForm(form("fixed", { amount: "-3" })).amount).toMatch(/أكبر من صفر/);
    expect(validateRuleForm(form("fixed", { amount: "1.234" })).amount).toMatch(/خانتين/);
    expect(validateRuleForm(form("percentage", { amount: "101" })).amount).toMatch(/0 و100/);
    expect(validateRuleForm(form("percentage", { amount: "100" }))).toEqual({});
    expect(validateRuleForm(form("fixed", { amount: "150" }))).toEqual({}); // fixed amounts may exceed 100
    expect(validateRuleForm(form("fixed", { maxAmount: "-1" })).maxAmount).toMatch(/أقل من صفر/);
    expect(validateRuleForm(form("fixed", { maxAmount: "0" }))).toEqual({});
    expect(validateRuleForm(form("fixed", { graceHours: "1.5" })).graceHours).toMatch(/عددًا صحيحًا/);
    expect(validateRuleForm(form("fixed", { graceHours: "-1" })).graceHours).toMatch(/أقل من صفر/);
    expect(validateRuleForm(form("fixed", { graceHours: "0" }))).toEqual({});
    expect(validateRuleForm(form("fixed", { effectiveFrom: "" })).effectiveFrom).toMatch(/من فضلك/);
    expect(validateRuleForm(form("fixed", { effectiveFrom: "garbage" })).effectiveFrom).toMatch(/غير صالح/);
  });
});

describe("apiErrorMessage", () => {
  test("shows Arabic 4xx server messages, hides English / 5xx / network", () => {
    expect(apiErrorMessage({ response: { status: 400, data: { message: "اسم القاعدة: من فضلك أدخل حرفين على الأقل" } } }, "x")).toMatch(/اسم القاعدة/);
    expect(apiErrorMessage({ response: { status: 400, data: { message: "Bad Request" } } }, "تعذر الحفظ")).toBe("تعذر الحفظ");
    expect(apiErrorMessage({ response: { status: 403, data: { message: "Unauthorized" } } }, "x")).toMatch(/صلاحية/);
    expect(apiErrorMessage({ response: { status: 500, data: { message: "relation does not exist" } } }, "x")).toMatch(/غير متوقع/);
    expect(apiErrorMessage(new Error("Network Error"), "x")).toMatch(/الاتصال/);
  });
});
