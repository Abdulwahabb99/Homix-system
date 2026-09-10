import React, { useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { toast } from "react-toastify";
import {
  FinanceDashboardData, useFinanceDashboard, useFinanceHistory,
  useSaveFinanceAdjustments, useSaveFinanceOpex,
} from "query/financeDashboard.api";
import styles from "./FinanceDashboard.module.css";

type Language = "ar" | "en";
type EditableOpex = { label: string; amount: number };
type EditableAdjustment = EditableOpex & { type: "negative" | "positive" };

const COPY = {
  ar: {
    title: "لوحة الأرباح والخسائر", subtitle: "الأرقام التلقائية للطلبات والمصروفات الشهرية المحفوظة",
    statement: "قائمة الأرباح والخسائر", revenue: "الإيرادات", online: "GMV أونلاين", showroom: "GMV شو روم",
    cancellations: "الإلغاءات", discounts: "الخصومات", totalGmv: "إجمالي GMV", nmv: "صافي المبيعات (NMV)", positive: "قيمة موجبة",
    negative: "قيمة سالبة", newPositive: "قيمة موجبة جديدة", newNegative: "قيمة سالبة جديدة",
    deliveries: "التوصيلات / التنفيذ", warehouse: "توصيل المخزن", seller: "توصيل البائع", totalDeliveries: "إجمالي التوصيلات (G2N)",
    cogs: "تكلفة البضاعة", cogsGmv: "COGS — GMV (كل الطلبات)", cogsNmv: "COGS — NMV (بدون الإلغاء)", cogsG2n: "COGS — G2N (المسلّم)",
    opex: "مصروفات التشغيل (OPEX)", totalOpex: "إجمالي OPEX", addExpense: "إضافة مصروف", newExpense: "مصروف جديد",
    save: "حفظ الشهر", saving: "جارٍ الحفظ…", saved: "تم حفظ بيانات الشهر", saveError: "تعذر حفظ بيانات الشهر",
    print: "طباعة التقرير", printedFor: "تقرير شهر",
    loadError: "تعذر تحميل الشهر", retry: "إعادة المحاولة", loading: "جارٍ تحميل البيانات المالية…",
    allOrders: "كل الطلبات + القيم الموجبة", nonCancelled: "الطلبات غير الملغاة", margin: "هامش",
    waterfall: "مسار الأرباح", channelChart: "GMV حسب القناة", deliveryChart: "التوصيلات", cogsChart: "مقارنة COGS",
    monthlyChart: "المقارنة الشهرية", opexChart: "مصروفات التشغيل", monthlyTable: "الملخص الشهري", month: "الشهر",
    gmvBasis: "كل الطلبات حسب ORDER_SOURCE وتشمل الملغاة", nmvBasis: "GMV ناقص الإلغاءات والخصومات والقيم السالبة",
    g2nBasis: "الطلبات DELIVERED فقط حسب DELIVERY_BY", noData: "لا توجد بيانات",
  },
  en: {
    title: "Marketplace P&L", subtitle: "Automatic order metrics and saved monthly operating expenses",
    statement: "P&L Statement", revenue: "Revenue", online: "GMV Online", showroom: "GMV Showroom",
    cancellations: "Cancellations", discounts: "Discounts", totalGmv: "Total GMV", nmv: "Net Sales (NMV)", positive: "Positive",
    negative: "Negative", newPositive: "New positive value", newNegative: "New negative value",
    deliveries: "Deliveries / Fulfillment", warehouse: "Warehouse Delivery", seller: "Seller Delivery", totalDeliveries: "Total Deliveries (G2N)",
    cogs: "Cost of Goods", cogsGmv: "COGS — GMV (all orders)", cogsNmv: "COGS — NMV (without cancellations)", cogsG2n: "COGS — G2N (delivered)",
    opex: "Operating Expenses (OPEX)", totalOpex: "Total OPEX", addExpense: "Add expense", newExpense: "New expense",
    save: "Save this month", saving: "Saving…", saved: "Monthly finance values saved", saveError: "Could not save monthly finance values",
    print: "Print report", printedFor: "Report for",
    loadError: "Could not load this month", retry: "Try again", loading: "Loading finance totals…",
    allOrders: "All orders + positive adjustments", nonCancelled: "Non-cancelled orders", margin: "margin",
    waterfall: "Profit Waterfall", channelChart: "GMV by Channel", deliveryChart: "Deliveries", cogsChart: "COGS Comparison",
    monthlyChart: "Monthly Comparison", opexChart: "Operating Expenses", monthlyTable: "Monthly Summary", month: "Month",
    gmvBasis: "Every order by ORDER_SOURCE, including cancelled orders", nmvBasis: "GMV minus cancellations, discounts, and negative adjustments",
    g2nBasis: "DELIVERED orders only, grouped by DELIVERY_BY", noData: "No data",
  },
} as const;

const OPEX_DEFAULTS = {
  ar: ["التسويق والإعلانات", "الرواتب", "الإيجار", "الأدوات والبرامج", "عمليات الشحن", "المركبات"],
  en: ["Marketing & Ads", "Salaries", "Rent", "Tools & Software", "Shipping Ops", "Vehicles"],
};
const HINTS = {
  ar: {
    gmv: "قيمة كل الطلبات، بما فيها الملغاة، حسب ORDER_SOURCE، بالإضافة إلى القيم الموجبة اليدوية.",
    nmv: "GMV ناقص قيمة الطلبات الملغاة بعد الخصم، وخصومات الطلبات، وكل القيم السالبة اليدوية.",
    g2n: "صافي قيمة الطلبات بحالة DELIVERED فقط حسب DELIVERY_BY.",
    deductions: "إجمالي الإلغاءات والخصومات والقيم السالبة ÷ GMV.",
    cogs: "مجموع orders.totalCost للطلبات غير الملغاة. الرقم الفرعي هو تكلفة الطلبات المسلّمة فقط.",
    gp: "الرقم الأساسي: NMV ناقص COGS-NMV. الرقم الفرعي: G2N ناقص COGS-G2N.",
    np: "صافي ربح الطلبات المسلّمة فقط: سعر البيع قبل الخصم ناقص orders.totalCost ناقص خصومات الطلبات. وهو يساوي G2N ناقص COGS-G2N.",
    gm: "الربح الإجمالي ÷ قيمة المبيعات المقابلة؛ الأساسي على NMV والفرعي على G2N.",
    opex: "إجمالي مصروفات التشغيل اليدوية المحفوظة لهذا الشهر.",
    ebitda: "الربح الإجمالي ناقص OPEX؛ الرقم الفرعي يستخدم ربح G2N ناقص نفس OPEX.",
    ebitdaRate: "EBITDA ÷ قيمة المبيعات المقابلة؛ الأساسي على NMV والفرعي على G2N.",
    marketing: "قيمة أول بند OPEX المخصص للتسويق ÷ NMV.",
  },
  en: {
    gmv: "Value of every order, including cancelled orders, grouped by ORDER_SOURCE, plus manual positive adjustments.",
    nmv: "GMV minus cancelled net order value, order discounts, and every manual negative adjustment.",
    g2n: "Net value of DELIVERED orders only, grouped by DELIVERY_BY.",
    deductions: "Total cancellations, discounts, and negative adjustments divided by GMV.",
    cogs: "Sum of orders.totalCost for non-cancelled orders. The secondary value is cost for delivered orders only.",
    gp: "Primary: NMV minus COGS-NMV. Secondary: G2N minus COGS-G2N.",
    np: "Delivered-order net profit only: gross selling price minus orders.totalCost minus order discounts. This equals G2N minus COGS-G2N.",
    gm: "Gross profit divided by its sales basis: primary uses NMV and secondary uses G2N.",
    opex: "Total manually maintained operating expenses saved for this month.",
    ebitda: "Gross profit minus OPEX. The secondary value uses G2N gross profit minus the same OPEX.",
    ebitdaRate: "EBITDA divided by its sales basis: primary uses NMV and secondary uses G2N.",
    marketing: "The first dedicated Marketing OPEX amount divided by NMV.",
  },
} as const;
const COLORS = ["#2563eb", "#0d9488", "#d97706", "#7c3aed", "#059669", "#dc2626"];
const currentMonth = () => new Date().toISOString().slice(0, 7);
const pct = (value: number, base: number) => `${base ? ((value / base) * 100).toFixed(1) : "0.0"}%`;

export default function FinanceDashboard() {
  const [month, setMonth] = useState(currentMonth);
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem("finance-dashboard-language") === "ar" ? "ar" : "en");
  const { data, isLoading, isError, refetch } = useFinanceDashboard(month);
  const { data: history } = useFinanceHistory(month, 12);
  const saveOpex = useSaveFinanceOpex(month);
  const saveAdjustments = useSaveFinanceAdjustments(month);
  const queryClient = useQueryClient();
  const [opex, setOpex] = useState<EditableOpex[]>([]);
  const [adjustments, setAdjustments] = useState<EditableAdjustment[]>([]);
  const c = COPY[language];
  const hints = HINTS[language];
  const money = useMemo(() => new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 2 }), [language]);

  useEffect(() => {
    if (!data) return;
    setOpex(data.opex.length ? data.opex.map(({ label, amount }) => ({ label, amount })) : OPEX_DEFAULTS[language].map((label) => ({ label, amount: 0 })));
    setAdjustments(data.adjustments.map(({ label, amount, type }) => ({ label, amount, type })));
  }, [data, language]);

  const draftOpex = useMemo(() => opex.reduce((sum, item) => sum + (+item.amount || 0), 0), [opex]);
  const positiveTotal = adjustments.filter((item) => item.type === "positive").reduce((sum, item) => sum + (+item.amount || 0), 0);
  const negativeTotal = adjustments.filter((item) => item.type === "negative").reduce((sum, item) => sum + (+item.amount || 0), 0);
  const gmv = data ? data.gmvOnline + data.gmvShowroom + positiveTotal : 0;
  const nmv = data ? gmv - data.cancellations - data.discounts - negativeTotal : 0;
  const totalDeductions = gmv - nmv;
  const grossProfit = data ? nmv - data.cogsNmv : 0;
  const ebitda = grossProfit - draftOpex;
  const marketingOpex = +opex[0]?.amount || 0;

  const toggleLanguage = () => setLanguage((value) => {
    const next = value === "en" ? "ar" : "en";
    localStorage.setItem("finance-dashboard-language", next);
    return next;
  });
  const persist = async () => {
    try {
      await saveOpex.mutateAsync(opex.map(({ label, amount }) => ({ label: label.trim(), amount: +amount || 0 })).filter((item) => item.label));
      await saveAdjustments.mutateAsync(adjustments.map(({ label, amount, type }) => ({ label: label.trim(), amount: +amount || 0, type })).filter((item) => item.label));
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "finance-history"] });
      toast.success(c.saved);
    } catch { toast.error(c.saveError); }
  };
  const monthLabel = (value: string) => new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T00:00:00Z`));
  const historyRows = history?.items ?? [];
  const displayHistoryRows = historyRows.map((item) => item.month === month && data ? {
    ...item,
    cancellationRate: gmv ? Number(((totalDeductions / gmv) * 100).toFixed(1)) : 0,
    ebitda,
    ebitdaRate: nmv ? Number(((ebitda / nmv) * 100).toFixed(1)) : 0,
    g2nRate: nmv ? Number(((data.g2n / nmv) * 100).toFixed(1)) : 0,
    gmv,
    grossMargin: grossProfit,
    grossMarginRate: nmv ? Number(((grossProfit / nmv) * 100).toFixed(1)) : 0,
    nmv,
    opex: opex.map((opexItem, index) => ({ ...opexItem, sortOrder: index })),
    totalOpex: draftOpex,
  } : item);

  return (
    <DashboardLayout
      pageTitle={c.title}
      pageSubtitle={c.subtitle}
      pageActions={<div className={styles.controls}><label className={styles.monthControl}><span>{c.month}</span><input aria-label={c.month} className={styles.month} type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label><button className={styles.printButton} disabled={!data || !history} onClick={() => window.print()}>🖨️ {c.print}</button><button className={styles.language} onClick={toggleLanguage}>{language === "en" ? "العربية" : "English"}</button></div>}
    >
      <div className={styles.page} dir={language === "ar" ? "rtl" : "ltr"}>
        <div className={styles.printHeader}><strong>{c.title}</strong><span>{c.printedFor} {monthLabel(month)}</span></div>
        {isError && <div className={styles.error}>{c.loadError}. <button onClick={() => refetch()}>{c.retry}</button></div>}
        {isLoading && <div className={styles.panel}>{c.loading}</div>}
        {data && <>
          <div className={styles.kpis}>{[
            ["GMV", gmv, c.allOrders, "#2563eb", "📦"], ["NMV", nmv, `${pct(nmv, gmv)} GMV`, "#0d9488", "💵"],
            ["COGS", data.cogsNmv, c.nonCancelled, "#d97706", "🏷️"], [language === "ar" ? "مجمل الربح" : "Gross Profit", grossProfit, `${pct(grossProfit, nmv)} ${c.margin}`, "#059669", "📈"],
            ["EBITDA", ebitda, `${c.opex}: ${money.format(draftOpex)}`, "#7c3aed", "📊"],
          ].map(([label, value, sub, accent, icon], index) => <div className={styles.kpi} style={{ "--accent": accent } as React.CSSProperties} key={String(label)}><div className={styles.kpiHead}><span className={styles.kpiIcon}>{icon}</span><span className={styles.kpiTag}>{label}</span></div><div className={`${styles.kpiValue} ${styles.explainable}`} title={[hints.gmv,hints.nmv,hints.cogs,hints.gp,hints.ebitda][index]}>{money.format(Number(value))}</div><div className={styles.kpiLabel}>{label}</div><div className={styles.kpiSub}>{sub}</div></div>)}</div>

          <div className={styles.metrics}>{[
            [language === "ar" ? "نسبة الخصومات من GMV" : "Deductions from GMV", pct(totalDeductions, gmv), "#2563eb"],
            [language === "ar" ? "هامش مجمل الربح" : "Gross Margin", pct(grossProfit, nmv), "#059669"],
            [language === "ar" ? "نسبة التسويق من NMV" : "Marketing from NMV", pct(marketingOpex, nmv), "#d97706"],
            [language === "ar" ? "هامش EBITDA" : "EBITDA Margin", pct(ebitda, nmv), "#7c3aed"],
          ].map(([label, value, accent], index) => <div className={styles.metric} style={{ "--metric": accent } as React.CSSProperties} key={label}><div className={`${styles.metricRing} ${styles.explainable}`} title={[hints.deductions,hints.gm,hints.marketing,hints.ebitdaRate][index]}><small>{value}</small></div><div><strong className={styles.explainable} title={[hints.deductions,hints.gm,hints.marketing,hints.ebitdaRate][index]}>{value}</strong><span>{label}</span></div></div>)}</div>

          <div className={styles.layout}>
            <div className={`${styles.panel} ${styles.statementPanel}`}>
              <div className={styles.panelTitle}><span>📋</span>{c.statement}</div><div className={styles.statementBody}>
              <Section title={`💰 ${c.revenue}`} tone="blue">
                <FinanceRow label={c.online} value={data.gmvOnline} money={money}/><FinanceRow label={c.showroom} value={data.gmvShowroom} money={money}/><FinanceRow label={c.cancellations} value={data.cancellations} money={money} negative/><FinanceRow label={c.discounts} value={data.discounts} money={money} negative/>
                {adjustments.map((item, index) => <EditableRow key={index} item={item} sign={item.type === "positive" ? "+" : "−"} onChange={(patch) => setAdjustments((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row))} onDelete={() => setAdjustments((rows) => rows.filter((_, i) => i !== index))}/>) }
                <Total label={c.totalGmv} value={gmv} money={money}/><Total label={c.nmv} value={nmv} money={money}/><Rates items={[["Cancellation / GMV", pct(data.cancellations, gmv)], ["Discount / GMV", pct(data.discounts, gmv)], ["NMV / GMV", pct(nmv, gmv)]]}/>
                <div className={styles.adjustmentButtons}><button className={styles.positiveButton} onClick={() => setAdjustments((rows) => [...rows, { label: c.newPositive, amount: 0, type: "positive" }])}>＋ {c.positive}</button><button className={styles.negativeButton} onClick={() => setAdjustments((rows) => [...rows, { label: c.newNegative, amount: 0, type: "negative" }])}>− {c.negative}</button></div>
              </Section>
              <Section title={`🚚 ${c.deliveries}`} tone="green"><FinanceRow label={c.warehouse} value={data.deliveredHomix} money={money}/><FinanceRow label={c.seller} value={data.deliveredVendor} money={money}/><Total label={c.totalDeliveries} value={data.g2n} money={money}/><Rates items={[["G2N / NMV", pct(data.g2n, nmv)], [language === "ar" ? "نسبة المخزن" : "Warehouse Mix", pct(data.deliveredHomix, data.g2n)], [language === "ar" ? "نسبة البائع" : "Seller Mix", pct(data.deliveredVendor, data.g2n)]]}/></Section>
              <Section title={`🏷️ ${c.cogs}`} tone="orange"><FinanceRow label={c.cogsGmv} value={data.cogsGmv} money={money}/><FinanceRow label={c.cogsNmv} value={data.cogsNmv} money={money}/><FinanceRow label={c.cogsG2n} value={data.cogsG2n} money={money}/><Rates items={[["COGS-GMV / GMV", pct(data.cogsGmv, gmv)], ["COGS-NMV / NMV", pct(data.cogsNmv, nmv)], ["COGS-G2N / G2N", pct(data.cogsG2n, data.g2n)]]}/></Section>
              <Section title={`⚙️ ${c.opex}`} tone="purple">
                {opex.map((item, index) => <EditableRow key={index} item={item} onChange={(patch) => setOpex((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row))} onDelete={index === 0 ? undefined : () => setOpex((rows) => rows.filter((_, i) => i !== index))}/>) }
                <Total label={c.totalOpex} value={draftOpex} money={money}/><Rates items={[[language === "ar" ? "هامش الربح" : "Gross Margin", pct(grossProfit, nmv)], ["OPEX / NMV", pct(draftOpex, nmv)], [language === "ar" ? "هامش EBITDA" : "EBITDA Margin", pct(ebitda, nmv)]]}/>
                <button className={styles.add} onClick={() => setOpex((rows) => [...rows, { label: c.newExpense, amount: 0 }])}>＋ {c.addExpense}</button>
              </Section>
              <button className={styles.save} disabled={saveOpex.isPending || saveAdjustments.isPending} onClick={persist}>{saveOpex.isPending || saveAdjustments.isPending ? c.saving : c.save}</button></div>
            </div>
            <ChartCard title={c.waterfall}><ResponsiveContainer width="100%" height={310}><BarChart margin={{ left: 22, right: 12, top: 8 }} data={[{ name: "NMV", value: nmv }, { name: "COGS", value: data.cogsNmv }, { name: "GP", value: grossProfit }, { name: "OPEX", value: draftOpex }, { name: "EBITDA", value: ebitda }]}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(value: number) => money.format(value)}/><Bar dataKey="value" radius={[6,6,0,0]}>{COLORS.slice(0,5).map((color) => <Cell key={color} fill={color}/>)}</Bar></BarChart></ResponsiveContainer></ChartCard>
          </div>

          <div className={styles.chartGrid}>
            <ChartCard title={c.channelChart}><Donut data={[{ name: c.online, value: data.gmvOnline }, { name: c.showroom, value: data.gmvShowroom }, ...adjustments.filter((x) => x.type === "positive").map((x) => ({ name: x.label, value: x.amount }))]} money={money}/></ChartCard>
            <ChartCard title={c.deliveryChart}><Donut data={[{ name: c.warehouse, value: data.deliveredHomix }, { name: c.seller, value: data.deliveredVendor }]} money={money}/></ChartCard>
            <ChartCard title={c.cogsChart}><ResponsiveContainer width="100%" height={240}><BarChart margin={{ left: 22, right: 12, top: 8 }} data={[{ name: "GMV", value: data.cogsGmv }, { name: "NMV", value: data.cogsNmv }, { name: "G2N", value: data.cogsG2n }]}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(value: number) => money.format(value)}/><Bar dataKey="value" fill="#d97706" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
          </div>

          <div className={styles.chartGridTwo}>
            <ChartCard title={c.monthlyChart}><ResponsiveContainer width="100%" height={280}><ComposedChart margin={{ left: 22, right: 12, top: 8, bottom: 8 }} data={displayHistoryRows.map((item) => ({ ...item, label: monthLabel(item.month) }))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="label"/><YAxis/><Tooltip formatter={(value: number) => money.format(value)}/><Legend/><Bar dataKey="gmv" name="GMV" fill="#2563eb"/><Bar dataKey="nmv" name="NMV" fill="#0d9488"/><Bar dataKey="grossMargin" name="GP" fill="#059669"/><Line dataKey="ebitda" name="EBITDA" stroke="#7c3aed" strokeWidth={3}/></ComposedChart></ResponsiveContainer></ChartCard>
            <ChartCard title={c.opexChart}><ResponsiveContainer width="100%" height={280}><BarChart margin={{ left: 22, right: 12, top: 8, bottom: 8 }} data={opex.map((item) => ({ name: item.label, value: item.amount }))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(value: number) => money.format(value)}/><Bar dataKey="value" fill="#7c3aed" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
          </div>

          <div className={`${styles.panel} ${styles.tablePanel}`}><div className={styles.panelTitle}>{c.monthlyTable}</div><div className={styles.tableWrap}><table><thead><tr>{[c.month,"GMV","NMV","G2N","Cancel%","COGS","GP","NP","GM%","OPEX","EBITDA","EBITDA%","Mktg%"].map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{displayHistoryRows.map((item) => <FinanceSummaryRow key={item.month} hints={hints} item={item} label={monthLabel(item.month)} money={money}/>)}</tbody></table></div></div>
        </>}
      </div>
    </DashboardLayout>
  );
}

function Section({ title, tone, children }: { title: string; tone: "blue"|"green"|"orange"|"purple"; children: React.ReactNode }) { return <div className={styles.section}><div className={`${styles.sectionTitle} ${styles[tone]}`}>{title}</div>{children}</div>; }
function FinanceRow({ label, value, negative, money }: { label:string; value:number; negative?:boolean; money:Intl.NumberFormat }) { return <div className={styles.row}><span>{label}</span><span className={`${styles.value} ${styles.explainable} ${negative ? styles.negative : ""}`} title={`${label}: ${money.format(value)}`}>{negative ? "− " : ""}{money.format(value)}</span></div>; }
function Total({ label, value, money }: { label:string; value:number; money:Intl.NumberFormat }) { return <div className={styles.total}><span>{label}</span><span className={styles.explainable} title={`${label}: ${money.format(value)}`}>{money.format(value)}</span></div>; }
function Rates({ items }: { items: string[][] }) { return <div className={styles.rateGrid}>{items.map(([label,value]) => <div className={styles.rate} key={label} title={`${label}: ${value}`}><span>{label}</span><strong className={styles.explainable}>{value}</strong></div>)}</div>; }
function EditableRow({ item, sign, onChange, onDelete }: { item:EditableOpex; sign?:string; onChange:(patch:Partial<EditableOpex>)=>void; onDelete?:()=>void }) { return <div className={styles.row}><input className={styles.labelInput} value={item.label} onChange={(e)=>onChange({label:e.target.value})}/><input className={`${styles.input} ${styles.explainable}`} min="0" title={`${item.label}: ${item.amount}`} type="number" value={item.amount} onChange={(e)=>onChange({amount:+e.target.value})}/>{sign && <strong className={sign === "+" ? styles.positive : styles.negative}>{sign}</strong>}{onDelete && <button aria-label="Delete" className={styles.delete} onClick={onDelete}>×</button>}</div>; }
function ChartCard({ title, children }: { title:string; children:React.ReactNode }) { return <div className={`${styles.panel} ${styles.chartCard}`}><div className={styles.panelTitle}><span>📊</span>{title}</div><div className={styles.chartBody}>{children}</div></div>; }
function Donut({ data, money }: { data:Array<{name:string;value:number}>; money:Intl.NumberFormat }) { const rows=data.filter((x)=>x.value>0); return rows.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>{rows.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={(value:number)=>money.format(value)}/><Legend/></PieChart></ResponsiveContainer> : <div className={styles.empty}>—</div>; }

function FinanceSummaryRow({ item, label, money, hints }: { item:FinanceDashboardData; label:string; money:Intl.NumberFormat; hints:typeof HINTS.ar|typeof HINTS.en }) {
  const g2nGrossProfit = item.g2n - item.cogsG2n;
  const g2nGrossMarginRate = item.g2n ? (g2nGrossProfit / item.g2n) * 100 : 0;
  const g2nEbitda = g2nGrossProfit - item.totalOpex;
  const g2nEbitdaRate = item.g2n ? (g2nEbitda / item.g2n) * 100 : 0;
  const marketing = +item.opex[0]?.amount || 0;
  const marketingRate = item.nmv ? (marketing / item.nmv) * 100 : 0;
  const deductionRate = item.gmv ? ((item.gmv - item.nmv) / item.gmv) * 100 : 0;
  const hasG2n = item.g2n > 0;
  const hasG2nCogs = item.cogsG2n > 0;
  const hasG2nProfit = hasG2n && hasG2nCogs;
  const rate = (value: number) => `${value.toFixed(1)}%`;
  const rateTone = (value: number): "green"|"red"|"yellow" => value >= 25 ? "green" : value >= 10 ? "yellow" : "red";
  const Value = ({ primary, secondary, tone, valueTone, hint }: { primary:React.ReactNode; secondary?:React.ReactNode; tone?:"blue"|"green"|"red"|"yellow"; valueTone?:"positive"|"negative"; hint:string }) => <td title={hint}><div className={`${styles.tablePrimary} ${styles.explainable} ${tone ? styles[`${tone}Pill`] : ""} ${valueTone ? styles[valueTone] : ""}`}>{primary}</div>{secondary !== undefined && <div className={`${styles.tableSecondary} ${styles.explainable}`}>{secondary}</div>}</td>;

  return <tr>
    <td className={styles.monthCell}>{label}</td>
    <Value hint={hints.gmv} primary={money.format(item.gmv)}/>
    <Value hint={hints.nmv} primary={money.format(item.nmv)} secondary={hasG2n ? money.format(item.g2n) : undefined} valueTone={item.nmv < 0 ? "negative" : "positive"}/>
    <Value hint={hints.g2n} primary={rate(item.g2nRate)} secondary={money.format(item.g2n)} tone="blue"/>
    <Value hint={hints.deductions} primary={rate(deductionRate)} tone={deductionRate > 15 ? "red" : "yellow"}/>
    <Value hint={hints.cogs} primary={money.format(item.cogsNmv)} secondary={hasG2nCogs ? money.format(item.cogsG2n) : undefined}/>
    <Value hint={hints.gp} primary={money.format(item.grossMargin)} secondary={hasG2nProfit ? money.format(g2nGrossProfit) : undefined} valueTone={item.grossMargin < 0 ? "negative" : "positive"}/>
    <Value hint={hints.np} primary={money.format(g2nGrossProfit)} valueTone={g2nGrossProfit < 0 ? "negative" : "positive"}/>
    <Value hint={hints.gm} primary={rate(item.grossMarginRate)} secondary={hasG2nProfit ? rate(g2nGrossMarginRate) : undefined} tone={rateTone(item.grossMarginRate)}/>
    <Value hint={hints.opex} primary={money.format(item.totalOpex)}/>
    <Value hint={hints.ebitda} primary={money.format(item.ebitda)} secondary={hasG2nProfit ? money.format(g2nEbitda) : undefined} valueTone={item.ebitda < 0 ? "negative" : "positive"}/>
    <Value hint={hints.ebitdaRate} primary={rate(item.ebitdaRate)} secondary={hasG2nProfit ? rate(g2nEbitdaRate) : undefined} tone={rateTone(item.ebitdaRate)}/>
    <Value hint={hints.marketing} primary={rate(marketingRate)} tone="yellow"/>
  </tr>;
}
