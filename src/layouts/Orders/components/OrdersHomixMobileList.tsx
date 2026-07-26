import React, { useCallback } from "react";
import { Box, Checkbox, Stack } from "@mui/material";
import moment from "moment";
import "moment-timezone";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  OrderStatusBadge,
  DeliveryStatusBadge,
  PaymentBadge,
  DaysCounterBadge,
  DeliveryByBadge,
  PriorityValueBadge,
  OrderSourceBadge,
} from "layouts/Orders/components/OrdersHomixBadges";

const FONT = "'Cairo', sans-serif";

function initials(name: string) {
  return (name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AV_COLORS = [
  "linear-gradient(135deg,#6366f1,#a78bfa)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
  "linear-gradient(135deg,#8b5cf6,#6366f1)",
  "linear-gradient(135deg,#14b8a6,#0f766e)",
];
function avColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % AV_COLORS.length;
  return AV_COLORS[h];
}

function rowKey(order: Order) {
  return order.rowId ?? order.orderId;
}

function AvatarCircle({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: avColor(name || "?"),
        fontSize: Math.floor(size * 0.36),
        fontWeight: 800,
        color: "#fff",
        flexShrink: 0,
        fontFamily: FONT,
      }}
    >
      {initials(name || "?")}
    </span>
  );
}

function FactoryCellCompact({ name }: { name: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          borderRadius: 5,
          flexShrink: 0,
          background: avColor(name || "?"),
          fontSize: 7,
          fontWeight: 800,
          color: "#fff",
        }}
      >
        {initials(name || "?")}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: HX.tx, fontFamily: FONT }}>
        {name || "—"}
      </span>
    </span>
  );
}

function ActionBtn({
  onClick,
  bg,
  hoverBg,
  color,
  children,
}: {
  onClick: () => void;
  bg: string;
  hoverBg: string;
  color: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: hover ? hoverBg : bg,
        color: hover ? "#fff" : color,
        transition: "background .15s, color .15s",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

interface Order {
  rowId?: string | number;
  orderId: string | number;
  code?: string;
  orderNumber?: string;
  customerName?: string;
  status?: number;
  totalPrice?: number | string;
  items?: { unitCost?: number | string; quantity?: number | string; code?: string }[];
  paymentStatus?: number;
  PoDate?: string;
  deliveryStatus?: number;
  type?: string;
  userId?: string | number;
  shippedFromInventory?: boolean;
  deliveryByLabel?: string;
  vendorId?: string | number;
  vendorName?: string;
  userNameFromApi?: string;
  daysSinceOrder?: number | null;
  createdAt?: string;
  orderSource?: number | null;
  orderSourceLabel?: string;
  deliveryPriority?: number | null;
  deliveryPriorityLabel?: string;
}
interface User {
  id: string | number;
  firstName?: string;
  lastName?: string;
}
interface Vendor {
  label: string;
  value: string | number;
}

export interface OrdersHomixMobileListProps {
  orders: Order[];
  isVendor: boolean;
  users: User[];
  vendors: Vendor[];
  selectionModel: (string | number)[];
  onSelectionModelChange: (ids: (string | number)[]) => void;
  onEdit: (row: Order) => void;
  onDelete: (row: Order) => void;
  onView: (orderId: string | number) => void;
  calculateDaysFromPoDate: (date: string) => string;
  isFetching?: boolean;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: "9.5px",
        fontWeight: 700,
        color: HX.tx3,
        fontFamily: FONT,
        letterSpacing: "0.02em",
        display: "block",
        mb: 0.15,
      }}
    >
      {children}
    </Box>
  );
}

