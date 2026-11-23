/**
 * «كشف تسوية مورد» — مستند الـ PDF/الطباعة بتصميم النموذج المرجعي (794×1122 كامل الصفحة).
 * عرض فقط: يستقبل `StatementData` جاهزاً (انظر `statementFormat.ts`)، فالمحوّلان
 * (الفاتورة الحية والمحفوظة) رفيعان. لا يستخدم letter-spacing في أي مكان (خلل html2canvas مع العربية).
 */
import React from "react";
import HomixWordmark from "./HomixWordmark";
import StatementStamp from "./StatementStamp";
import {
  STATEMENT_DELIVERY_LABEL,
  STATEMENT_STATUS_COLORS,
  fmtLatin,
  isGroupRow,
  isSpacerRow,
  statementEquation,
  type StatementData,
  type StatementRow,
} from "./statementFormat";
import {
  HOMIX_ISSUER_NAME,
  HOMIX_MARKETPLACE_LABEL,
  HOMIX_TAGLINE,
  HOMIX_WEBSITE,
  VENDOR_INVOICE_FOOTER_NOTE,
} from "./vendorInvoiceConstants";
import { avoidOrphanGroupHeaders, bankBoxHeight, planPages } from "./statementPagination";
import styles from "./SettlementStatement.module.css";


const NET_TONE_CLASS = { vendor: "green", homix: "red", settled: "grey" } as const;

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
  const pill = STATEMENT_STATUS_COLORS[data.overdue ? "overdue" : data.status];
  const equation = statementEquation(data);
  const totalRows = equation.length + data.extraTotals.length;
  const transfer = data.transfer;
  const bankH = transfer.kind === "none" ? 0 : bankBoxHeight(transfer.rows.length, Boolean(transfer.note));
  const { rows: allRows, plans } = avoidOrphanGroupHeaders<StatementRow>(
    data.lines,
    isGroupRow,
    (index) => ({ spacer: true, key: `spacer-${index}` }),
    (rowCount) => planPages(rowCount, totalRows, Boolean(data.stampDate), bankH),
  );
  const netTone = styles[NET_TONE_CLASS[data.netDirection]];
  const pageCount = plans.length;
  let cursor = 0;

  return (
    <div className={styles.root} ref={ref} dir="rtl" lang="ar">
      {plans.map((plan, index) => {
        const rows = allRows.slice(cursor, cursor + plan.rows);
        cursor += plan.rows;
        const first = index === 0;
        return (
          <div className={styles.page} key={index}>
            {first ? (
              <>
        <div className={styles.goldBar} />
        <header className={styles.header}>
          <div className={styles.brand}>
            <HomixWordmark />
            <div className={styles.subtitle}>{data.title}</div>
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
            <div className={`${styles.cardLabel} ${styles.gold}`}>{data.netLabel}</div>
            <Money value={Math.abs(data.net)} className={`${styles.cardNumNet} ${netTone}`} />
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
              </>
            ) : (
              <>
                <div className={styles.goldBar} />
                <div className={styles.contBar}>
                  <HomixWordmark width={90} />
                  <div className={styles.contInfo}>
                    <span>{data.title} · <span className={styles.ltr}>{data.number}</span></span>
                    <span className={styles.contMore}>تابع — {data.vendorName}</span>
                  </div>
                </div>
              </>
            )}

        <table className={`${styles.table} ${first ? "" : styles.tableCont}`}>
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
            {allRows.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan={7}>لم تتم إضافة بنود بعد</td>
              </tr>
            ) : rows.map((line) => (isGroupRow(line) ? (
              <tr key={line.key} className={`${styles.row} ${styles.groupRow}`} data-group={line.key}>
                <td colSpan={7}>
                  <span className={styles.groupTitle}>{line.label}</span>
                  {line.sub && <span className={`${styles.groupSub} ${line.net > 0 ? styles.dueV : line.net < 0 ? styles.dueH : ""}`}>{line.sub}</span>}
                </td>
              </tr>
            ) : isSpacerRow(line) ? (
              <tr key={line.key} className={styles.row} aria-hidden="true"><td colSpan={7} /></tr>
            ) : (
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
            )))}
          </tbody>
        </table>

            {plan.hasBottom && (
        <section className={styles.bottom}>
          <div className={styles.bankCol}>
          {transfer.kind !== "none" && (
            <div className={styles.bank} data-transfer={transfer.kind}>
              <div className={styles.bankTitle}>{transfer.title}</div>
              {transfer.rows.map(([label, value]) => (
                <div key={label} className={styles.bankRow}>
                  <span className={styles.bankLabel}>{label}</span>
                  <span className={styles.bankValue}>{value}</span>
                </div>
              ))}
              {transfer.note && <p className={styles.bankNote}>{transfer.note}</p>}
            </div>
          )}
          {data.stampDate && plan.stampMode === "beside" && (
            <div className={styles.stampBeside}><StatementStamp date={data.stampDate} /></div>
          )}
          </div>
          <div className={styles.totalsCol}>
            <div className={styles.totals}>
              {data.extraTotals.map((row) => (
                <div key={row.label} className={styles.tRow}>
                  <span className={styles.tLabel}>{row.label}</span>
                  <Money value={row.value} className={styles.tNum} />
                </div>
              ))}
              {equation.map((row) => (
                <div key={row.kind} className={styles.tRow} data-eq={row.kind}>
                  <span className={styles.tLabel}><i className={styles.sg}>{row.sign}</i>{row.label}</span>
                  <Money value={row.value} className={`${styles.tNum} ${row.tone === "plain" ? styles.ltr : styles[row.tone]}`} />
                </div>
              ))}
              <div className={styles.netRule} />
              <div className={styles.netRow}>
                <span className={styles.netLabel}>{data.netLabel}</span>
                <Money value={Math.abs(data.net)} className={`${styles.netNum} ${netTone}`} />
              </div>
            </div>
            {data.stampDate && plan.stampMode === "below" && (
              <div className={styles.stampWrap}><StatementStamp date={data.stampDate} /></div>
            )}
          </div>
        </section>
            )}

            <footer className={styles.footer}>
              <div className={styles.footBrand}>
                <strong>{HOMIX_ISSUER_NAME}</strong> · {HOMIX_TAGLINE} · <span className={styles.ltr}>{HOMIX_WEBSITE}</span>
              </div>
              <div className={styles.footNote}>
                {VENDOR_INVOICE_FOOTER_NOTE} · <span className={styles.ltr}>{data.number}</span> · صفحة {index + 1} من {pageCount}
              </div>
            </footer>
          </div>
        );
      })}
    </div>
  );
});

SettlementStatement.displayName = "SettlementStatement";

export default SettlementStatement;
