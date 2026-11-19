/**
 * «كشف تسوية مورد» — مستند الـ PDF/الطباعة بتصميم النموذج المرجعي (794×1122 كامل الصفحة).
 * عرض فقط: يستقبل `StatementData` جاهزاً (انظر `statementFormat.ts`)، فالمحوّلان
 * (الفاتورة الحية والمحفوظة) رفيعان. لا يستخدم letter-spacing في أي مكان (خلل html2canvas مع العربية).
 */
import React, { useLayoutEffect, useState } from "react";
import HomixWordmark from "./HomixWordmark";
import StatementStamp from "./StatementStamp";
import {
  STATEMENT_DELIVERY_LABEL,
  STATEMENT_STATUS_COLORS,
  fmtLatin,
  type StatementData,
} from "./statementFormat";
import {
  HOMIX_BANK_DETAILS,
  HOMIX_ISSUER_NAME,
  HOMIX_MARKETPLACE_LABEL,
  HOMIX_TAGLINE,
  HOMIX_WEBSITE,
  VENDOR_INVOICE_FOOTER_NOTE,
} from "./vendorInvoiceConstants";
import styles from "./SettlementStatement.module.css";

export const STATEMENT_PAGE_HEIGHT = 1122;

const BANK_ROWS: Array<[string, string]> = [
  ["البنك", HOMIX_BANK_DETAILS.bank],
  ["رقم الحساب", HOMIX_BANK_DETAILS.accountNumber],
  ["اسم الحساب", HOMIX_BANK_DETAILS.accountName],
  ["InstaPay", HOMIX_BANK_DETAILS.instapay],
];

function Money({ value, className }: { value: number; className?: string }) {
  return (
    <span className={styles.money}>
      <span className={className}>{fmtLatin(value)}</span>
      <span className={styles.cur}>ج.م</span>
    </span>
  );
}

function Cell({ value, tone }: { value: number; tone: string }) {
  return value > 0 ? <span className={tone}>{fmtLatin(value)}</span> : <span className={styles.dash}>—</span>;
}

