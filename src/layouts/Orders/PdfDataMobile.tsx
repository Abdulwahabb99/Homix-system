/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import logo from "../../assets/images/1 (1).png";
import styles from "./Orders.module.css";

function formatDateArabic(createdAt: string | null | undefined): string {
  if (createdAt == null || createdAt === "") return "—";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function LtrNumber({
  value,
  suffix = "ج.م",
  className = "",
}: {
  value: string | number | null | undefined;
  suffix?: string;
  className?: string;
}) {
  const n = Number(value);
  const text = Number.isNaN(n) ? "—" : n.toLocaleString("ar-EG", { maximumFractionDigits: 2 });
  return (
    <span className={`${styles.pdfLtr} ${className}`.trim()}>
      {text} {suffix}
    </span>
  );
}

const PdfDataMobile = React.forwardRef<HTMLDivElement, { orderDetails: any }>(({ orderDetails }, ref) => {
  const orderDate = formatDateArabic(orderDetails?.createdAt);
  const lines = orderDetails?.orderLines ?? [];
  const n = lines.length;

  const sheetMod = useMemo(() => {
    if (n > 14) return styles.pdfSheetTight;
    if (n > 6) return styles.pdfSheetCompact;
    return "";
  }, [n]);

  const customer = orderDetails?.customer;

  return (
    <div className={styles.pdfInvoiceRoot}>
      <div
        ref={ref}
        data-pdf-sheet
        className={[styles.pdfSheet, sheetMod].filter(Boolean).join(" ")}
        dir="rtl"
        lang="ar"
      >
        <div className={styles.pdfSheetInner}>
          <header className={styles.pdfHeaderV2}>
            <div className={styles.pdfLogoBlock}>
              <img src={logo} alt="Homix" className={styles.pdfLogoImg} width={120} height={40} />
            </div>
            <div className={styles.pdfHeaderBlock}>
              <div className={styles.pdfDocBadge}>مستند مالي</div>
              <h1 className={styles.pdfTitleV2}>
                <span>فاتورة</span>
                <span className={styles.pdfTitleV2en} dir="ltr" lang="en">
                  Invoice
                </span>
              </h1>
              <div className={styles.pdfMetaChips} role="list">
                <div className={styles.pdfMetaChip} role="listitem">
                  <span className={styles.pdfMetaChipLabel}>رقم المستند</span>
                  <span className={styles.pdfMetaChipVal}>
                    <span className={styles.pdfLtr} dir="ltr">
                      {orderDetails?.name ?? "—"}
                    </span>
                  </span>
                </div>
                {orderDetails?.code ? (
                  <div className={styles.pdfMetaChip} role="listitem">
                    <span className={styles.pdfMetaChipLabel}>الكود</span>
                    <span className={styles.pdfMetaChipVal}>
                      <span className={styles.pdfLtr} dir="ltr">
                        {orderDetails.code}
                      </span>
                    </span>
                  </div>
                ) : null}
                <div className={styles.pdfMetaChip} role="listitem">
                  <span className={styles.pdfMetaChipLabel}>تاريخ الإصدار</span>
                  <span className={styles.pdfMetaChipVal}>{orderDate}</span>
                </div>
              </div>
            </div>
          </header>

          <div className={styles.pdfPartyGrid}>
            <div className={styles.pdfPartyCard}>
              <p className={styles.pdfPartyKicker}>العميل</p>
              <p className={styles.pdfPartyNameV2}>
                {customer
                  ? (customer.name ?? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`).trim()
                  : "—"}
              </p>
              {customer?.address ? <p className={styles.pdfPartyDesc}>{customer.address}</p> : null}
              {customer?.email ? (
                <p className={styles.pdfPartyDesc} dir="ltr" style={{ textAlign: "right" }}>
                  {customer.email}
                </p>
              ) : null}
            </div>
            <div className={styles.pdfPartyCard}>
              <p className={styles.pdfPartyKicker}>التوصيل والتواصل</p>
              <p className={styles.pdfPartyNameV2}>
                {customer
                  ? (customer.name ?? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`).trim()
                  : "—"}
              </p>
              {customer?.phoneNumber ? (
                <p className={styles.pdfPartyDesc}>
                  <span className={styles.pdfLtr} dir="ltr">
                    {customer.phoneNumber}
                  </span>
                </p>
              ) : null}
              {customer?.address ? (
                <p className={styles.pdfPartyDesc} style={{ marginTop: 2 }}>
                  {customer.address}
                </p>
              ) : null}
            </div>
          </div>

          <p className={styles.pdfSectionKicker}>بنود الطلب</p>
          <div className={styles.pdfTableFrame}>
            <table className={styles.pdfTableV2}>
              <thead>
                <tr>
                  <th className={styles.colItem} scope="col">
                    الصنف
                  </th>
                  <th className={styles.colQty} scope="col">
                    الكمية
                  </th>
                  <th className={styles.colPrice} scope="col">
                    سعر الوحدة
                  </th>
                  <th className={styles.colLine} scope="col">
                    الإجمالي
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((item) => {
                  const unit = Number(item.price);
                  const qty = Number(item.quantity);
                  const lineSub = Number.isFinite(unit) && Number.isFinite(qty) ? unit * qty : NaN;
                  return (
                    <tr key={item.id}>
                      <td className={styles.colItem}>
                        <div className={styles.itemLine}>
                          {item?.product?.image ? (
                            <img
                              className={styles.itemThumb}
                              src={item.product.image}
                              alt=""
                              width={52}
                              height={52}
                            />
                          ) : null}
                          <div className={styles.itemText}>
                            <span className={styles.pdfProductTitle}>{item.title}</span>
                            {item.sku ? (
                              <span className={styles.skuV2} dir="rtl">
                                <span className={styles.skuLtr} dir="ltr" lang="en">
                                  {item.sku}
                                </span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className={styles.colQty}>
                        <span className={styles.pdfLtr} dir="ltr">
                          {item.quantity}
                        </span>
                      </td>
                      <td className={styles.colPrice}>
                        <LtrNumber value={item.price} />
                      </td>
                      <td className={styles.colLine}>
                        <LtrNumber className={styles.lineStrong} value={lineSub} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.pdfTotalsRow}>
            <div className={styles.pdfTotalsPanel}>
              <div className={styles.pdfTotalLine}>
                <span>المجموع الجزئي</span>
                <span>
                  <LtrNumber value={orderDetails.subTotalPrice} />
                </span>
              </div>
              <div className={styles.pdfTotalLine}>
                <span>الشحن</span>
                <span>
                  <LtrNumber value={orderDetails.shippingFees} />
                </span>
              </div>
              <div className={styles.pdfTotalLine}>
                <span>الخصم</span>
                <span>
                  <LtrNumber value={orderDetails.totalDiscounts} />
                </span>
              </div>
              <div className={`${styles.pdfTotalLine} ${styles.pdfTotalGrand}`.trim()}>
                <span>الإجمالي</span>
                <span>
                  <LtrNumber value={orderDetails.totalPrice} />
                </span>
              </div>
              <div className={styles.pdfTotalLine}>
                <span>المدفوع</span>
                <span>
                  <LtrNumber value={orderDetails.downPayment} />
                </span>
              </div>
              <div className={`${styles.pdfTotalLine} ${styles.pdfTotalDue}`.trim()}>
                <span>المتبقّي</span>
                <span>
                  {orderDetails?.totalPrice != null && orderDetails?.downPayment != null ? (
                    <LtrNumber
                      value={(
                        Number(orderDetails.totalPrice) - Number(orderDetails.downPayment)
                      ).toFixed(1)}
                    />
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.pdfFooterV2}>
          <span>شكراً لثقتك</span>
          <span className={styles.pdfFooterBrand} dir="ltr" lang="en">
            — Homix
          </span>
        </footer>
      </div>
    </div>
  );
});

export default PdfDataMobile;
