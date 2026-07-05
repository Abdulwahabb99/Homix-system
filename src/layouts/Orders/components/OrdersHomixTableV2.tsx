import React, { useCallback, useMemo, useState } from "react";
import { Box, Button, Checkbox, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import "moment-timezone";
import { HX, cardSx } from "../ordersHomixTheme";
import {
  OrderStatusBadge,
  DeliveryStatusBadge,
  PaymentBadge,
  DaysCounterBadge,
  DeliveryByBadge,
} from "./OrdersHomixBadges";
import OrdersHomixMobileList from "./OrdersHomixMobileList";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Column definitions — SINGLE source of truth
   widths used in colgroup + nothing else
───────────────────────────────────────── */
const CHECKBOX_W = 22;
const CHECKBOX_SX = {
  p: 0,
  transform: "scale(0.68)",
  transformOrigin: "center",
  "& .MuiSvgIcon-root": { fontSize: 25 },
} as const;

const BASE_COLS = [
  { key: "code",          label: "رقم العملية",    w: 78  },
  { key: "orderNumber",   label: "رقم الطلب",      w: 70  },
  { key: "productCode",   label: "كود المنتج",     w: 104 },
  { key: "customerName",  label: "اسم العميل",     w: 128 },
  { key: "status",        label: "حالة الطلب",     w: 83 },
  { key: "factory",       label: "اسم المصنع",     w: 120 },
  { key: "compCost",      label: "سعر التكلفة",    w: 81  },
  { key: "totalPrice",    label: "سعر البيع",      w: 76  },
  { key: "paymentStatus", label: "حالة الدفع",     w: 126 },
  { key: "delivery",      label: "التوصيل بواسطة", w: 112 },
  { key: "mfgStatus",     label: "حالة التصنيع",   w: 125 },
  { key: "createdAt",     label: "تاريخ الطلب",    w: 86  },
  { key: "poDate",        label: "تاريخ التصنيع",  w: 94  },
  { key: "days",          label: "عداد الأيام",    w: 92  },
] as const;

const ADMIN_COLS = [
  { key: "admin", label: "المسئول", w: 116 },
  { key: "type",  label: "النوع",   w: 84  },
] as const;

const ACTIONS_COL = { key: "actions", label: "", w: 92 } as const;

/* ─────────────────────────────────────────
   Base cell styles (inline — no className magic)
───────────────────────────────────────── */
const TH: React.CSSProperties = {
  fontFamily: FONT,
  fontSize:   "10.5px",
  fontWeight: 700,
  color:      HX.tx3,
  background: HX.surface2,
  textAlign:  "right",
  padding:    "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  borderRight:  "none",
  borderLeft:   "none",
  whiteSpace:   "nowrap",
  letterSpacing: ".3px",
  overflow:     "hidden",
  textOverflow: "ellipsis",
  /* sticky comes from <thead> — NOT from individual cells */
};

const TD: React.CSSProperties = {
  fontFamily:   FONT,
  fontSize:     "12px",
  color:        HX.tx,
  textAlign:    "right",
  padding:      "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  borderRight:  "none",
  borderLeft:   "none",
  whiteSpace:   "nowrap",
  verticalAlign:"middle",
  overflow:     "hidden",
  textOverflow: "ellipsis",
};

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function AvatarCircle({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%",
      background: avColor(name || "?"),
      fontSize: Math.floor(size * 0.34), fontWeight: 800,
      color: "#fff", flexShrink: 0, fontFamily: FONT,
    }}>
      {initials(name || "?")}
    </span>
  );
}

/* نص يُقصّ بنقاط (…) عند التجاوز ويعرض النص كاملاً في tooltip عند المرور.
   يعتمد على min-width:0 + flex:1 كي يتقلّص داخل خلية بعرض ثابت. */
