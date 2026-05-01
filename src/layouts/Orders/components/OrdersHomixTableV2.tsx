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

/* ─── Helpers ─── */
function initials(name: string) {
  return (name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
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

/* ─── Column definitions — widths must match between TH and TD ─── */
interface ColDef {
  key: string;
  label: string;
  width: number;
  align?: "right" | "center" | "left";
}

const BASE_COLS: ColDef[] = [
  { key: "code",         label: "رقم العملية",      width: 100 },
  { key: "orderNumber",  label: "رقم الطلب",        width: 90  },
  { key: "productCode",  label: "كود المنتج",       width: 100 },
  { key: "customerName", label: "اسم العميل",       width: 160 },
  { key: "status",       label: "حالة الطلب",       width: 120 },
  { key: "factory",      label: "اسم المصنع",       width: 150 },
  { key: "compCost",     label: "سعر التكلفة",      width: 100 },
  { key: "totalPrice",   label: "سعر البيع",        width: 100 },
  { key: "paymentStatus",label: "حالة الدفع",       width: 130 },
  { key: "delivery",     label: "التوصيل بواسطة",  width: 110 },
  { key: "priority",     label: "الأولوية",         width: 100 },
  { key: "deliveryStatus",label:"حالة التصنيع",     width: 140 },
  { key: "createdAt",    label: "تاريخ الطلب",      width: 90  },
  { key: "poDate",       label: "تاريخ التصنيع",    width: 95  },
  { key: "days",         label: "عداد الأيام",      width: 95  },
];
const ADMIN_COLS: ColDef[] = [
  { key: "admin",  label: "المسئول", width: 130 },
  { key: "type",   label: "النوع",   width: 90  },
];
const ACTIONS_COL: ColDef = { key: "actions", label: "", width: 90, align: "center" };
const CHECKBOX_W = 44;

/* ─── Mini-components ─── */
function Avatar26({ name, size = 26 }: { name: string; size?: number }) {
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
      <Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.tx, overflow: "hidden", textOverflow: "ellipsis" }}>
        {name || "—"}
      </Box>
    </Box>
  );
}

function ActionBtn({
  onClick, bg, hoverBg, color, hoverColor, icon,
}: {
  onClick: () => void;
  bg: string; hoverBg: string; color: string; hoverColor: string;
  icon: React.ReactNode;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: 26, height: 26, borderRadius: "7px", border: "none", cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        bgcolor: bg, color, transition: ".15s",
        "& svg": { fontSize: "11px !important" },
        "&:hover": { bgcolor: hoverBg, color: hoverColor },
      }}
    >
      {icon}
    </Box>
  );
}

/* ─── Types ─── */
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

/* ─── Shared cell sx — SAME font-family/size for TH and TD ─── */
const CELL_BASE = {
  fontFamily: "'Cairo', sans-serif",
  borderBottom: `0.5px solid ${HX.border}`,
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
  py: "9px",
  px: "11px",
  textAlign: "right" as const,
};

const TH = {
  ...CELL_BASE,
  bgcolor: HX.surface2,
  fontSize: "10.5px",
  fontWeight: 700,
  color: HX.tx3,
  letterSpacing: ".3px",
  position: "sticky" as const,
  top: 0,
  zIndex: 2,
};

const TD = {
  ...CELL_BASE,
  fontSize: "12px",
  color: HX.tx,
  verticalAlign: "middle" as const,
};

