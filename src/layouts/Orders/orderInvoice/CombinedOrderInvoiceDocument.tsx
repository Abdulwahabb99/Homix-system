/* eslint-disable react/prop-types */
/**
 * فاتورة مجمّعة لعدة طلبات — مستند واحد يضم بنود كل الطلبات المحددة
 * في جدول واحد وملخص حساب واحد بمجموع الكل، وليس صفحة منفصلة لكل طلب.
 * نفس تصميم OrderInvoiceDocument؛ يُلتقط إلى PDF عبر html2pdf بنفس الطريقة.
 */
import React from "react";
import logo from "../../../assets/images/homix.png";
import { getOrderDetailPaymentLabel } from "../orderDetail/orderDetailPayment";
import {
  INVOICE_SELLER,
  INVOICE_DECLARATIONS,
  INVOICE_FOOTER_BRAND,
  INVOICE_FOOTER_NOTE,
} from "./invoiceConstants";
import styles from "./OrderInvoice.module.css";

function formatDateArabic(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

function money(value: unknown): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("ar-EG", { maximumFractionDigits: 0 }) : "—";
}

function getCustomerDisplayName(customer: any): string {
  if (!customer) return "—";
  return (
    (customer.name ?? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`).toString().trim() || "—"
  );
}

function SummaryRow({
  label,
  value,
  muteWhenZero = false,
}: {
  label: string;
  value: number;
  muteWhenZero?: boolean;
}) {
  const isZero = !Number.isFinite(value) || value === 0;
  const mute = muteWhenZero && isZero;
  return (
    <div className={styles.sr}>
      <span className={styles.srLbl}>{label}</span>
      <span className={`${styles.srVal} ${mute ? styles.muted : ""}`.trim()}>
        {mute ? "—" : `${money(value)} ج.م`}
      </span>
    </div>
  );
}

function orderRef(order: any): string {
  return String(order?.name || order?.orderNumber || order?.code || "—").replace(/^#/, "");
}

const CombinedOrderInvoiceDocument = React.forwardRef<HTMLDivElement, { orders: any[] }>(
  ({ orders }, ref) => {
    const firstOrder = orders[0] ?? {};
    const customer = firstOrder?.customer;

    // كل بند من كل طلب في جدول واحد، مع الإشارة لرقم الطلب المصدر لكل بند
    const lines = orders.flatMap((order) =>
      (order?.orderLines ?? []).map((item: any) => ({ ...item, __orderRef: orderRef(order) }))
    );

    // نفس الطلب قد يتكرر (عدة أصناف من نفس رقم الطلب) — لا نعرضه أكثر من مرة
    const orderRefsLabel = Array.from(new Set(orders.map(orderRef))).join("، ");
    const issueDate = formatDateArabic(firstOrder?.createdAt ?? firstOrder?.orderDate);

    // نفس مصادر «التفاصيل المالية» بالضبط، مجموعة عبر كل الطلبات المحددة.
    const subtotal = orders.reduce((sum, o) => sum + Number(o?.subTotalPrice ?? 0), 0);
    const shipping = orders.reduce((sum, o) => sum + Number(o?.shippingFees ?? 0), 0);
    const discount = orders.reduce((sum, o) => sum + Number(o?.totalDiscounts ?? 0), 0);
    // «الإجمالي» لازم يشمل الشحن — نفس تصحيح OrderInvoiceDocument (totalPrice
    // من الـ API بيستثني الشحن، فيظهر أقل من «المتبقّي» رغم إن المدفوع صفر).
    const total = subtotal + shipping - discount;
    const paid = orders.reduce((sum, o) => sum + Number(o?.downPayment ?? 0), 0);
    const remaining = orders.reduce((sum, o) => sum + Number(o?.toBeCollected ?? 0), 0);

    // حالة الدفع تظهر فقط عندما تتفق كل الطلبات المحددة عليها، وإلا "متعددة"
    const paymentStatuses = new Set(orders.map((o) => o?.paymentStatus));
    const paymentLabel =
      paymentStatuses.size === 1 ? getOrderDetailPaymentLabel(firstOrder?.paymentStatus) || "—" : "متعددة";

    return (
      <div className={styles.invoiceRoot}>
        <div className={styles.paper} ref={ref} dir="rtl" lang="ar">
          {/* HEADER */}
          <div className={styles.invHead}>
            <div className={styles.headLeft}>
              <span className={styles.invType}>Invoice · فاتورة مجمّعة</span>
              <div className={styles.invNumBig}>
                <span>{orders.length}</span> طلبات
              </div>
              <span className={styles.invStatus}>{paymentLabel}</span>
            </div>
            <div>
              <img src={logo} alt="HOMIX" className={styles.logoImg} />
            </div>
          </div>

          {/* META */}
          <div className={styles.metaBar}>
            <div className={styles.metaItem}>
              <span className={styles.metaLbl}>عدد الطلبات</span>
              <span className={styles.metaVal}>{orders.length}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLbl}>أرقام الطلبات</span>
              <span className={styles.metaVal}>{orderRefsLabel}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLbl}>تاريخ الإصدار</span>
              <span className={styles.metaVal}>{issueDate}</span>
            </div>
          </div>

          {/* ADDRESSES */}
          <div className={styles.addrRow}>
            <div className={styles.addrCell}>
              <div className={styles.addrCellLabel}>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
                العميل
              </div>
              <div className={styles.addrName}>{getCustomerDisplayName(customer)}</div>
              {customer?.phoneNumber ? (
                <div className={styles.addrLine}>
                  <span className={styles.ltr}>{customer.phoneNumber}</span>
                </div>
              ) : null}
              {customer?.address ? <div className={styles.addrLine}>{customer.address}</div> : null}
              {customer?.address2 ? <div className={styles.addrLine}>{customer.address2}</div> : null}
            </div>
            <div className={styles.addrCell}>
              <div className={styles.addrCellLabel}>
                <svg viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                البائع
              </div>
              <div className={styles.addrName}>{INVOICE_SELLER.name}</div>
              <div className={styles.addrLine}>
                <span className={styles.ltr}>{INVOICE_SELLER.phone}</span>
              </div>
            </div>
          </div>

          {/* ITEMS — بنود كل الطلبات المحددة في جدول واحد */}
          <div className={styles.itemsSecHead}>بنود الطلبات ({orders.length})</div>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>الصنف</th>
                <th className={styles.c}>الكمية</th>
                <th className={styles.c}>سعر الوحدة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((item: any) => {
                const unit = Number(item.price);
                const qty = Number(item.quantity);
                const lineTotal = Number.isFinite(unit) && Number.isFinite(qty) ? unit * qty : NaN;
                return (
                  <tr key={`${item.__orderRef}-${item.id}`}>
                    <td>
                      <div className={styles.prodCell}>
                        <div className={styles.prodThumb}>
                          {item?.product?.image ? (
                            <img src={item.product.image} alt="" />
                          ) : (
                            "📦"
                          )}
                        </div>
                        <div>
                          <div className={styles.prodNm}>{item.title}</div>
                          {item.sku ? (
                            <div className={styles.prodCode}>
                              <span className={styles.ltr}>{item.sku}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className={styles.c}>{item.quantity}</td>
                    <td className={styles.c}>{money(item.price)} ج.م</td>
                    <td>{money(lineTotal)} ج.م</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* SUMMARY + SIGNATURE */}
          <div className={styles.bottomGrid}>
            <div className={styles.sumBlock}>
              <div className={styles.sumBlockTitle}>ملخص الحساب ({orders.length} طلب)</div>
              <SummaryRow label="المجموع الجزئي" value={subtotal} />
              <SummaryRow label="الشحن" value={shipping} muteWhenZero />
              <SummaryRow label="الخصم" value={discount} muteWhenZero />
              <div className={`${styles.sr} ${styles.total}`}>
                <span className={styles.srLbl}>الإجمالي</span>
                <span className={styles.srVal}>{money(total)} ج.م</span>
              </div>
              <SummaryRow label="المدفوع" value={paid} muteWhenZero />
              <div className={`${styles.sr} ${styles.remain}`}>
                <span className={styles.srLbl}>المتبقّي</span>
                <span className={styles.srVal}>{money(remaining)} ج.م</span>
              </div>
            </div>

            <div className={styles.sigBlock}>
              <div className={styles.sigBlockTitle}>توقيع العميل</div>
              <div className={styles.sigCanvasWrap}>
                <div className={styles.sigCanvas} />
                <div className={styles.sigFooter}>
                  <div>
                    <div className={styles.sigName}>{getCustomerDisplayName(customer)}</div>
                    <div className={styles.sigDate}>{issueDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DECLARATION */}
          <div className={styles.declWrap}>
            <div className={styles.declInner}>
              {INVOICE_DECLARATIONS.map((d, i) => {
                const green = d.tone === "green";
                return (
                  <div className={styles.declItem} key={i}>
                    <div
                      className={styles.declIco}
                      style={{
                        background: green ? "rgba(16,185,129,.1)" : "rgba(245,158,11,.1)",
                        color: green ? "#10b981" : "#f59e0b",
                      }}
                    >
                      {green ? (
                        <svg viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      )}
                    </div>
                    <div className={styles.declText}>
                      {d.before}
                      <strong>{d.strong}</strong>
                      {d.after}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div className={styles.invFooter}>
            <div className={styles.footerBrandWrap}>
              <img src={logo} alt="HOMIX" className={styles.footerLogo} />
              <span className={styles.footerBrand}>{INVOICE_FOOTER_BRAND}</span>
            </div>
            <div className={styles.footerNote}>{INVOICE_FOOTER_NOTE}</div>
          </div>
        </div>
      </div>
    );
  }
);

export default CombinedOrderInvoiceDocument;
