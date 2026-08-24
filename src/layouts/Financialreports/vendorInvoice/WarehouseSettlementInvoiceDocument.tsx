/* eslint-disable react/prop-types */
/**
 * فاتورة تسوية المخزن — يُلتقط إلى PDF عبر html2pdf.
 * تُملأ من بيانات تبويب «تسويات المخزن»؛ بيانات هوميكس/البنك من `vendorInvoiceConstants`.
 */
import React from "react";
import logo from "../../../assets/images/homix.png";
import { money } from "../utils/calc";
import { SellerTotals, SettlementSeller } from "../utils/types";
import type { FinancialCycle } from "query/financialReport";
import {
  HOMIX_BANK_DETAILS,
  VENDOR_INVOICE_FOOTER_BRAND,
  VENDOR_INVOICE_FOOTER_NOTE,
} from "./vendorInvoiceConstants";
import styles from "./VendorSettlementInvoice.module.css";

function formatDateArabic(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** رقم الفاتورة — مشتق من معرّف المورّد ودورة الفوترة، لا يوجد ترقيم مركزي بعد. */
function buildInvoiceNumber(sellerId: string, cycle: FinancialCycle | null): string {
  const cycleNo = cycle?.billingDay === 13 ? "1" : cycle?.billingDay === 28 ? "2" : "-";
  const month = cycle?.referenceDate ? new Date(cycle.referenceDate) : new Date();
  const mm = Number.isNaN(month.getTime()) ? "--" : String(month.getMonth() + 1).padStart(2, "0");
  return `#W${sellerId}-${mm}-C${cycleNo}`;
}

function cycleBadgeLabel(cycle: FinancialCycle | null): string {
  if (!cycle) return "—";
  const cycleNo = cycle.billingDay === 13 ? "1" : cycle.billingDay === 28 ? "2" : "";
  const ref = cycle.referenceDate ? new Date(cycle.referenceDate) : null;
  const monthLabel = ref && !Number.isNaN(ref.getTime())
    ? new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(ref)
    : "";
  return `دورة ${cycleNo} — ${monthLabel}`.trim();
}

const WarehouseSettlementInvoiceDocument = React.forwardRef<
  HTMLDivElement,
  { seller: SettlementSeller; totals: SellerTotals; cycle: FinancialCycle | null }
>(({ seller, totals, cycle }, ref) => {
  const orders = seller.row.orders;
  const issueDate = formatDateArabic(new Date().toISOString());

  return (
    <div className={styles.invoiceRoot}>
      <div className={styles.paper} ref={ref} dir="rtl" lang="ar">
        {/* HEADER */}
        <div className={styles.invHeader}>
          <div>
            <img src={logo} alt="HOMIX" className={styles.logoImg} />
            <div className={styles.bankBlock}>
              <div className={styles.bankTitle}>بيانات التحويل البنكي</div>
              <div className={styles.bankTable}>
                <span className={styles.bkLbl}>البنك</span>
                <span className={styles.bkVal}>{HOMIX_BANK_DETAILS.bank}</span>
                <span className={styles.bkLbl}>رقم الحساب</span>
                <span className={styles.bkVal}>{HOMIX_BANK_DETAILS.accountNumber}</span>
                <span className={styles.bkLbl}>الاسم</span>
                <span className={`${styles.bkVal} ${styles.bkValName}`}>{HOMIX_BANK_DETAILS.accountName}</span>
                <div className={styles.bkSep} />
                <span className={styles.bkLbl}>InstaPay</span>
                <span className={styles.bkVal}>{HOMIX_BANK_DETAILS.instapay}</span>
              </div>
            </div>
          </div>
          <div className={styles.invMeta}>
            <div className={styles.invType}>Warehouse Settlement Invoice</div>
            <div className={styles.invNumber}><span className={styles.ltr}>{buildInvoiceNumber(seller.id, cycle)}</span></div>
            <div className={styles.invBadge}>{cycleBadgeLabel(cycle)}</div>
            <div className={styles.invDates}>تاريخ الإصدار: {issueDate}</div>
          </div>
        </div>

        {/* PARTIES */}
        <div className={styles.parties}>
          <div className={`${styles.party} ${styles.partyFirst}`}>
            <div className={styles.pTag}>المورّد</div>
            <div className={styles.pName}>{seller.name}</div>
            <div className={styles.pLine}>هوميكس ماركت بليس</div>
          </div>
          <div className={styles.party}>
            <div className={styles.pTag}>هوميكس</div>
            <div className={styles.pName}>هوميكس</div>
            <div className={styles.pLine}>{HOMIX_BANK_DETAILS.bank} — {HOMIX_BANK_DETAILS.accountNumber}</div>
            <div className={styles.pLine}>InstaPay: {HOMIX_BANK_DETAILS.instapay}</div>
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.secTitle}>بنود تسويات المخزن</div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={`${styles.th} ${styles.thFirst}`}>رقم العملية</th>
              <th className={styles.th}>رقم الطلب</th>
              <th className={styles.th}>كود المنتج</th>
              <th className={styles.th}>سعر التكلفة</th>
              <th className={`${styles.th} ${styles.c} ${styles.thLast}`}>الغرامات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const rowClass = idx === orders.length - 1 ? styles.rowLast : "";
              return (
                <tr key={order.id} className={rowClass}>
                  <td className={`${styles.td} ${styles.tdFirst}`}>
                    <span className={styles.op}>{order.operationNumber || `OP-${order.id}`}</span>
                  </td>
                  <td className={styles.td}><span className={styles.onum}>#{order.orderNumber || order.id}</span></td>
                  <td className={styles.td}><span className={styles.pcode}>{order.productCode || "—"}</span></td>
                  <td className={styles.td}><span className={styles.dueH}>{money(order.warehouseCost)}</span></td>
                  <td className={`${styles.td} ${styles.c} ${styles.tdLast}`}>
                    {order.fines > 0
                      ? <span className={styles.fine}>{money(order.fines)}</span>
                      : <span className={styles.dash}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className={styles.totalsArea}>
          <div className={styles.totalsBox}>
            <div className={styles.tRow}>
              <span className={styles.tLbl}>عدد الطلبات</span>
              <span className={styles.tVal}>{totals.orders}</span>
            </div>
            <div className={styles.tRow}>
              <span className={styles.tLbl}>إجمالي التكلفة</span>
              <span className={`${styles.tVal} ${styles.tValBlue}`}>{money(totals.cost)}</span>
            </div>
            <div className={`${styles.tRow} ${styles.tRowLast}`}>
              <span className={styles.tLbl}>إجمالي الغرامات</span>
              <span className={`${styles.tVal} ${styles.tValRed}`}>{money(totals.fine)}</span>
            </div>
            <div className={styles.tFinal}>
              <div>
                <div className={styles.tfLabel}>الصافي المطلوب</div>
                <div className={styles.tfSub}>التكلفة بعد خصم الغرامات</div>
              </div>
              <div className={styles.tfVal}>{money(totals.netRequired)}</div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.invFooter}>
          <div className={styles.footL}><strong className={styles.footLStrong}>هوميكس</strong> · {VENDOR_INVOICE_FOOTER_BRAND}</div>
          <div className={styles.footR}>{VENDOR_INVOICE_FOOTER_NOTE} · <span className={styles.ltr}>{buildInvoiceNumber(seller.id, cycle)}</span> · صفحة 1 من 1</div>
        </div>
      </div>
    </div>
  );
});

WarehouseSettlementInvoiceDocument.displayName = "WarehouseSettlementInvoiceDocument";

export default WarehouseSettlementInvoiceDocument;