/* ─── Component ─── */
export default function OrdersHomixTableV2({
  orders, isVendor, users, vendors,
  selectionModel, onSelectionModelChange,
  onEdit, onDelete, onView, onBulkEdit, onBulkDelete,
  page, totalPages, pageSize, onPageChange,
  calculateDaysFromPoDate, isFetching,
}: OrdersHomixTableV2Props) {
  const totalCount = totalPages * pageSize;

  const isAllSelected = orders.length > 0 && orders.every((o) => selectionModel.includes(o.orderId));
  const isIndeterminate = orders.some((o) => selectionModel.includes(o.orderId)) && !isAllSelected;

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionModelChange(selectionModel.filter((id) => !orders.some((o) => o.orderId === id)));
    } else {
      const newIds = orders.map((o) => o.orderId).filter((id) => !selectionModel.includes(id));
      onSelectionModelChange([...selectionModel, ...newIds]);
    }
  }, [isAllSelected, orders, selectionModel, onSelectionModelChange]);

  const toggleRow = useCallback((id: string | number) => {
    if (selectionModel.includes(id)) {
      onSelectionModelChange(selectionModel.filter((x) => x !== id));
    } else {
      onSelectionModelChange([...selectionModel, id]);
    }
  }, [selectionModel, onSelectionModelChange]);

  /* build final column list (depends on isVendor) */
  const cols: ColDef[] = [
    ...BASE_COLS,
    ...(isVendor ? [] : ADMIN_COLS),
    ACTIONS_COL,
  ];

  /* total table width for colgroup */
  const tableWidth = CHECKBOX_W + cols.reduce((s, c) => s + c.width, 0);

  return (
    <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>

      {/* ── Table card header ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`, flexWrap: "wrap", gap: 1,
      }}>
        <Box>
          <Box component="span" sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: "'Cairo',sans-serif" }}>
            قائمة الطلبات
          </Box>
          <Box component="span" sx={{ fontSize: "11px", color: HX.tx3, mr: "8px", fontFamily: "'Cairo',sans-serif" }}>
            {isFetching ? " — جارٍ التحميل..." : ` — ${totalCount.toLocaleString("ar-EG")} طلب`}
          </Box>
        </Box>

        {/* Bulk actions — visible only when rows are selected */}
        {!isVendor && selectionModel.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" color="primary" onClick={onBulkEdit}
              sx={(t) => ({
                fontFamily: "'Cairo',sans-serif", fontWeight: 600, fontSize: "12px",
                borderColor: t.palette.primary.main, color: t.palette.primary.main,
                bgcolor: alpha(t.palette.primary.main, 0.08),
                "&:hover": { bgcolor: alpha(t.palette.primary.main, 0.14) },
              })}>
              تعديل المحدد ({selectionModel.length})
            </Button>
            <Button size="small" color="error" variant="outlined" onClick={onBulkDelete}
              sx={(t) => ({
                fontFamily: "'Cairo',sans-serif", fontWeight: 600, fontSize: "12px",
                borderColor: t.palette.error.main, color: t.palette.error.main,
                bgcolor: alpha(t.palette.error.main, 0.08),
                "&:hover": { bgcolor: alpha(t.palette.error.main, 0.14) },
              })}>
              حذف المحدد
            </Button>
          </Stack>
        )}
      </Box>

      {/* ── Scrollable table ── */}
      <Box sx={{ overflowX: "auto", flex: 1 }}>
        <Table
          sx={{
            width: tableWidth,
            minWidth: tableWidth,
            tableLayout: "fixed",
            borderCollapse: "collapse",
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          {/* colgroup — the ONLY place widths are defined */}
          <colgroup>
            {!isVendor && <col style={{ width: CHECKBOX_W }} />}
            {cols.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>

          {/* ── THEAD ── */}
          <TableHead>
            <TableRow>
              {!isVendor && (
                <TableCell padding="checkbox" sx={{ ...TH, width: CHECKBOX_W, textAlign: "center" }}>
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={toggleAll}
                    sx={{ p: 0 }}
                  />
                </TableCell>
              )}
              {cols.map((c) => (
                <TableCell key={c.key} sx={{ ...TH, width: c.width, textAlign: c.align ?? "right" }}>
                  {c.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* ── TBODY ── */}
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={cols.length + (isVendor ? 0 : 1)}
                  sx={{ textAlign: "center", py: 6, color: HX.tx3, fontSize: "13px", fontFamily: "'Cairo',sans-serif" }}
                >
                  {isFetching ? "جارٍ التحميل..." : "لا توجد طلبات مطابقة"}
                </TableCell>
              </TableRow>
            )}

            {orders.map((order) => {
              const isSelected = selectionModel.includes(order.orderId);

              const compCost = (order.items ?? []).reduce(
                (sum, item) => sum + Number(item.unitCost ?? 0) * Number(item.quantity ?? 1),
                0
              );
              const vendorName = vendors.find((v) => String(v.value) === String(order.vendorId))?.label ?? "—";
              const user = users.find((u) => String(u.id) === String(order.userId));
              const userName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "";
              const poDateFmt = order.PoDate
                ? moment.utc(order.PoDate).tz("Africa/Cairo").format("YY/MM/DD") : "—";
              const createdFmt = order.createdAt
                ? moment.utc(order.createdAt).tz("Africa/Cairo").format("YY/MM/DD") : "—";
              const daysLabel = order.PoDate ? calculateDaysFromPoDate(order.PoDate) : null;
              const productCode = order.items?.[0]?.code ?? "—";

              return (
                <TableRow
                  key={order.orderId}
                  selected={isSelected}
                  sx={{
                    "&:last-child td": { borderBottom: "none" },
                    "&:hover td": { bgcolor: "#fafbff" },
                  }}
                >
                  {/* Checkbox */}
                  {!isVendor && (
                    <TableCell padding="checkbox" sx={{ ...TD, width: CHECKBOX_W, textAlign: "center" }}>
                      <Checkbox size="small" checked={isSelected}
                        onChange={() => toggleRow(order.orderId)} sx={{ p: 0 }} />
                    </TableCell>
                  )}

                  {/* رقم العملية */}
                  <TableCell sx={{ ...TD, width: 100 }}>
                    <Box component="span" onClick={() => onView(order.orderId)} sx={{
                      color: HX.accent, fontWeight: 800, cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}>
                      {order.code || "—"}
                    </Box>
                  </TableCell>

                  {/* رقم الطلب */}
                  <TableCell sx={{ ...TD, width: 90 }}>
                    <Box component="span" onClick={() => onView(order.orderId)} sx={{
                      color: HX.tx2, fontWeight: 600, cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}>
                      {order.orderNumber ? `#${order.orderNumber}` : "—"}
                    </Box>
                  </TableCell>

                  {/* كود المنتج */}
                  <TableCell sx={{ ...TD, width: 100 }}>
                    <Box component="span" sx={{
                      fontFamily: "monospace", fontSize: "11px",
                      bgcolor: HX.surface2, px: "7px", py: "2px",
                      borderRadius: "5px", color: HX.tx2,
                    }}>
                      {productCode}
                    </Box>
                  </TableCell>

                  {/* اسم العميل */}
                  <TableCell sx={{ ...TD, width: 160 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      {order.customerName && <Avatar26 name={order.customerName} />}
                      <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {order.customerName || "—"}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* حالة الطلب */}
                  <TableCell sx={{ ...TD, width: 120 }}>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>

                  {/* اسم المصنع */}
                  <TableCell sx={{ ...TD, width: 150 }}>
                    <FactoryCell name={vendorName} />
                  </TableCell>

                  {/* سعر التكلفة */}
                  <TableCell sx={{ ...TD, width: 100, color: HX.tx2 }}>
                    {Number(compCost).toLocaleString("ar-EG")}
                    <Box component="span" sx={{ fontSize: "10px", mr: "2px" }}>ج.م</Box>
                  </TableCell>

                  {/* سعر البيع */}
                  <TableCell sx={{ ...TD, width: 100, fontWeight: 700 }}>
                    {order.totalPrice != null ? Number(order.totalPrice).toLocaleString("ar-EG") : "—"}
                    <Box component="span" sx={{ fontSize: "10px", mr: "2px" }}>ج.م</Box>
                  </TableCell>

                  {/* حالة الدفع */}
                  <TableCell sx={{ ...TD, width: 130 }}>
                    <PaymentBadge status={order.paymentStatus} />
                  </TableCell>

                  {/* التوصيل بواسطة */}
                  <TableCell sx={{ ...TD, width: 110 }}>
                    <DeliveryByBadge fromInventory={order.shippedFromInventory} />
                  </TableCell>

                  {/* الأولوية — no API field yet */}
                  <TableCell sx={{ ...TD, width: 100 }}>
                    <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>
                  </TableCell>

                  {/* حالة التصنيع */}
                  <TableCell sx={{ ...TD, width: 140 }}>
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </TableCell>

                  {/* تاريخ الطلب */}
                  <TableCell sx={{ ...TD, width: 90, color: HX.tx3, fontSize: "11.5px" }}>
                    {createdFmt}
                  </TableCell>

                  {/* تاريخ التصنيع */}
                  <TableCell sx={{ ...TD, width: 95, color: HX.tx3, fontSize: "11.5px" }}>
                    {poDateFmt}
                  </TableCell>

                  {/* عداد الأيام */}
                  <TableCell sx={{ ...TD, width: 95 }}>
                    <DaysCounterBadge days={daysLabel} active={order.status === IN_MFG_STATUS} />
                  </TableCell>

                  {/* المسئول — admin only */}
                  {!isVendor && (
                    <TableCell sx={{ ...TD, width: 130 }}>
                      {user ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Avatar26 name={userName} size={22} />
                          <Box component="span" sx={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {userName}
                          </Box>
                        </Box>
                      ) : (
                        <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>
                      )}
                    </TableCell>
                  )}

                  {/* النوع — admin only */}
                  {!isVendor && (
                    <TableCell sx={{ ...TD, width: 90, color: HX.tx2 }}>
                      {order.type || "—"}
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell sx={{ ...TD, width: 90, textAlign: "center" }}>
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
      <Box sx={{ borderTop: `0.5px solid ${HX.border}` }}>
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
            fontFamily: "'Cairo',sans-serif",
            "& .MuiTablePagination-toolbar": { px: "14px", minHeight: 44, fontFamily: "'Cairo',sans-serif" },
            "& .MuiTablePagination-displayedRows": { fontSize: "11.5px", color: HX.tx2, fontFamily: "'Cairo',sans-serif" },
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
