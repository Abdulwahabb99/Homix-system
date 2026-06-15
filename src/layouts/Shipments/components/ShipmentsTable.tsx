import React from "react";
import { Box, Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import { ShipmentStatusBadge, ShipmentTypeBadge, DaysInTransitBadge } from "./ShipmentsStatusChip";
import { getGovernorateLabel } from "shared/utils/constants";

const FONT = "'Cairo', sans-serif";

const TH: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "11px",
  fontWeight: 700,
  color: HX.tx2,
  padding: "10px 14px",
  textAlign: "right",
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${HX.border}`,
  background: HX.surface2,
};

const TD: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "12.5px",
  color: HX.tx,
  padding: "10px 14px",
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
  return moment(d).format("DD/MM/YYYY");
}

function computeDays(receiveDate: string | null | undefined): number | null {
  if (!receiveDate) return null;
  return moment().diff(moment(receiveDate), "days");
}

interface Shipment {
  id: number | string;
  code?: string;
  orderNumber?: string;
  customer?: { firstName?: string; lastName?: string };
  shipmentStatus: number;
  shipmentType: number;
  governorate: number;
  shippingCompany?: string;
  shippingFees?: number | string;
  shippingReceiveDate?: string;
  deliveryDate?: string;
  createdAt?: string;
}

interface ShipmentsTableProps {
  shipments: Shipment[];
  isVendor: boolean;
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (shipment: Shipment) => void;
  onDelete: (shipment: Shipment) => void;
}

export default function ShipmentsTable({
  shipments,
  isVendor,
  isLoading,
  page,
  totalPages,
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
              height: 48,
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
        }}
      >
        لا توجد شحنات مطابقة للفلاتر المحددة
      </Box>
    );
  }

  return (
    <Box sx={cardSx}>
      <Box sx={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            direction: "rtl",
          }}
        >
          <thead>
            <tr>
              <th style={TH}>رقم العملية</th>
              <th style={TH}>رقم الشحنة</th>
              <th style={TH}>اسم العميل</th>
              <th style={TH}>المحافظة</th>
              <th style={TH}>حالة الشحنة</th>
              <th style={TH}>نوع الشحنة</th>
              <th style={TH}>شركة الشحن</th>
              <th style={{ ...TH, textAlign: "center" }}>تكلفة الشحن</th>
              <th style={TH}>تاريخ الاستلام</th>
              <th style={TH}>تاريخ التوصيل</th>
              <th style={{ ...TH, textAlign: "center" }}>عداد الأيام</th>
              {!isVendor && <th style={{ ...TH, textAlign: "center" }}>إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, idx) => {
              const customerName = `${s.customer?.firstName ?? ""} ${s.customer?.lastName ?? ""}`.trim();
              const days = computeDays(s.shippingReceiveDate);
              return (
                <tr
                  key={s.id}
                  style={{
                    background: idx % 2 === 0 ? HX.surface : HX.surface2,
                    transition: "background .12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = HX.accentLight;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      idx % 2 === 0 ? HX.surface : HX.surface2;
                  }}
                >
                  <td style={TD}>
                    <Box
                      component="span"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "11.5px",
                        bgcolor: HX.surface3,
                        px: "6px",
                        py: "2px",
                        borderRadius: "5px",
                        color: HX.tx2,
                      }}
                    >
                      {s.code || "—"}
                    </Box>
                  </td>
                  <td style={TD}>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => navigate(`/shipments/${s.id}`)}
                      sx={{
                        border: "none",
                        background: "none",
                        p: 0,
                        cursor: "pointer",
                        fontFamily: FONT,
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: HX.accent,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {s.orderNumber || "—"}
                      <OpenInNewIcon sx={{ fontSize: 12, opacity: 0.6 }} />
                    </Box>
                  </td>
                  <td style={TD}>
                    <Box
                      component="span"
                      sx={{ fontSize: "12.5px", fontWeight: 600, color: HX.tx }}
                    >
                      {customerName || "—"}
                    </Box>
                  </td>
                  <td style={TD}>
                    <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                      {getGovernorateLabel(Number(s.governorate)) || "—"}
                    </Box>
                  </td>
                  <td style={TD}>
                    <ShipmentStatusBadge status={s.shipmentStatus} />
                  </td>
                  <td style={TD}>
                    <ShipmentTypeBadge type={s.shipmentType} />
                  </td>
                  <td style={TD}>
                    <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                      {s.shippingCompany || "—"}
                    </Box>
                  </td>
                  <td style={{ ...TD, textAlign: "center" }}>
                    {s.shippingFees != null ? (
                      <Box component="span" sx={{ fontSize: "12.5px", fontWeight: 700, color: HX.tx }}>
                        {Number(s.shippingFees).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        <Box component="span" sx={{ fontSize: "10px", color: HX.tx3, mr: "3px" }}>
                          ج.م
                        </Box>
                      </Box>
                    ) : (
                      <span style={{ color: HX.tx3 }}>—</span>
                    )}
                  </td>
                  <td style={TD}>
                    <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                      {fmtDate(s.shippingReceiveDate)}
                    </Box>
                  </td>
                  <td style={TD}>
                    <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                      {fmtDate(s.deliveryDate)}
                    </Box>
                  </td>
                  <td style={{ ...TD, textAlign: "center" }}>
                    <DaysInTransitBadge days={days} />
                  </td>
                  {!isVendor && (
                    <td style={{ ...TD, textAlign: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <ActionBtn
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(s);
                          }}
                          bg={HX.blueLight}
                          hoverBg={HX.blue}
                          color={HX.blue}
                          title="تعديل"
                        >
                          <EditIcon sx={{ fontSize: 14 }} />
                        </ActionBtn>
                        <ActionBtn
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(s);
                          }}
                          bg={HX.redLight}
                          hoverBg={HX.red}
                          color={HX.red}
                          title="حذف"
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </ActionBtn>
                      </Box>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: "14px 16px",
            borderTop: `0.5px solid ${HX.border}`,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
            shape="rounded"
            size="small"
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}
    </Box>
  );
}
