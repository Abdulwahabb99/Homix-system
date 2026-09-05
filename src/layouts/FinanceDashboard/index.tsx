import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { toast } from "react-toastify";
import { useFinanceDashboard, useSaveFinanceOpex } from "query/financeDashboard.api";
import styles from "./FinanceDashboard.module.css";

const DEFAULT_OPEX = ["Marketing & Ads", "Salaries", "Rent", "Tools & Software", "Shipping Ops", "Vehicles"];
const money = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 2 });
const currentMonth = () => new Date().toISOString().slice(0, 7);

type EditableOpex = { label: string; amount: number };

function FinanceRow({ label, value, negative = false }: { label: string; value: number; negative?: boolean }) {
  return <div className={styles.row}><span>{label}</span><span className={`${styles.value} ${negative ? styles.negative : ""}`}>{negative ? "− " : ""}{money.format(value)}</span></div>;
}

export default function FinanceDashboard() {
  const [month, setMonth] = useState(currentMonth);
  const { data, isLoading, isError, refetch } = useFinanceDashboard(month);
  const saveOpex = useSaveFinanceOpex(month);
  const [opex, setOpex] = useState<EditableOpex[]>([]);

  useEffect(() => {
    if (!data) return;
    setOpex(data.opex.length ? data.opex.map(({ label, amount }) => ({ label, amount })) : DEFAULT_OPEX.map((label) => ({ label, amount: 0 })));
  }, [data]);

  const draftTotal = useMemo(() => opex.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [opex]);

  const updateOpex = (index: number, patch: Partial<EditableOpex>) => setOpex((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  const persistOpex = async () => {
    try {
      await saveOpex.mutateAsync(opex.map(({ label, amount }) => ({ label: label.trim(), amount: Number(amount) || 0 })).filter((item) => item.label));
      toast.success("Operating expenses saved");
    } catch { toast.error("Could not save operating expenses"); }
  };

  return (
    <DashboardLayout pageTitle="Marketplace P&L" pageSubtitle="Monthly profit and loss dashboard">
      <div className={styles.page}>
        <div className={styles.top}>
          <div><strong>Finance dashboard</strong><div>Automatic order metrics + saved monthly OPEX</div></div>
          <input aria-label="Finance month" className={styles.month} type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </div>
        {isError && <div className={styles.error}>Could not load this month. <button onClick={() => refetch()}>Try again</button></div>}
        {isLoading && <div className={styles.panel}>Loading finance totals…</div>}
        {data && <>
          <div className={styles.kpis}>
            {[
              ["GMV", data.gmv, "All orders, before deductions", "#2563eb"],
              ["NMV", data.nmv, `${data.cancellationRate}% cancellation rate`, "#0d9488"],
              ["COGS — NMV", data.cogsNmv, "Non-cancelled orders", "#d97706"],
              ["Gross Profit", data.grossMargin, `${data.grossMarginRate}% margin`, "#059669"],
              ["EBITDA", data.grossMargin - draftTotal, `OPEX ${money.format(draftTotal)}`, "#7c3aed"],
            ].map(([label, value, sub, accent]) => <div className={styles.kpi} style={{ "--accent": accent } as React.CSSProperties} key={String(label)}><div className={styles.kpiLabel}>{label}</div><div className={styles.kpiValue}>{money.format(Number(value))}</div><div className={styles.kpiSub}>{sub}</div></div>)}
          </div>
          <div className={styles.layout}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>P&L Statement</div>
              <div className={styles.section}><div className={`${styles.sectionTitle} ${styles.blue}`}>💰 REVENUE</div>
                <FinanceRow label="GMV Online" value={data.gmvOnline}/><FinanceRow label="GMV Showroom" value={data.gmvShowroom}/><FinanceRow label="Cancellations" value={data.cancellations} negative/><FinanceRow label="Discounts" value={data.discounts} negative/>
                <div className={styles.total}><span>Net Sales (NMV)</span><span>{money.format(data.nmv)}</span></div>
              </div>
              <div className={styles.section}><div className={`${styles.sectionTitle} ${styles.green}`}>🚚 DELIVERIES / FULFILLMENT</div>
                <FinanceRow label="Warehouse Delivery" value={data.deliveredHomix}/><FinanceRow label="Seller Delivery" value={data.deliveredVendor}/>
                <div className={styles.total}><span>Total Deliveries (G2N)</span><span>{money.format(data.g2n)}</span></div>
              </div>
              <div className={styles.section}><div className={`${styles.sectionTitle} ${styles.orange}`}>🏷️ COST OF GOODS</div>
                <FinanceRow label="COGS — GMV (all orders)" value={data.cogsGmv}/><FinanceRow label="COGS — NMV (without cancellations)" value={data.cogsNmv}/><FinanceRow label="COGS — G2N (delivered)" value={data.cogsG2n}/>
              </div>
              <div className={styles.section}><div className={`${styles.sectionTitle} ${styles.purple}`}>⚙️ OPERATING EXPENSES (OPEX)</div>
                {opex.map((item, index) => <div className={styles.row} key={`${index}-${item.label}`}><input className={styles.labelInput} value={item.label} onChange={(event) => updateOpex(index, { label: event.target.value })}/><input className={styles.input} min="0" type="number" value={item.amount} onChange={(event) => updateOpex(index, { amount: Number(event.target.value) })}/><button aria-label={`Delete ${item.label}`} className={styles.delete} onClick={() => setOpex((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}>×</button></div>)}
                <div className={styles.total}><span>Total OPEX</span><span>{money.format(draftTotal)}</span></div>
                <button className={styles.add} onClick={() => setOpex((rows) => [...rows, { label: "New expense", amount: 0 }])}>＋ Add expense</button>
              </div>
              <button className={styles.save} disabled={saveOpex.isPending} onClick={persistOpex}>{saveOpex.isPending ? "Saving…" : "Save this month"}</button>
            </div>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Calculation bases</div>
              <div className={styles.formula}>
                <div className={styles.formulaCard}><span>GMV basis</span><strong>{money.format(data.gmv)}</strong><small>Every order grouped by ORDER_SOURCE, including cancelled orders.</small></div>
                <div className={styles.formulaCard}><span>NMV basis</span><strong>{money.format(data.nmv)}</strong><small>GMV minus cancelled net order value and all discounts.</small></div>
                <div className={styles.formulaCard}><span>G2N basis</span><strong>{money.format(data.g2n)}</strong><small>Only DELIVERED orders, grouped by DELIVERY_BY.</small></div>
              </div>
            </div>
          </div>
        </>}
      </div>
    </DashboardLayout>
  );
}
