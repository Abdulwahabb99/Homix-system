import React, { useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import "moment-timezone";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import {
  OrderStatusBadge,
  DeliveryStatusBadge,
  PaymentBadge,
  DaysCounterBadge,
  DeliveryByBadge,
} from "layouts/Orders/components/OrdersHomixBadges";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function initials(name: string) {
  return (name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#6366f1,#a78bfa)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
  "linear-gradient(135deg,#8b5cf6,#6366f1)",
  "linear-gradient(135deg,#14b8a6,#0f766e)",
];
function avatarColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

const IN_MFG_STATUS = 2;

/* ─────────────────────────────────────────────
   Column definitions
   widths ONLY live here — not on any <th>/<td>
───────────────────────────────────────────── */
const CHECKBOX_W = 44;

const BASE_COLS = [
  { key: "code",          label: "رقم العملية",     w: 110 },
  { key: "orderNumber",   label: "رقم الطلب",       w: 95  },
  { key: "productCode",   label: "كود المنتج",      w: 105 },
  { key: "customerName",  label: "اسم العميل",      w: 170 },
  { key: "status",        label: "حالة الطلب",      w: 120 },
  { key: "factory",       label: "اسم المصنع",      w: 155 },
  { key: "compCost",      label: "سعر التكلفة",     w: 100 },
  { key: "totalPrice",    label: "سعر البيع",       w: 100 },
  { key: "paymentStatus", label: "حالة الدفع",      w: 130 },
  { key: "delivery",      label: "التوصيل بواسطة",  w: 115 },
  { key: "priority",      label: "الأولوية",        w: 100 },
  { key: "mfgStatus",     label: "حالة التصنيع",    w: 140 },
  { key: "createdAt",     label: "تاريخ الطلب",     w: 90  },
  { key: "poDate",        label: "تاريخ التصنيع",   w: 95  },
  { key: "days",          label: "عداد الأيام",     w: 100 },
] as const;

const ADMIN_COLS = [
  { key: "admin", label: "المسئول", w: 140 },
  { key: "type",  label: "النوع",   w: 90  },
] as const;

const ACTIONS_COL = { key: "actions", label: "", w: 90 } as const;

/* ─────────────────────────────────────────────
   Shared cell styles
   No width here — widths come from colgroup only
───────────────────────────────────────────── */
const FONT = "'Cairo', sans-serif";

/** th style — sticky header */
const TH: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "10.5px",
  fontWeight: 700,
  color: HX.tx3,
  letterSpacing: ".3px",
  textAlign: "right",
  padding: "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  whiteSpace: "nowrap",
  background: HX.surface2,
  overflow: "hidden",
};

/** td style */
const TD: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "12px",
  color: HX.tx,
  textAlign: "right",
  padding: "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  overflow: "hidden",
};

/* ─────────────────────────────────────────────
   Mini-components
───────────────────────────────────────────── */
function AvatarCircle({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: "50%",
      background: avatarColor(name || "?"),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: `${Math.floor(size * 0.34)}px`, fontWeight: 800,
      color: "#fff", flexShrink: 0,
    }}>
      {initials(name || "?")}
    </Box>
  );
}

