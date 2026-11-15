/**
 * نافذة «أصناف الشحنة المجمّعة»: كل الطلبات التي تتشارك رقم الأوردر مع حالة وصولها للمخزن.
 * حالة الوصول محسوبة من حالات الطلبات نفسها (نفس منطق أيقونة الجدول)، ولا تُعدَّل
 * يدوياً — الاستلام يُسجَّل من تبويب «الاستلامات».
 */
import React from "react";
import { Box, CircularProgress, Dialog } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useGroupedItems } from "query/shipmentGrouped";
import type { ShipmentItem } from "query/shipmentsList";
import { splitGroupedItems } from "../groupedItems";

const FONT = "'Cairo', sans-serif";

export default function GroupedShipmentModal({
  shipment,
  onClose,
}: {
  shipment: ShipmentItem | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useGroupedItems(shipment?.id);
  const { counted: items, excluded, arrived, complete } = splitGroupedItems(data ?? []);

  return (
    <Dialog
      open={Boolean(shipment)}
      onClose={onClose}
      dir="rtl"
      fullWidth
      maxWidth={false}
      PaperProps={{ sx: { width: 520, maxWidth: "92vw", borderRadius: "16px", fontFamily: FONT } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 18px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Box component="span" sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>
          أصناف الشحنة المجمّعة {shipment?.orderNumber ? `#${shipment.orderNumber}` : ""}
        </Box>
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
      <Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "65vh", overflowY: "auto" }}>
        {isLoading && <Box sx={{ textAlign: "center", py: 3 }}><CircularProgress size={22} /></Box>}
        {isError && <Box sx={{ textAlign: "center", color: HX.red, fontSize: "12.5px", fontFamily: FONT }}>تعذر تحميل أصناف الشحنة</Box>}
        {data && (
          <>
            <Box sx={{
              bgcolor: complete ? HX.greenLight : HX.amberLight,
              color: complete ? "#065f46" : "#92400e",
              borderRadius: "10px", p: "9px 12px", fontSize: "12.5px", fontWeight: 700, fontFamily: FONT,
            }}>
              {complete
                ? `كل الأصناف (${items.length}) وصلت المخزن — الشحنة جاهزة للجدولة`
                : `${arrived} من ${items.length} أصناف في المخزن — تبقّى ${items.length - arrived}`}
            </Box>
            {items.map((i) => (
              <Box
                key={i.id}
                sx={{
                  display: "flex", alignItems: "center", gap: "10px", p: "9px 12px",
                  border: `0.5px solid ${i.current ? HX.accent : HX.border}`,
                  bgcolor: i.current ? HX.accentLight : HX.surface, borderRadius: "10px",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ fontSize: "12.5px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>{i.productName || "—"}</Box>
                  <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT }}>
                    عملية #{i.operationNumber || i.id} — {i.sellerName || "—"} — {i.productSku || "—"}
                  </Box>
                </Box>
                <Box sx={{
                  px: "9px", py: "3px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap",
                  bgcolor: i.inWarehouse ? HX.greenLight : HX.surface3,
                  color: i.inWarehouse ? "#065f46" : HX.tx2,
                }}>
                  {i.inWarehouse ? "في المخزن" : i.shipmentStatusLabel || "لم يصل"}
                </Box>
              </Box>
            ))}
            {excluded.length > 0 && (
              <>
                <Box sx={{ fontSize: "11.5px", fontWeight: 700, color: HX.tx3, fontFamily: FONT, mt: "4px" }}>
                  ملغي / مرفوض ({excluded.length}) — غير محتسب
                </Box>
                {excluded.map((i) => (
                  <Box
                    key={i.id}
                    sx={{
                      display: "flex", alignItems: "center", gap: "10px", p: "9px 12px", opacity: 0.6,
                      border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, borderRadius: "10px",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ fontSize: "12.5px", fontWeight: 700, color: HX.tx2, fontFamily: FONT }}>{i.productName || "—"}</Box>
                      <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT }}>
                        عملية #{i.operationNumber || i.id} — {i.sellerName || "—"} — {i.productSku || "—"}
                      </Box>
                    </Box>
                    <Box sx={{ px: "9px", py: "3px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap", bgcolor: HX.surface3, color: HX.tx2 }}>
                      {i.shipmentStatusLabel || "ملغي / مرفوض"}
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: "14px 18px", borderTop: `0.5px solid ${HX.border}` }}>
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