function EllipsisText({
  children,
  title,
  style,
}: {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      title={title || undefined}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: 0,
        flex: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function FactoryCell({ name }: { name: string }) {
  const has = Boolean(name && name !== "—");
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background: avColor(name || "?"),
        fontSize: 8, fontWeight: 800, color: "#fff",
      }}>
        {initials(name || "?")}
      </span>
      <EllipsisText title={has ? name : undefined} style={{ fontSize: 12, fontWeight: 600, color: HX.tx, fontFamily: FONT }}>
        {name || "—"}
      </EllipsisText>
    </span>
  );
}

function ActionBtn({ onClick, bg, hoverBg, color, children }: {
  onClick: () => void;
  bg: string; hoverBg: string; color: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 26, height: 26, borderRadius: 7, border: "none",
        cursor: "pointer", display: "inline-flex",
        alignItems: "center", justifyContent: "center",
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

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
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
  vendorId?: string | number;
  vendorName?: string;
  userNameFromApi?: string;
  daysSinceOrder?: number | null;
  createdAt?: string;
}
interface User   { id: string | number; firstName?: string; lastName?: string }
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
  /** إجمالي السجلات من الـ API (للترقيم والعنوان) */
  totalCount?: number;
  /** تصدير Excel — يُظهر زر Excel في ترويسة الجدول عند تمريره */
  onExport?: () => void;
  isExporting?: boolean;
}

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
export default function OrdersHomixTableV2({
  orders, isVendor, users, vendors,
  selectionModel, onSelectionModelChange,
  onEdit, onDelete, onView, onBulkEdit, onBulkDelete,
  page, totalPages, pageSize, onPageChange,
  calculateDaysFromPoDate, isFetching,
  totalCount: totalCountFromApi,
  onExport, isExporting,
}: OrdersHomixTableV2Props) {
  const totalCount =
    totalCountFromApi != null ? totalCountFromApi : totalPages * pageSize;

  const rowKey = (o: Order) => o.rowId ?? o.orderId;

  const isAllSelected =
    orders.length > 0 && orders.every((o) => selectionModel.includes(rowKey(o)));
  const isIndeterminate =
    orders.some((o) => selectionModel.includes(rowKey(o))) && !isAllSelected;

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionModelChange(
        selectionModel.filter((id) => !orders.some((o) => rowKey(o) === id))
      );
    } else {
      const add = orders.map((o) => rowKey(o)).filter((id) => !selectionModel.includes(id));
      onSelectionModelChange([...selectionModel, ...add]);
    }
  }, [isAllSelected, orders, selectionModel, onSelectionModelChange]);

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

  const extraCols  = isVendor ? [] : [...ADMIN_COLS];
  const allCols    = [...BASE_COLS, ...extraCols, ACTIONS_COL];
  const colCount   = allCols.length + (isVendor ? 0 : 1); // +1 for checkbox
  const tableWidth = CHECKBOX_W + allCols.reduce((s, c) => s + c.w, 0);

  /* ترتيب الصفحة الحالية محلياً حسب اختيار المستخدم */
  const [sortKey, setSortKey] = useState<"newest" | "oldest" | "priceDesc" | "daysDesc">("newest");
  const sortedOrders = useMemo(() => {
    const arr = [...orders];
    switch (sortKey) {
      case "oldest":
        return arr.sort((a, b) => moment(a.createdAt).diff(moment(b.createdAt)));
      case "priceDesc":
        return arr.sort((a, b) => Number(b.totalPrice ?? 0) - Number(a.totalPrice ?? 0));
      case "daysDesc":
        return arr.sort((a, b) => Number(b.daysSinceOrder ?? 0) - Number(a.daysSinceOrder ?? 0));
      case "newest":
      default:
        return arr.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
    }
  }, [orders, sortKey]);

  return (
    <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>

      {/* ── Card header ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`,
        flexWrap: "wrap", gap: 1, flexShrink: 0,
      }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "6px",
            fontFamily: FONT,
          }}
        >
          <Box component="span" sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx }}>
            قائمة الطلبات
          </Box>
          {isFetching ? (
            <Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.tx2 }}>
              — جارٍ التحميل...
            </Box>
          ) : (
            <>
              <Box component="span" sx={{ fontSize: "12px", fontWeight: 500, color: HX.tx3 }}>
                —
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: "13.5px",
                  fontWeight: 750,
                  color: HX.tx,
                  letterSpacing: "-0.02em",
                }}
              >
                {`${totalCount.toLocaleString("en-US", { maximumFractionDigits: 0 })} طلب`}
              </Box>
            </>
          )}
        </Box>

        <Stack direction="row" spacing={1.25} flexWrap="wrap" sx={{ alignItems: "center" }}>
          {!isVendor && selectionModel.length > 0 && (
            <>
            <Button
              variant="outlined"
              color="primary"
              onClick={onBulkEdit}
              sx={(t) => ({
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "none",
                minHeight: 36,
                px: 2,
                py: 0.75,
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: t.palette.primary.main,
                color: t.palette.primary.dark,
                bgcolor: alpha(t.palette.primary.main, 0.14),
                boxShadow: `0 1px 0 ${alpha(t.palette.primary.main, 0.12)}, 0 2px 8px rgba(15,23,42,0.06)`,
                "&:hover": {
                  bgcolor: alpha(t.palette.primary.main, 0.22),
                  borderWidth: 1.5,
                  borderColor: t.palette.primary.dark,
                  boxShadow: `0 2px 10px ${alpha(t.palette.primary.main, 0.28)}`,
                },
              })}
            >
              تعديل المحدد ({selectionModel.length})
            </Button>
            <Button
              color="error"
              variant="outlined"
              onClick={onBulkDelete}
              sx={(t) => ({
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "none",
                minHeight: 36,
                px: 2,
                py: 0.75,
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: t.palette.error.main,
                color: t.palette.error.dark,
                bgcolor: alpha(t.palette.error.main, 0.12),
                boxShadow: `0 1px 0 ${alpha(t.palette.error.main, 0.1)}, 0 2px 8px rgba(15,23,42,0.06)`,
                "&:hover": {
                  bgcolor: alpha(t.palette.error.main, 0.2),
                  borderWidth: 1.5,
                  borderColor: t.palette.error.dark,
                  boxShadow: `0 2px 10px ${alpha(t.palette.error.main, 0.3)}`,
                },
              })}
            >
              حذف المحدد
            </Button>
            </>
          )}

          {/* ترتيب الصفحة الحالية (بدون عنوان) */}
          <Box
            component="select"
            value={sortKey}
            onChange={(e) =>
              setSortKey(
                (e.target as HTMLSelectElement).value as
                  | "newest"
                  | "oldest"
                  | "priceDesc"
                  | "daysDesc"
              )
            }
            sx={{
              fontFamily: FONT,
              fontSize: "12px",
              height: 30,
              px: "10px",
              border: `0.5px solid ${HX.border}`,
              borderRadius: "8px",
              bgcolor: HX.surface,
              color: HX.tx2,
              outline: "none",
              cursor: "pointer",
              "&:focus": { borderColor: HX.accent },
            }}
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="oldest">الأقدم أولاً</option>
            <option value="priceDesc">الأعلى سعراً</option>
            <option value="daysDesc">الأكثر إلحاحاً</option>
          </Box>

          {/* تصدير Excel */}
          {onExport && (
            <Box
              component="button"
              type="button"
              onClick={onExport}
              disabled={isExporting}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                height: 30,
                px: "12px",
                fontSize: "11.5px",
                fontWeight: 600,
                fontFamily: FONT,
                bgcolor: HX.surface2,
                color: HX.tx2,
                border: `0.5px solid ${HX.border}`,
                borderRadius: "8px",
                cursor: isExporting ? "default" : "pointer",
                opacity: isExporting ? 0.6 : 1,
                transition: ".15s",
                "&:hover": { borderColor: HX.accent, color: HX.accent },
              }}
            >
              {isExporting ? "جارٍ التصدير…" : "Excel"}
            </Box>
          )}
        </Stack>
      </Box>

      {/* ─────────────────────────────────────────
          Scroll wrapper — BOTH axes in ONE container.
          This is the key: thead sticky works relative
          to THIS container, so columns ALWAYS stay
          aligned while scrolling in any direction.
        ───────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          overflow: "auto",
          maxHeight: 460,
          flex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: `${HX.border} transparent`,
        }}
      >
        <OrdersHomixMobileList
          orders={orders}
          isVendor={isVendor}
          users={users}
          vendors={vendors}
          selectionModel={selectionModel}
          onSelectionModelChange={onSelectionModelChange}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          calculateDaysFromPoDate={calculateDaysFromPoDate}
          isFetching={isFetching}
        />
      </Box>

      <Box
        component="div"
        sx={{
          display: { xs: "none", md: "block" },
          overflow: "auto",
          maxHeight: 460,
          flex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: `${HX.border} transparent`,
        }}
      >

        {/* ── Pure HTML <table> — no MUI wrappers that override colgroup ── */}
        <table style={{
          tableLayout:     "fixed",    /* colgroup dictates every column width */
          borderCollapse:  "collapse",
          minWidth:        tableWidth,
          width:           "100%",
          fontFamily:      FONT,
        }}>

          {/* colgroup — only place widths are declared */}
          <colgroup>
            {!isVendor && <col style={{ width: CHECKBOX_W }} />}
            {allCols.map((c) => <col key={c.key} style={{ width: c.w }} />)}
          </colgroup>

          {/* ── THEAD — sticky as a unit ── */}
          <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
            <tr>
              {!isVendor && (
                <th style={{ ...TH, textAlign: "center", padding: "2px 4px" }}>
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={toggleAll}
                    sx={CHECKBOX_SX}
                  />
                </th>
              )}
              {allCols.map((c) => (
                <th key={c.key} style={TH} title={c.label || undefined}>{c.label}</th>
              ))}
            </tr>
          </thead>

          {/* ── TBODY ── */}
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={colCount}
                  style={{ ...TD, textAlign: "center", padding: "40px 0", color: HX.tx3 }}>
                  {isFetching ? "جارٍ التحميل..." : "لا توجد طلبات مطابقة"}
                </td>
              </tr>
            )}

            {sortedOrders.map((order) => {
              const rk = rowKey(order);
              const isSelected = selectionModel.includes(rk);

              const compCost = (order.items ?? []).reduce(
                (s, it) => s + Number(it.unitCost ?? 0) * Number(it.quantity ?? 1), 0
              );
              const factoryName =
                order.vendorName ??
                vendors.find((v) => String(v.value) === String(order.vendorId))?.label ??
                "—";
              const user = users.find((u) => String(u.id) === String(order.userId));
              const userName = user
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
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

              const rowBg = isSelected ? "#f5f3ff" : undefined;

              return (
                <tr key={rk}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "#fafbff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg ?? ""; }}
                  style={{ background: rowBg }}
                >
                  {/* checkbox */}
                  {!isVendor && (
                    <td style={{ ...TD, textAlign: "center", padding: "9px 4px" }}>
                      <Checkbox size="small" checked={isSelected}
                        onChange={() => toggleRow(rk)} sx={CHECKBOX_SX} />
                    </td>
                  )}

                  {/* رقم العملية */}
                  <td style={TD}>
                    <span onClick={() => onView(order.orderId)}
                      style={{ color: HX.accent, fontWeight: 800, cursor: "pointer" }}>
                      {order.code || "—"}
                    </span>
                  </td>

                  {/* رقم الطلب */}
                  <td style={TD}>
                    <span onClick={() => onView(order.orderId)}
                      style={{ color: HX.tx2, fontWeight: 600, cursor: "pointer" }}>
                      {order.orderNumber ? `#${order.orderNumber}` : "—"}
                    </span>
                  </td>

                  {/* كود المنتج */}
                  <td title={productCode !== "—" ? productCode : undefined} style={TD}>
                    <span style={{
                      display: "inline-block", maxWidth: "100%", verticalAlign: "middle",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      fontFamily: "monospace", fontSize: 11,
                      background: HX.surface2, padding: "2px 7px",
                      borderRadius: 5, color: HX.tx2,
                    }}>
                      {productCode}
                    </span>
                  </td>

                  {/* اسم العميل */}
                  <td style={TD}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                      {order.customerName && <AvatarCircle name={order.customerName} />}
                      <EllipsisText title={order.customerName || undefined} style={{ fontFamily: FONT }}>
                        {order.customerName || "—"}
                      </EllipsisText>
                    </span>
                  </td>

                  {/* حالة الطلب */}
                  <td style={TD}><OrderStatusBadge status={order.status} /></td>

                  {/* اسم المصنع */}
                  <td style={TD}><FactoryCell name={factoryName} /></td>

                  {/* سعر التكلفة */}
                  <td style={{ ...TD, color: HX.tx2 }}>
                    {Number(compCost).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    <span style={{ fontSize: 10, marginRight: 2 }}>ج.م</span>
                  </td>

                  {/* سعر البيع */}
                  <td style={{ ...TD, fontWeight: 700 }}>
                    {order.totalPrice != null
                      ? Number(order.totalPrice).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"}
                    <span style={{ fontSize: 10, marginRight: 2 }}>ج.م</span>
                  </td>

                  {/* حالة الدفع */}
                  <td style={TD}><PaymentBadge status={order.paymentStatus} /></td>

                  {/* التوصيل بواسطة */}
                  <td style={TD}><DeliveryByBadge fromInventory={order.shippedFromInventory} /></td>

                  {/* حالة التصنيع */}
                  <td style={TD}><DeliveryStatusBadge status={order.deliveryStatus} /></td>

                  {/* تاريخ الطلب */}
                  <td style={{ ...TD, color: HX.tx3, fontSize: "11.5px" }}>{createdFmt}</td>

                  {/* تاريخ التصنيع */}
                  <td style={{ ...TD, color: HX.tx3, fontSize: "11.5px" }}>{poDateFmt}</td>

                  {/* عداد الأيام */}
                  <td style={TD}>
                    <DaysCounterBadge days={daysLabel} active={order.status === 2} />
                  </td>

                  {/* المسئول */}
                  {!isVendor && (
                    <td style={TD}>
                      {user || userName ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                          {userName ? <AvatarCircle name={userName} size={22} /> : null}
                          <EllipsisText title={userName || undefined} style={{ fontSize: 12, fontFamily: FONT }}>
                            {userName || "—"}
                          </EllipsisText>
                        </span>
                      ) : (
                        <span style={{ color: HX.tx3, fontSize: "11.5px" }}>—</span>
                      )}
                    </td>
                  )}

                  {/* النوع */}
                  {!isVendor && (
                    <td title={order.type || undefined} style={{ ...TD, color: HX.tx2 }}>{order.type || "—"}</td>
                  )}

                  {/* Actions */}
                  <td style={{ ...TD, textAlign: "center" }}>
                    <span style={{ display: "inline-flex", gap: 3, justifyContent: "center" }}>
                      <ActionBtn onClick={() => onView(order.orderId)}
                        bg={HX.accentLight} hoverBg={HX.accent} color={HX.accent}>
                        <VisibilityIcon style={{ fontSize: 11 }} />
                      </ActionBtn>
                      {!isVendor && (
                        <ActionBtn onClick={() => onEdit(order)}
                          bg={HX.blueLight} hoverBg={HX.blue} color={HX.blue}>
                          <EditIcon style={{ fontSize: 11 }} />
                        </ActionBtn>
                      )}
                      {!isVendor && (
                        <ActionBtn onClick={() => onDelete(order)}
                          bg={HX.redLight} hoverBg={HX.red} color={HX.red}>
                          <DeleteIcon style={{ fontSize: 11 }} />
                        </ActionBtn>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>

      {/* ── Pagination ── */}
      <HomixPaginationBar
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
      />
    </Box>
  );
}