function FactoryCell({ name }: { name: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
      <Box sx={{
        width: 22, height: 22, borderRadius: "6px",
        background: avatarColor(name || "?"),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "8px", fontWeight: 800, color: "#fff", flexShrink: 0,
      }}>
        {initials(name || "?")}
      </Box>
      <Box component="span" sx={{
        fontSize: "12px", fontFamily: FONT, fontWeight: 600, color: HX.tx,
        overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {name || "—"}
      </Box>
    </Box>
  );
}

function ActionBtn({ onClick, bg, hoverBg, color, hoverColor, icon }: {
  onClick: () => void;
  bg: string; hoverBg: string; color: string; hoverColor: string;
  icon: React.ReactNode;
}) {
  return (
    <Box component="button" onClick={onClick} sx={{
      width: 26, height: 26, borderRadius: "7px", border: "none",
      cursor: "pointer", display: "inline-flex", alignItems: "center",
      justifyContent: "center", bgcolor: bg, color, transition: ".15s",
      "& svg": { fontSize: "11px !important" },
      "&:hover": { bgcolor: hoverBg, color: hoverColor },
    }}>
      {icon}
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Order {
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
  vendorId?: string | number;
  createdAt?: string;
}
interface User { id: string | number; firstName?: string; lastName?: string }
interface Vendor { label: string; value: string | number }

interface OrdersHomixTableV2Props {
  orders: Order[];
  isVendor: boolean;
  users: User[];
  vendors: Vendor[];
  selectionModel: (string | number)[];
  onSelectionModelChange: (ids: (string | number)[]) => void;
  onEdit: (row: Order) => void;
  onDelete: (row: Order) => void;
  onView: (orderId: string | number) => void;
  onBulkEdit?: () => void;
  onBulkDelete?: () => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  calculateDaysFromPoDate: (date: string) => string;
  isFetching?: boolean;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function OrdersHomixTableV2({
  orders, isVendor, users, vendors,
  selectionModel, onSelectionModelChange,
  onEdit, onDelete, onView, onBulkEdit, onBulkDelete,
  page, totalPages, pageSize, onPageChange,
  calculateDaysFromPoDate, isFetching,
}: OrdersHomixTableV2Props) {
  const totalCount = totalPages * pageSize;

  const isAllSelected =
    orders.length > 0 && orders.every((o) => selectionModel.includes(o.orderId));
  const isIndeterminate =
    orders.some((o) => selectionModel.includes(o.orderId)) && !isAllSelected;

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionModelChange(selectionModel.filter((id) => !orders.some((o) => o.orderId === id)));
    } else {
      const newIds = orders.map((o) => o.orderId).filter((id) => !selectionModel.includes(id));
      onSelectionModelChange([...selectionModel, ...newIds]);
    }
  }, [isAllSelected, orders, selectionModel, onSelectionModelChange]);

  const toggleRow = useCallback((id: string | number) => {
    onSelectionModelChange(
      selectionModel.includes(id)
        ? selectionModel.filter((x) => x !== id)
        : [...selectionModel, id]
    );
  }, [selectionModel, onSelectionModelChange]);

  /* Build column list based on role */
  const extraCols = isVendor ? [] : [...ADMIN_COLS];
  const allCols   = [...BASE_COLS, ...extraCols, ACTIONS_COL];

  /* Total table width from colgroup — used for <Table> minWidth */
  const tableWidth = CHECKBOX_W + allCols.reduce((s, c) => s + c.w, 0);

  return (
    <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>

      {/* ── Card header ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`,
        flexWrap: "wrap", gap: 1, flexShrink: 0,
      }}>
        <Box>
          <Box component="span" sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>
            قائمة الطلبات
          </Box>
          <Box component="span" sx={{ fontSize: "11px", color: HX.tx3, mr: "8px", fontFamily: FONT }}>
            {isFetching
              ? " — جارٍ التحميل..."
              : ` — ${totalCount.toLocaleString("ar-EG")} طلب`}
          </Box>
        </Box>

        {!isVendor && selectionModel.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" color="primary" onClick={onBulkEdit}
              sx={(t) => ({
                fontFamily: FONT, fontWeight: 600, fontSize: "12px",
                borderColor: t.palette.primary.main, color: t.palette.primary.main,
                bgcolor: alpha(t.palette.primary.main, 0.08),
                "&:hover": { bgcolor: alpha(t.palette.primary.main, 0.14) },
              })}>
              تعديل المحدد ({selectionModel.length})
            </Button>
            <Button size="small" color="error" variant="outlined" onClick={onBulkDelete}
              sx={(t) => ({
                fontFamily: FONT, fontWeight: 600, fontSize: "12px",
                borderColor: t.palette.error.main, color: t.palette.error.main,
                bgcolor: alpha(t.palette.error.main, 0.08),
                "&:hover": { bgcolor: alpha(t.palette.error.main, 0.14) },
              })}>
              حذف المحدد
            </Button>
          </Stack>
        )}
      </Box>

      {/* ─────────────────────────────────────────────
          Single scroll container — handles BOTH
          horizontal AND vertical scroll.
          thead position:sticky works relative to
          this container, so headers stick on top
          while staying perfectly aligned with columns
          during horizontal scroll.
        ───────────────────────────────────────────── */}
      <Box sx={{
        overflow: "auto",          /* both axes */
        maxHeight: 560,            /* vertical scroll kicks in after this */
        flex: 1,
        /* thin custom scrollbar */
        "&::-webkit-scrollbar": { width: 4, height: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: HX.border, borderRadius: 4 },
      }}>
        <Table sx={{
          minWidth: tableWidth,    /* forces horizontal scroll when needed */
          tableLayout: "fixed",   /* column widths set by colgroup — guaranteed alignment */
          borderCollapse: "collapse",
          fontFamily: FONT,
        }}>

          {/* ── colgroup — the ONE source of truth for column widths ── */}
          <colgroup>
            {!isVendor && <col style={{ width: CHECKBOX_W }} />}
            {allCols.map((c) => <col key={c.key} style={{ width: c.w }} />)}
          </colgroup>

          {/* ── THEAD — sticky within the scroll container ── */}
          <TableHead
            component="thead"
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 3,          /* above td cells */
            }}
          >
            <TableRow component="tr">
              {!isVendor && (
                <TableCell
                  component="th"
                  padding="checkbox"
                  style={{ ...TH, textAlign: "center" }}
                >
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={toggleAll}
                    sx={{ p: 0 }}
                  />
                </TableCell>
              )}
              {allCols.map((c) => (
                <TableCell
                  component="th"
                  key={c.key}
                  style={TH}
                >
                  {c.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* ── TBODY ── */}
          <TableBody component="tbody">
            {orders.length === 0 && (
              <TableRow component="tr">
                <TableCell
                  component="td"
                  colSpan={allCols.length + (isVendor ? 0 : 1)}
                  style={{ ...TD, textAlign: "center", padding: "40px 0", color: HX.tx3 }}
                >
                  {isFetching ? "جارٍ التحميل..." : "لا توجد طلبات مطابقة"}
                </TableCell>
              </TableRow>
            )}

            {orders.map((order) => {
              const isSelected = selectionModel.includes(order.orderId);

              const compCost = (order.items ?? []).reduce(
                (s, it) => s + Number(it.unitCost ?? 0) * Number(it.quantity ?? 1), 0
              );
              const vendorName =
                vendors.find((v) => String(v.value) === String(order.vendorId))?.label ?? "—";
              const user = users.find((u) => String(u.id) === String(order.userId));
              const userName = user
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "";
              const poDateFmt  = order.PoDate
                ? moment.utc(order.PoDate).tz("Africa/Cairo").format("YY/MM/DD") : "—";
              const createdFmt = order.createdAt
                ? moment.utc(order.createdAt).tz("Africa/Cairo").format("YY/MM/DD") : "—";
              const daysLabel  = order.PoDate ? calculateDaysFromPoDate(order.PoDate) : null;
              const productCode = order.items?.[0]?.code ?? "—";

              return (
                <TableRow
                  component="tr"
                  key={order.orderId}
                  selected={isSelected}
                  sx={{
                    "&:last-child td, &:last-child th": { borderBottom: "none" },
                    "&:hover td, &:hover th": { bgcolor: "#fafbff" },
                  }}
                >
                  {/* checkbox */}
                  {!isVendor && (
                    <TableCell component="td" padding="checkbox" style={{ ...TD, textAlign: "center" }}>
                      <Checkbox size="small" checked={isSelected}
                        onChange={() => toggleRow(order.orderId)} sx={{ p: 0 }} />
                    </TableCell>
                  )}

                  {/* رقم العملية */}
                  <TableCell component="td" style={TD}>
                    <Box component="span" onClick={() => onView(order.orderId)} sx={{
                      color: HX.accent, fontWeight: 800, cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}>
                      {order.code || "—"}
                    </Box>
                  </TableCell>

                  {/* رقم الطلب */}
                  <TableCell component="td" style={TD}>
                    <Box component="span" onClick={() => onView(order.orderId)} sx={{
                      color: HX.tx2, fontWeight: 600, cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}>
                      {order.orderNumber ? `#${order.orderNumber}` : "—"}
                    </Box>
                  </TableCell>

                  {/* كود المنتج */}
                  <TableCell component="td" style={TD}>
                    <Box component="span" sx={{
                      fontFamily: "monospace", fontSize: "11px",
                      bgcolor: HX.surface2, px: "7px", py: "2px",
                      borderRadius: "5px", color: HX.tx2,
                    }}>
                      {productCode}
                    </Box>
                  </TableCell>

                  {/* اسم العميل */}
                  <TableCell component="td" style={TD}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      {order.customerName && <AvatarCircle name={order.customerName} />}
                      <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", fontFamily: FONT }}>
                        {order.customerName || "—"}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* حالة الطلب */}
                  <TableCell component="td" style={TD}>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>

                  {/* اسم المصنع */}
                  <TableCell component="td" style={TD}>
                    <FactoryCell name={vendorName} />
                  </TableCell>

                  {/* سعر التكلفة */}
                  <TableCell component="td" style={{ ...TD, color: HX.tx2 }}>
                    {Number(compCost).toLocaleString("ar-EG")}
                    <Box component="span" sx={{ fontSize: "10px", mr: "2px" }}>ج.م</Box>
                  </TableCell>

                  {/* سعر البيع */}
                  <TableCell component="td" style={{ ...TD, fontWeight: 700 }}>
                    {order.totalPrice != null
                      ? Number(order.totalPrice).toLocaleString("ar-EG") : "—"}
                    <Box component="span" sx={{ fontSize: "10px", mr: "2px" }}>ج.م</Box>
                  </TableCell>

                  {/* حالة الدفع */}
                  <TableCell component="td" style={TD}>
                    <PaymentBadge status={order.paymentStatus} />
                  </TableCell>

                  {/* التوصيل بواسطة */}
                  <TableCell component="td" style={TD}>
                    <DeliveryByBadge fromInventory={order.shippedFromInventory} />
                  </TableCell>

                  {/* الأولوية — no API field */}
                  <TableCell component="td" style={{ ...TD, color: HX.tx3, fontSize: "11.5px" }}>
                    —
                  </TableCell>

                  {/* حالة التصنيع */}
                  <TableCell component="td" style={TD}>
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </TableCell>

                  {/* تاريخ الطلب */}
                  <TableCell component="td" style={{ ...TD, color: HX.tx3, fontSize: "11.5px" }}>
                    {createdFmt}
                  </TableCell>

                  {/* تاريخ التصنيع */}
                  <TableCell component="td" style={{ ...TD, color: HX.tx3, fontSize: "11.5px" }}>
                    {poDateFmt}
                  </TableCell>

                  {/* عداد الأيام */}
                  <TableCell component="td" style={TD}>
                    <DaysCounterBadge days={daysLabel} active={order.status === IN_MFG_STATUS} />
                  </TableCell>

                  {/* المسئول — admin only */}
                  {!isVendor && (
                    <TableCell component="td" style={TD}>
                      {user ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <AvatarCircle name={userName} size={22} />
                          <Box component="span" sx={{
                            fontSize: "12px", fontFamily: FONT,
                            overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {userName}
                          </Box>
                        </Box>
                      ) : (
                        <Box component="span" style={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>
                      )}
                    </TableCell>
                  )}

                  {/* النوع — admin only */}
                  {!isVendor && (
                    <TableCell component="td" style={{ ...TD, color: HX.tx2 }}>
                      {order.type || "—"}
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell component="td" style={{ ...TD, textAlign: "center" }}>
                    <Box sx={{ display: "flex", gap: "3px", justifyContent: "center" }}>
                      <ActionBtn
                        onClick={() => onView(order.orderId)}
                        bg={HX.accentLight} hoverBg={HX.accent}
                        color={HX.accent} hoverColor="#fff"
                        icon={<VisibilityIcon fontSize="inherit" />}
                      />
                      {!isVendor && (
                        <ActionBtn
                          onClick={() => onEdit(order)}
                          bg={HX.blueLight} hoverBg={HX.blue}
                          color={HX.blue} hoverColor="#fff"
                          icon={<EditIcon fontSize="inherit" />}
                        />
                      )}
                      {!isVendor && (
                        <ActionBtn
                          onClick={() => onDelete(order)}
                          bg={HX.redLight} hoverBg={HX.red}
                          color={HX.red} hoverColor="#fff"
                          icon={<DeleteIcon fontSize="inherit" />}
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      {/* ── Pagination ── */}
      <Box sx={{ borderTop: `0.5px solid ${HX.border}`, flexShrink: 0 }}>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          labelDisplayedRows={({ from, to, count }) =>
            `عرض ${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`} طلب`
          }
          sx={{
            fontFamily: FONT,
            "& .MuiTablePagination-toolbar":       { px: "14px", minHeight: 44, fontFamily: FONT },
            "& .MuiTablePagination-displayedRows": { fontSize: "11.5px", color: HX.tx2, fontFamily: FONT },
            "& .MuiTablePagination-actions button": {
              border: `0.5px solid ${HX.border}`, borderRadius: "7px",
              width: 28, height: 28, color: HX.tx2,
              "&:hover": { bgcolor: HX.surface2 },
            },
          }}
        />
      </Box>
    </Box>
  );
}
