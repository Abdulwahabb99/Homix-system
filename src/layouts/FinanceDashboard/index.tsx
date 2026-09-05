import React, { useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
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
    cancellations: "الإلغاءات", discounts: "الخصومات", nmv: "صافي المبيعات (NMV)", positive: "قيمة موجبة",
    negative: "قيمة سالبة", newPositive: "قيمة موجبة جديدة", newNegative: "قيمة سالبة جديدة",
    deliveries: "التوصيلات / التنفيذ", warehouse: "توصيل المخزن", seller: "توصيل البائع", totalDeliveries: "إجمالي التوصيلات (G2N)",
    cogs: "تكلفة البضاعة", cogsGmv: "COGS — GMV (كل الطلبات)", cogsNmv: "COGS — NMV (بدون الإلغاء)", cogsG2n: "COGS — G2N (المسلّم)",
    opex: "مصروفات التشغيل (OPEX)", totalOpex: "إجمالي OPEX", addExpense: "إضافة مصروف", newExpense: "مصروف جديد",
    save: "حفظ الشهر", saving: "جارٍ الحفظ…", saved: "تم حفظ بيانات الشهر", saveError: "تعذر حفظ بيانات الشهر",
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
    cancellations: "Cancellations", discounts: "Discounts", nmv: "Net Sales (NMV)", positive: "Positive",
    negative: "Negative", newPositive: "New positive value", newNegative: "New negative value",
    deliveries: "Deliveries / Fulfillment", warehouse: "Warehouse Delivery", seller: "Seller Delivery", totalDeliveries: "Total Deliveries (G2N)",
    cogs: "Cost of Goods", cogsGmv: "COGS — GMV (all orders)", cogsNmv: "COGS — NMV (without cancellations)", cogsG2n: "COGS — G2N (delivered)",
    opex: "Operating Expenses (OPEX)", totalOpex: "Total OPEX", addExpense: "Add expense", newExpense: "New expense",
    save: "Save this month", saving: "Saving…", saved: "Monthly finance values saved", saveError: "Could not save monthly finance values",
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
  const [opex, setOpex] = useState<EditableOpex[]>([]);
  const [adjustments, setAdjustments] = useState<EditableAdjustment[]>([]);
  const c = COPY[language];
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
  const grossProfit = data ? nmv - data.cogsNmv : 0;
  const ebitda = grossProfit - draftOpex;

  const toggleLanguage = () => setLanguage((value) => {
    const next = value === "en" ? "ar" : "en";
    localStorage.setItem("finance-dashboard-language", next);
    return next;
  });
  const persist = async () => {
    try {
      await saveOpex.mutateAsync(opex.map(({ label, amount }) => ({ label: label.trim(), amount: +amount || 0 })).filter((item) => item.label));
      await saveAdjustments.mutateAsync(adjustments.map(({ label, amount, type }) => ({ label: label.trim(), amount: +amount || 0, type })).filter((item) => item.label));
      toast.success(c.saved);
    } catch { toast.error(c.saveError); }
  };
  const monthLabel = (value: string) => new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T00:00:00Z`));
  const historyRows = history?.items ?? [];

  return (
    <DashboardLayout pageTitle={c.title} pageSubtitle={c.subtitle}>
      <div className={styles.page} dir={language === "ar" ? "rtl" : "ltr"}>
        <div className={styles.top}>
          <div><strong>{c.title}</strong><div>{c.subtitle}</div></div>
          <div className={styles.controls}><input aria-label={c.month} className={styles.month} type="month" value={month} onChange={(event) => setMonth(event.target.value)} /><button className={styles.language} onClick={toggleLanguage}>{language === "en" ? "العربية" : "English"}</button></div>
        </div>
        {isError && <div className={styles.error}>{c.loadError}. <button onClick={() => refetch()}>{c.retry}</button></div>}
        {isLoading && <div className={styles.panel}>{c.loading}</div>}
        {data && <>
          <div className={styles.kpis}>{[
            ["GMV", gmv, c.allOrders, "#2563eb"], ["NMV", nmv, `${pct(nmv, gmv)} GMV`, "#0d9488"],
            ["COGS — NMV", data.cogsNmv, c.nonCancelled, "#d97706"], [language === "ar" ? "مجمل الربح" : "Gross Profit", grossProfit, `${pct(grossProfit, nmv)} ${c.margin}`, "#059669"],
            ["EBITDA", ebitda, `${c.opex}: ${money.format(draftOpex)}`, "#7c3aed"],
          ].map(([label, value, sub, accent]) => <div className={styles.kpi} style={{ "--accent": accent } as React.CSSProperties} key={String(label)}><div className={styles.kpiLabel}>{label}</div><div className={styles.kpiValue}>{money.format(Number(value))}</div><div className={styles.kpiSub}>{sub}</div></div>)}</div>

          <div className={styles.metrics}>{[
            [language === "ar" ? "نسبة الإلغاء" : "Cancellation Rate", pct(data.cancellations, gmv)], ["NMV / GMV", pct(nmv, gmv)],
            ["G2N / NMV", pct(data.g2n, nmv)], [language === "ar" ? "هامش الربح" : "Gross Margin", pct(grossProfit, nmv)],
            [language === "ar" ? "هامش EBITDA" : "EBITDA Margin", pct(ebitda, nmv)],
          ].map(([label, value]) => <div className={styles.metric} key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>

          <div className={styles.layout}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>{c.statement}</div>
              <Section title={`💰 ${c.revenue}`} tone="blue">
                <FinanceRow label={c.online} value={data.gmvOnline} money={money}/><FinanceRow label={c.showroom} value={data.gmvShowroom} money={money}/><FinanceRow label={c.cancellations} value={data.cancellations} money={money} negative/><FinanceRow label={c.discounts} value={data.discounts} money={money} negative/>
                {adjustments.map((item, index) => <EditableRow key={index} item={item} sign={item.type === "positive" ? "+" : "−"} onChange={(patch) => setAdjustments((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row))} onDelete={() => setAdjustments((rows) => rows.filter((_, i) => i !== index))}/>) }
                <Total label={c.nmv} value={nmv} money={money}/><Rates items={[["Cancellation / GMV", pct(data.cancellations, gmv)], ["Discount / GMV", pct(data.discounts, gmv)], ["NMV / GMV", pct(nmv, gmv)]]}/>
                <div className={styles.adjustmentButtons}><button className={styles.positiveButton} onClick={() => setAdjustments((rows) => [...rows, { label: c.newPositive, amount: 0, type: "positive" }])}>＋ {c.positive}</button><button className={styles.negativeButton} onClick={() => setAdjustments((rows) => [...rows, { label: c.newNegative, amount: 0, type: "negative" }])}>− {c.negative}</button></div>
              </Section>
              <Section title={`🚚 ${c.deliveries}`} tone="green"><FinanceRow label={c.warehouse} value={data.deliveredHomix} money={money}/><FinanceRow label={c.seller} value={data.deliveredVendor} money={money}/><Total label={c.totalDeliveries} value={data.g2n} money={money}/><Rates items={[["G2N / NMV", pct(data.g2n, nmv)], [language === "ar" ? "نسبة المخزن" : "Warehouse Mix", pct(data.deliveredHomix, data.g2n)], [language === "ar" ? "نسبة البائع" : "Seller Mix", pct(data.deliveredVendor, data.g2n)]]}/></Section>
              <Section title={`🏷️ ${c.cogs}`} tone="orange"><FinanceRow label={c.cogsGmv} value={data.cogsGmv} money={money}/><FinanceRow label={c.cogsNmv} value={data.cogsNmv} money={money}/><FinanceRow label={c.cogsG2n} value={data.cogsG2n} money={money}/><Rates items={[["COGS-GMV / GMV", pct(data.cogsGmv, gmv)], ["COGS-NMV / NMV", pct(data.cogsNmv, nmv)], ["COGS-G2N / G2N", pct(data.cogsG2n, data.g2n)]]}/></Section>
              <Section title={`⚙️ ${c.opex}`} tone="purple">
                {opex.map((item, index) => <EditableRow key={index} item={item} onChange={(patch) => setOpex((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row))} onDelete={() => setOpex((rows) => rows.filter((_, i) => i !== index))}/>) }
                <Total label={c.totalOpex} value={draftOpex} money={money}/><Rates items={[[language === "ar" ? "هامش الربح" : "Gross Margin", pct(grossProfit, nmv)], ["OPEX / NMV", pct(draftOpex, nmv)], [language === "ar" ? "هامش EBITDA" : "EBITDA Margin", pct(ebitda, nmv)]]}/>
                <button className={styles.add} onClick={() => setOpex((rows) => [...rows, { label: c.newExpense, amount: 0 }])}>＋ {c.addExpense}</button>
              </Section>
              <button className={styles.save} disabled={saveOpex.isPending || saveAdjustments.isPending} onClick={persist}>{saveOpex.isPending || saveAdjustments.isPending ? c.saving : c.save}</button>
            </div>
            <ChartCard title={c.waterfall}><ResponsiveContainer width="100%" height={310}><BarChart data={[{ name: "NMV", value: nmv }, { name: "COGS", value: data.cogsNmv }, { name: "GP", value: grossProfit }, { name: "OPEX", value: draftOpex }, { name: "EBITDA", value: ebitda }]}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(value: number) => money.format(value)}/><Bar dataKey="value" radius={[6,6,0,0]}>{COLORS.slice(0,5).map((color) => <Cell key={color} fill={color}/>)}</Bar></BarChart></ResponsiveContainer></ChartCard>
          </div>

          <div className={styles.chartGrid}>
            <ChartCard title={c.channelChart}><Donut data={[{ name: c.online, value: data.gmvOnline }, { name: c.showroom, value: data.gmvShowroom }, ...adjustments.filter((x) => x.type === "positive").map((x) => ({ name: x.label, value: x.amount }))]} money={money}/></ChartCard>
            <ChartCard title={c.deliveryChart}><Donut data={[{ name: c.warehouse, value: data.deliveredHomix }, { name: c.seller, value: data.deliveredVendor }]} money={money}/></ChartCard>
            <ChartCard title={c.cogsChart}><ResponsiveContainer width="100%" height={240}><BarChart data={[{ name: "GMV", value: data.cogsGmv }, { name: "NMV", value: data.cogsNmv }, { name: "G2N", value: data.cogsG2n }]}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(value: number) => money.format(value)}/><Bar dataKey="value" fill="#d97706" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
          </div>

          <div className={styles.chartGridTwo}>
            <ChartCard title={c.monthlyChart}><ResponsiveContainer width="100%" height={280}><ComposedChart data={historyRows.map((item) => ({ ...item, label: monthLabel(item.month) }))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="label"/><YAxis/><Tooltip formatter={(value: number) => money.format(value)}/><Legend/><Bar dataKey="gmv" name="GMV" fill="#2563eb"/><Bar dataKey="nmv" name="NMV" fill="#0d9488"/><Bar dataKey="grossMargin" name="GP" fill="#059669"/><Line dataKey="ebitda" name="EBITDA" stroke="#7c3aed" strokeWidth={3}/></ComposedChart></ResponsiveContainer></ChartCard>
            <ChartCard title={c.opexChart}><ResponsiveContainer width="100%" height={280}><BarChart data={opex.map((item) => ({ name: item.label, value: item.amount }))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(value: number) => money.format(value)}/><Bar dataKey="value" fill="#7c3aed" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
          </div>

          <div className={`${styles.panel} ${styles.tablePanel}`}><div className={styles.panelTitle}>{c.monthlyTable}</div><div className={styles.tableWrap}><table><thead><tr>{[c.month,"GMV","NMV","G2N","Cancel%","COGS","GP","GM%","OPEX","EBITDA","EBITDA%"].map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{historyRows.map((item) => <tr key={item.month}><td>{monthLabel(item.month)}</td><td>{money.format(item.gmv)}</td><td>{money.format(item.nmv)}</td><td>{money.format(item.g2n)}</td><td>{item.cancellationRate}%</td><td>{money.format(item.cogsNmv)}</td><td>{money.format(item.grossMargin)}</td><td>{item.grossMarginRate}%</td><td>{money.format(item.totalOpex)}</td><td className={item.ebitda < 0 ? styles.negative : styles.positive}>{money.format(item.ebitda)}</td><td>{item.ebitdaRate}%</td></tr>)}</tbody></table></div></div>
        </>}
      </div>
    </DashboardLayout>
  );
}

function Section({ title, tone, children }: { title: string; tone: "blue"|"green"|"orange"|"purple"; children: React.ReactNode }) { return <div className={styles.section}><div className={`${styles.sectionTitle} ${styles[tone]}`}>{title}</div>{children}</div>; }
function FinanceRow({ label, value, negative, money }: { label:string; value:number; negative?:boolean; money:Intl.NumberFormat }) { return <div className={styles.row}><span>{label}</span><span className={`${styles.value} ${negative ? styles.negative : ""}`}>{negative ? "− " : ""}{money.format(value)}</span></div>; }
function Total({ label, value, money }: { label:string; value:number; money:Intl.NumberFormat }) { return <div className={styles.total}><span>{label}</span><span>{money.format(value)}</span></div>; }
function Rates({ items }: { items: string[][] }) { return <div className={styles.rateGrid}>{items.map(([label,value]) => <div className={styles.rate} key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>; }
function EditableRow({ item, sign, onChange, onDelete }: { item:EditableOpex; sign?:string; onChange:(patch:Partial<EditableOpex>)=>void; onDelete:()=>void }) { return <div className={styles.row}><input className={styles.labelInput} value={item.label} onChange={(e)=>onChange({label:e.target.value})}/><input className={styles.input} min="0" type="number" value={item.amount} onChange={(e)=>onChange({amount:+e.target.value})}/>{sign && <strong className={sign === "+" ? styles.positive : styles.negative}>{sign}</strong>}<button aria-label="Delete" className={styles.delete} onClick={onDelete}>×</button></div>; }
function ChartCard({ title, children }: { title:string; children:React.ReactNode }) { return <div className={`${styles.panel} ${styles.chartCard}`}><div className={styles.panelTitle}>{title}</div>{children}</div>; }
function Donut({ data, money }: { data:Array<{name:string;value:number}>; money:Intl.NumberFormat }) { const rows=data.filter((x)=>x.value>0); return rows.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>{rows.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={(value:number)=>money.format(value)}/><Legend/></PieChart></ResponsiveContainer> : <div className={styles.empty}>—</div>; }
