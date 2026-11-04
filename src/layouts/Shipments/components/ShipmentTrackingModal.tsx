/**
 * نافذة «تتبع الشحنة»: معاينة مختصرة + خط زمني مبني على سجل أحداث الشحنة الذي
 * يرجعه الخادم (timeline) — لا نخترع خطوات. الخطوة المستقبلية الوحيدة هي موعد
 * التوصيل المجدول إن وُجد ولم تُسلَّم الشحنة بعد.
 * الطباعة تعيد استخدام مستند فاتورة الشحنة الموجود (لا يوجد مستند بوليصة مستقل).
 */
import React, { useRef } from "react";
import { Box, CircularProgress, Dialog } from "@mui/material";
import moment from "moment";
import { HX } from "layouts/Orders/ordersHomixTheme";
import OrderInvoiceDocument from "layouts/Orders/orderInvoice/OrderInvoiceDocument";
import { printElementNatively } from "layouts/Orders/utils/invoicePdf";
import { useShipmentDetailQuery } from "query/shipmentDetail";
import type { ShipmentItem } from "query/shipmentsList";
import { buildShipmentInvoiceModel } from "./ShipmentDetails/shipmentInvoiceAdapter";
import { fmtDateTime } from "./ShipmentDetails/utils";

const FONT = "'Cairo', sans-serif";

interface Step {
  key: string;
  title: string;
  note: string;
  date: string | null;
  done: boolean;
}

export default function ShipmentTrackingModal({
  shipment,
  onClose,
}: {
  shipment: ShipmentItem | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useShipmentDetailQuery(shipment ? String(shipment.id) : "");
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  const steps: Step[] = [];
  if (data) {
    data.timeline.forEach((ev) =>
      steps.push({ key: `e${ev.id}`, title: ev.message, note: ev.userName, date: ev.changedAt, done: true })
    );
    const { shipment: info } = data;
    if (info.scheduledDeliveryDate && !info.deliveryDate) {
      steps.push({
        key: "scheduled",
        title: "موعد التوصيل المجدول",
        note: info.shippingCompany ? `مع ${info.shippingCompany}` : "",
        date: info.scheduledDeliveryDate,
        done: false,
      });
    }
  }

  const info = data?.shipment;
  const preview = info ? (
    <>
      <b>{data.products[0]?.productName || "—"}</b> — البائع: <b>{info.sellerName || "—"}</b>
      <br />
      طلب #{info.operationNumber || info.orderNumber} · شحنة {info.shipmentNumber || "—"} · العميل: {info.customerName || "—"}
      {info.governorate ? ` · ${info.governorate}` : ""}
    </>
  ) : null;

  return (
    <Dialog
      open={Boolean(shipment)}
      onClose={onClose}
      dir="rtl"
      fullWidth
      maxWidth={false}
      PaperProps={{ sx: { width: 460, maxWidth: "92vw", borderRadius: "16px", fontFamily: FONT } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 18px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Box component="span" sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>تتبع الشحنة</Box>
        <Box
          component="button"
          type="button"
          aria-label="إغلاق"
          onClick={onClose}
          sx={{ width: 26, height: 26, borderRadius: "7px", border: "none", bgcolor: HX.surface2, color: HX.tx2, cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
        >
          ×
        </Box>
      </Box>

      <Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "65vh", overflowY: "auto" }}>
        {isLoading && <Box sx={{ textAlign: "center", py: 3 }}><CircularProgress size={22} /></Box>}
        {isError && <Box sx={{ textAlign: "center", color: HX.red, fontSize: "12.5px", fontFamily: FONT }}>تعذر تحميل بيانات التتبع</Box>}
        {data && (
          <>
            <Box sx={{ bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, borderRadius: "10px", p: "10px 12px", fontSize: "12px", lineHeight: 1.8, color: HX.tx2, fontFamily: FONT }}>
              {preview}
            </Box>
            {steps.length === 0 ? (
              <Box sx={{ textAlign: "center", fontSize: "12px", color: HX.tx3, py: "12px", fontFamily: FONT }}>لا توجد أحداث</Box>
            ) : (
              <Box sx={{ py: "6px" }}>
                {steps.map((st, i) => (
                  <Box
                    key={st.key}
                    sx={{
                      display: "flex", gap: "12px", position: "relative",
                      pb: i === steps.length - 1 ? 0 : "20px",
                      "&:not(:last-child):before": {
                        content: '""', position: "absolute", top: "22px", right: "10px",
                        width: "1.5px", bottom: "-2px", bgcolor: HX.border2,
                      },
                    }}
                  >
                    <Box sx={{
                      width: 21, height: 21, borderRadius: "50%", flexShrink: 0, zIndex: 1, fontSize: "11px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      bgcolor: st.done ? HX.greenLight : HX.surface2,
                      color: st.done ? HX.green : HX.tx3,
                    }}>
                      {st.done ? "✓" : "○"}
                    </Box>
                    <Box>
                      <Box component="b" sx={{ display: "block", fontSize: "12.5px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>{st.title}</Box>
                      {st.note && <Box component="span" sx={{ fontSize: "11px", color: HX.tx2, fontFamily: FONT }}>{st.note}</Box>}
                      <Box component="span" sx={{ display: "block", fontSize: "10.5px", color: HX.tx3, mt: "2px", fontFamily: FONT }}>
                        {st.done ? fmtDateTime(st.date) : moment(st.date).format("DD/MM/YYYY")}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            <div
              aria-hidden
              style={{ position: "fixed", left: "-10000px", top: 0, width: 800, zIndex: -1, pointerEvents: "none", overflow: "hidden", background: "#fff" }}
            >
              <OrderInvoiceDocument ref={invoiceRef} orderDetails={buildShipmentInvoiceModel(data)} />
            </div>
          </>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: "8px", p: "14px 18px", borderTop: `0.5px solid ${HX.border}` }}>
        <Box
          component="button"
          type="button"
          disabled={!data}
          onClick={() => invoiceRef.current && printElementNatively(invoiceRef.current)}
          sx={{
            display: "inline-flex", alignItems: "center", gap: "6px", height: 36, px: "14px",
            borderRadius: "9px", border: `1px solid ${HX.border2}`, bgcolor: HX.surface, color: HX.tx2,
            fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, cursor: data ? "pointer" : "default",
            opacity: data ? 1 : 0.5, "&:hover": { bgcolor: HX.surface3 },
          }}
        >
          طباعة بوليصة الشحن
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onClose}
          sx={{ height: 36, px: "16px", borderRadius: "9px", border: "none", bgcolor: HX.surface2, color: HX.tx2, fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, cursor: "pointer" }}
        >
          إغلاق
        </Box>
      </Box>
    </Dialog>
  );
}