export default function OrdersHomixMobileList({
  orders,
  isVendor,
  users,
  vendors,
  selectionModel,
  onSelectionModelChange,
  onEdit,
  onDelete,
  onView,
  calculateDaysFromPoDate,
  isFetching,
}: OrdersHomixMobileListProps) {
  const toggleRow = useCallback(
    (id: string | number) => {
      onSelectionModelChange(
        selectionModel.includes(id)
          ? selectionModel.filter((x) => x !== id)
          : [...selectionModel, id]
      );
    },
    [selectionModel, onSelectionModelChange]
  );

  if (orders.length === 0) {
    return (
      <Box
        sx={{
          py: 4,
          px: 2,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "12.5px",
          color: HX.tx3,
        }}
      >
        {isFetching ? "جارٍ التحميل..." : "لا توجد طلبات مطابقة"}
      </Box>
    );
  }

  return (
    <Stack spacing={1} sx={{ p: "10px 12px 12px", fontFamily: FONT }}>
      {orders.map((order) => {
        const rk = rowKey(order);
        const isSelected = selectionModel.includes(rk);
        const compCost = (order.items ?? []).reduce(
          (s, it) => s + Number(it.unitCost ?? 0) * Number(it.quantity ?? 1),
          0
        );
        const vendorName =
          order.vendorName ??
          vendors.find((v) => String(v.value) === String(order.vendorId))?.label ??
          "—";
        const usr = users.find((u) => String(u.id) === String(order.userId));
        const userName = usr
          ? `${usr.firstName ?? ""} ${usr.lastName ?? ""}`.trim()
          : (order.userNameFromApi?.trim() || "");
        const poDateFmt = order.PoDate
          ? moment.utc(order.PoDate).tz("Africa/Cairo").format("YY/MM/DD")
          : "—";
        const createdFmt = order.createdAt
          ? moment.utc(order.createdAt).tz("Africa/Cairo").format("YY/MM/DD")
          : "—";
        const daysLabel =
          order.daysSinceOrder != null
            ? String(order.daysSinceOrder)
            : order.PoDate
              ? calculateDaysFromPoDate(order.PoDate)
              : null;
        const productCode = order.items?.[0]?.code ?? "—";

        return (
          <Box
            key={rk}
            sx={{
              borderRadius: "10px",
              border: `0.5px solid ${HX.border}`,
              bgcolor: isSelected ? "#f5f3ff" : HX.surface,
              boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
              p: "8px 10px",
              transition: "background .12s",
            }}
          >
            {/* صف علوي: اختيار + أرقام + إجراءات */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
              {!isVendor && (
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={() => toggleRow(rk)}
                  sx={{ p: 0.25, mr: 0.25 }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onView(order.orderId)}
                    sx={{
                      border: "none",
                      background: "none",
                      p: 0,
                      cursor: "pointer",
                      fontFamily: FONT,
                      fontSize: "12.5px",
                      fontWeight: 800,
                      color: HX.accent,
                    }}
                  >
                    {order.code || "—"}
                  </Box>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onView(order.orderId)}
                    sx={{
                      border: "none",
                      background: "none",
                      p: 0,
                      cursor: "pointer",
                      fontFamily: FONT,
                      fontSize: "11.5px",
                      fontWeight: 600,
                      color: HX.tx2,
                    }}
                  >
                    {order.orderNumber ? `#${order.orderNumber}` : "—"}
                  </Box>
                </Stack>
              </Box>
              <Stack direction="row" spacing={0.35} sx={{ flexShrink: 0 }}>
                <ActionBtn
                  onClick={() => onView(order.orderId)}
                  bg={HX.accentLight}
                  hoverBg={HX.accent}
                  color={HX.accent}
                >
                  <VisibilityIcon sx={{ fontSize: 13 }} />
                </ActionBtn>
                {!isVendor && (
                  <ActionBtn onClick={() => onEdit(order)} bg={HX.blueLight} hoverBg={HX.blue} color={HX.blue}>
                    <EditIcon sx={{ fontSize: 13 }} />
                  </ActionBtn>
                )}
                {!isVendor && (
                  <ActionBtn onClick={() => onDelete(order)} bg={HX.redLight} hoverBg={HX.red} color={HX.red}>
                    <DeleteIcon sx={{ fontSize: 13 }} />
                  </ActionBtn>
                )}
              </Stack>
            </Stack>

            {/* العميل */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.65 }}>
              {order.customerName ? <AvatarCircle name={order.customerName} size={21} /> : null}
              <Box
                component="span"
                sx={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: HX.tx,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {order.customerName || "—"}
              </Box>
            </Stack>

            {/* الشارات — لف تلقائي */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
                mb: 0.65,
                "& > *": { maxWidth: "100%" },
              }}
            >
              <OrderStatusBadge status={order.status} />
              <OrderSourceBadge label={order.orderSourceLabel} />
              <PaymentBadge status={order.paymentStatus} />
              <DeliveryByBadge fromInventory={order.shippedFromInventory} label={order.deliveryByLabel} />
              <DeliveryStatusBadge status={order.deliveryStatus} />
              <PriorityValueBadge priority={order.deliveryPriority} label={order.deliveryPriorityLabel} />
              <DaysCounterBadge days={daysLabel} active={order.status === 2} />
            </Box>

            {/* مصنع + منتج */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 10px",
                mb: 0.5,
                alignItems: "start",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <FieldLabel>المصنع</FieldLabel>
                <FactoryCellCompact name={vendorName} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <FieldLabel>كود المنتج</FieldLabel>
                <Box
                  component="span"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "10.5px",
                    background: HX.surface2,
                    px: "6px",
                    py: "2px",
                    borderRadius: "5px",
                    color: HX.tx2,
                    display: "inline-block",
                  }}
                >
                  {productCode}
                </Box>
              </Box>
            </Box>

            {/* تكلفة / بيع */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 10px",
                mb: 0.45,
              }}
            >
              <Box>
                <FieldLabel>سعر التكلفة</FieldLabel>
                <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2, fontWeight: 600 }}>
                  {Number(compCost).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  <Box component="span" sx={{ fontSize: "9px", mr: 0.35 }}>
                    ج.م
                  </Box>
                </Box>
              </Box>
              <Box>
                <FieldLabel>سعر البيع</FieldLabel>
                <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx, fontWeight: 800 }}>
                  {order.totalPrice != null ? Number(order.totalPrice).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"}
                  {order.totalPrice != null && (
                    <Box component="span" sx={{ fontSize: "9px", mr: 0.35, fontWeight: 600 }}>
                      ج.م
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* تواريخ سطر واحد */}
            <Box
              sx={{
                fontSize: "10.5px",
                color: HX.tx3,
                lineHeight: 1.35,
                mb: !isVendor ? 0.45 : 0,
              }}
            >
              الطلب {createdFmt} · التصنيع {poDateFmt}
              {!isVendor ? (
                <>
                  {" · "}
                  <Box component="span" sx={{ color: HX.tx3 }}>
                    النوع {order.type || "—"}
                  </Box>
                </>
              ) : null}
            </Box>

            {!isVendor && (
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.35 }} flexWrap="wrap">
                <Box
                  component="span"
                  sx={{ fontSize: "9.5px", fontWeight: 700, color: HX.tx3, flexShrink: 0 }}
                >
                  المسئول
                </Box>
                {usr || userName ? (
                  <>
                    {userName ? <AvatarCircle name={userName} size={20} /> : null}
                    <Box component="span" sx={{ fontSize: "11px", color: HX.tx, fontWeight: 600 }}>
                      {userName || "—"}
                    </Box>
                  </>
                ) : (
                  <Box component="span" sx={{ fontSize: "11px", color: HX.tx3 }}>
                    —
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