const SettlementStatement = React.forwardRef<HTMLDivElement, { data: StatementData }>(({ data }, ref) => {
  const [pages, setPages] = useState(1);
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const node = innerRef.current;
    if (node) setPages(Math.max(1, Math.ceil(node.scrollHeight / STATEMENT_PAGE_HEIGHT)));
  }, [data]);

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const pill = STATEMENT_STATUS_COLORS[data.overdue ? "overdue" : data.status];
  const adj = data.adjustmentsTotal;

  return (
    <div className={styles.page} ref={setRefs} dir="rtl" lang="ar" style={{ minHeight: pages * STATEMENT_PAGE_HEIGHT }}>
      <div className={styles.goldBar} />
      <header className={styles.header}>
        <div className={styles.brand}>
          <HomixWordmark />
          <div className={styles.subtitle}>كشف تسوية مورد</div>
        </div>
        <div className={styles.numBlock}>
          <div className={styles.numLabel}>رقم الفاتورة</div>
          <div className={styles.number}>{data.number}</div>
        </div>
        <div className={styles.meta}>
          <div className={`${styles.metaCell} ${styles.metaFirst}`}>
            <div className={styles.metaLabel}>الدورة</div>
            <div className={styles.metaValue}>{data.cycleLabel}</div>
          </div>
          <div className={styles.metaCell}>
            <div className={styles.metaLabel}>الشهر</div>
            <div className={styles.metaValue}>{data.monthLabel}</div>
          </div>
          <div className={styles.metaCell}>
            <div className={styles.metaLabel}>تاريخ الإصدار</div>
            <div className={styles.metaValue}>{data.issueDateLabel}</div>
          </div>
          <div className={`${styles.metaCell} ${styles.metaLast}`}>
            <div className={styles.metaLabel}>الحالة</div>
            <div className={styles.metaValue}>
              <span className={styles.pill} style={{ background: pill.bg, color: pill.fg }}>
                {data.overdue ? "متأخرة" : data.statusLabel}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>مستحق البائع</div>
          <Money value={data.vendorDueTotal} className={`${styles.cardNum} ${styles.green}`} />
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>مستحق هوميكس</div>
          <Money value={data.companyDueTotal} className={`${styles.cardNum} ${styles.navy}`} />
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>الغرامات</div>
          <Money value={data.finesTotal} className={`${styles.cardNum} ${styles.red}`} />
        </div>
        <div className={`${styles.card} ${styles.cardNet}`}>
          <div className={`${styles.cardLabel} ${styles.gold}`}>صافي المستحق</div>
          <Money value={data.net} className={`${styles.cardNumNet} ${styles.navy}`} />
          {data.netOwedToHomix && <div className={styles.netNote}>مستحق لهوميكس</div>}
        </div>
      </section>

      <section className={styles.parties}>
        <div>
          <div className={styles.pTag}>المورد</div>
          <div className={styles.pMain}>{data.vendorName}</div>
          <div className={styles.pSub}>{HOMIX_MARKETPLACE_LABEL}</div>
        </div>
        <div>
          <div className={styles.pTag}>الجهة المُصدِرة</div>
          <div className={styles.pMain}>{HOMIX_ISSUER_NAME}</div>
          <div className={`${styles.pSub} ${styles.ltr}`}>{HOMIX_WEBSITE}</div>
        </div>
        <div>
          <div className={styles.pTag}>ملخص الدورة</div>
          <div className={styles.pMain}>{fmtLatin(data.ordersCount)} طلب</div>
          <div className={styles.pSub}>{fmtLatin(data.operationsCount)} عملية</div>
        </div>
      </section>

      <table className={styles.table}>
        <colgroup>
          <col style={{ width: "14.4%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13.2%" }} />
          <col style={{ width: "17.8%" }} />
          <col style={{ width: "16.6%" }} />
          <col style={{ width: "14.5%" }} />
          <col style={{ width: "10.5%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>رقم العملية</th>
            <th>رقم الطلب</th>
            <th>كود المنتج</th>
            <th>التوصيل</th>
            <th>مستحق هوميكس</th>
            <th>مستحق البائع</th>
            <th>الغرامات</th>
          </tr>
        </thead>
        <tbody>
          {data.lines.length === 0 ? (
            <tr className={styles.emptyRow}>
              <td colSpan={7}>لم تتم إضافة بنود بعد</td>
            </tr>
          ) : data.lines.map((line) => (
            <tr key={line.key} className={styles.row}>
              <td><span className={styles.op}>{line.operationNumber}</span></td>
              <td><span className={styles.onum}>#{line.orderNumber}</span></td>
              <td>{line.productCode ? <span className={styles.pcode}>{line.productCode}</span> : <span className={styles.dash}>—</span>}</td>
              <td>
                <span className={`${styles.chip} ${line.homixDelivery ? styles.chipHomix : styles.chipVendor}`}>
                  {line.homixDelivery ? STATEMENT_DELIVERY_LABEL.homix : STATEMENT_DELIVERY_LABEL.vendor}
                </span>
              </td>
              <td><Cell value={line.companyDue} tone={styles.dueH} /></td>
              <td><Cell value={line.vendorDue} tone={styles.dueV} /></td>
              <td><Cell value={line.fines} tone={styles.fine} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className={styles.bottom}>
        <div className={styles.bank}>
          <div className={styles.bankTitle}>بيانات التحويل البنكي — {HOMIX_ISSUER_NAME}</div>
          {BANK_ROWS.map(([label, value]) => (
            <div key={label} className={styles.bankRow}>
              <span className={styles.bankLabel}>{label}</span>
              <span className={styles.bankValue}>{value}</span>
            </div>
          ))}
        </div>
        <div className={styles.totalsCol}>
          <div className={styles.totals}>
            <div className={styles.tRow}>
              <span className={styles.tLabel}>مستحق البائع (إجمالي)</span>
              <Money value={data.vendorDueTotal} className={`${styles.tNum} ${styles.green}`} />
            </div>
            <div className={styles.tRow}>
              <span className={styles.tLabel}>مستحق هوميكس</span>
              <Money value={data.companyDueTotal} className={`${styles.tNum} ${styles.navy}`} />
            </div>
            <div className={styles.tRow}>
              <span className={styles.tLabel}>الغرامات</span>
              <Money value={data.finesTotal} className={`${styles.tNum} ${styles.red}`} />
            </div>
            {adj !== null && (
              <div className={styles.tRow}>
                <span className={styles.tLabel}>تعديلات يدوية</span>
                <span className={styles.money}>
                  <span className={`${styles.tNum} ${styles.ltr}`}>{adj > 0 ? "+" : "−"}{fmtLatin(Math.abs(adj))}</span>
                  <span className={styles.cur}>ج.م</span>
                </span>
              </div>
            )}
            <div className={styles.netRule} />
            <div className={styles.netRow}>
              <span className={styles.netLabel}>
                صافي المستحق
                {data.netOwedToHomix && <span className={styles.netSub}>مستحق لهوميكس</span>}
              </span>
              <Money value={data.net} className={styles.netNum} />
            </div>
          </div>
          {data.stampDate && (
            <div className={styles.stampWrap}><StatementStamp date={data.stampDate} /></div>
          )}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footBrand}>
          <strong>{HOMIX_ISSUER_NAME}</strong> · {HOMIX_TAGLINE} · <span className={styles.ltr}>{HOMIX_WEBSITE}</span>
        </div>
        <div className={styles.footNote}>
          {VENDOR_INVOICE_FOOTER_NOTE} · <span className={styles.ltr}>{data.number}</span> · صفحة {pages} من {pages}
        </div>
      </footer>
    </div>
  );
});

SettlementStatement.displayName = "SettlementStatement";

export default SettlementStatement;
