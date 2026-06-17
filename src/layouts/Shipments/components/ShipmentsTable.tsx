import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import { ShipmentStatusBadge, PaymentStatusBadge, DaysInTransitBadge } from "./ShipmentsStatusChip";
import { SHIPMENTS_LIST_PAGE_SIZE, type ShipmentItem } from "query/shipmentsList";

const FONT = "'Cairo', sans-serif";

const TH: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "11px",
  fontWeight: 700,
  color: HX.tx2,
  padding: "10px 12px",
  textAlign: "right",
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${HX.border}`,
  background: HX.surface2,
};

const TD: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "12px",
  color: HX.tx,
  padding: "9px 12px",
  textAlign: "right",
  whiteSpace: "nowrap",
  borderBottom: `0.5px solid ${HX.border}`,
  verticalAlign: "middle",
};

function ActionBtn({
  onClick,
  bg,
  hoverBg,
  color,
  title,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  bg: string;
  hoverBg: string;
  color: string;
  title?: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: hover ? hoverBg : bg,
        color: hover ? "#fff" : color,
        transition: "background .15s, color .15s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return moment(d).format("DD/MM/YY");
}

interface ShipmentsTableProps {
  shipments: ShipmentItem[];
  isVendor: boolean;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (shipment: ShipmentItem) => void;
  onDelete: (shipment: ShipmentItem) => void;
}

export default function ShipmentsTable({
  shipments,
  isVendor,
  isLoading,
  isFetching,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
}: ShipmentsTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box sx={{ ...cardSx, overflow: "hidden" }}>
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            sx={{
              height: 44,
              bgcolor: i % 2 === 0 ? HX.surface : HX.surface2,
              borderBottom: `0.5px solid ${HX.border}`,
              opacity: 0.7,
            }}
          />
        ))}
      </Box>
    );
  }

  if (shipments.length === 0) {
    return (
      <Box
        sx={{
          ...cardSx,
          py: 5,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "13px",
          color: HX.tx3,
          opacity: isFetching ? 0.5 : 1,
        }}
      >
        لا توجد شحنات مطابقة للفلاتر المحددة
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardSx, opacity: isFetching && !isLoading ? 0.7 : 1, transition: "opacity .2s" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
          <thead>
            <tr>
              <th style={TH}>رقم العملية</th>
              <th style={TH}>رقم الشحنة</th>
              <th style={TH}>اسم العميل</th>
              <th style={TH}>البائع</th>
              <th style={TH}>المحافظة</th>
              <th style={TH}>حالة الشحنة</th>
              <th style={TH}>نوع الشحنة</th>
              <th style={TH}>حالة الدفع</th>
              <th style={TH}>التوصيل بواسطة</th>
              <th style={{ ...TH, textAlign: "center" }}>المبلغ المطلوب</th>
              <th style={{ ...TH, textAlign: "center" }}>تكلفة الشحن</th>
              <th style={TH}>تاريخ الاستلام</th>
              <th style={TH}>موعد التوصيل</th>
              <th style={TH}>تاريخ التوصيل</th>
              <th style={{ ...TH, textAlign: "center" }}>الأيام</th>
              {!isVendor && <th style={{ ...TH, textAlign: "center" }}>إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, idx) => (
              <tr
                key={s.id}
                style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2, transition: "background .1s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = HX.accentLight; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? HX.surface : HX.surface2; }}
              >
                {/* رقم العملية */}
                <td style={TD}>
                  <Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>
                    {s.operationNumber || "—"}
                  </Box>
                </td>

                {/* رقم الشحنة */}
                <td style={TD}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => navigate(`/shipments/${s.id}`)}
                    sx={{
                      border: "none", background: "none", p: 0, cursor: "pointer",
                      fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: HX.accent,
                      display: "inline-flex", alignItems: "center", gap: "3px",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {s.shipmentNumber || s.orderNumber || "—"}
                    <OpenInNewIcon sx={{ fontSize: 11, opacity: 0.6 }} />
                  </Box>
                </td>

                {/* اسم العميل */}
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>
                    {s.customerName || "—"}
                  </Box>
                </td>

                {/* البائع */}
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                    {s.sellerName || "—"}
                  </Box>
                </td>

                {/* المحافظة */}
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                    {s.governorate || "—"}
                  </Box>
                </td>

                {/* حالة الشحنة */}
                <td style={TD}>
                  <ShipmentStatusBadge status={s.shipmentStatus} />
                </td>

                {/* نوع الشحنة */}
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>
                    {s.shipmentTypeLabel || "—"}
                  </Box>
                </td>

                {/* حالة الدفع */}
                <td style={TD}>
                  {s.paymentStatus != null
                    ? <PaymentStatusBadge status={s.paymentStatus} label={s.paymentStatusLabel} />
                    : <span style={{ color: HX.tx3 }}>—</span>
                  }
                </td>

                {/* التوصيل بواسطة */}
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                    {s.deliveryBy || "—"}
                  </Box>
                </td>

                {/* المبلغ المطلوب */}
                <td style={{ ...TD, textAlign: "center" }}>
                  {s.amountToCollect != null ? (
                    <Box component="span" sx={{ fontSize: "12.5px", fontWeight: 700 }}>
                      {Number(s.amountToCollect).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      <Box component="span" sx={{ fontSize: "10px", color: HX.tx3, mr: "3px" }}>ج.م</Box>
                    </Box>
                  ) : <span style={{ color: HX.tx3 }}>—</span>}
                </td>

                {/* تكلفة الشحن */}
                <td style={{ ...TD, textAlign: "center" }}>
                  {s.shippingCost != null ? (
                    <Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.tx2 }}>
                      {Number(s.shippingCost).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      <Box component="span" sx={{ fontSize: "10px", color: HX.tx3, mr: "3px" }}>ج.م</Box>
                    </Box>
                  ) : <span style={{ color: HX.tx3 }}>—</span>}
                </td>

                {/* تاريخ الاستلام */}
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>
                    {fmtDate(s.receivedInWarehouseDate)}
                  </Box>
                </td>

                {/* موعد التوصيل */}
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>
                    {fmtDate(s.scheduledDeliveryDate)}
                  </Box>
                </td>

                {/* تاريخ التوصيل */}
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>
                    {fmtDate(s.deliveryDate)}
                  </Box>
                </td>

                {/* الأيام */}
                <td style={{ ...TD, textAlign: "center" }}>
                  <DaysInTransitBadge days={s.daysCounter ?? null} />
                </td>

                {/* إجراءات */}
                {!isVendor && (
                  <td style={{ ...TD, textAlign: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                      <ActionBtn
                        onClick={(e) => { e.stopPropagation(); onEdit(s); }}
                        bg={HX.blueLight} hoverBg={HX.blue} color={HX.blue} title="تعديل"
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </ActionBtn>
                      <ActionBtn
                        onClick={(e) => { e.stopPropagation(); onDelete(s); }}
                        bg={HX.redLight} hoverBg={HX.red} color={HX.red} title="حذف"
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </ActionBtn>
                    </Box>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <HomixPaginationBar
        page={page - 1}
        totalPages={totalPages}
        pageSize={SHIPMENTS_LIST_PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={(p) => onPageChange(p + 1)}
        itemLabel="شحنة"
      />
    </Box>
  );
}
