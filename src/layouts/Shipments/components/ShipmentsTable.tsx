import React from "react";
import { Box, Checkbox } from "@mui/material";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import { ShipmentStatusBadge, PaymentStatusBadge, DaysInTransitBadge } from "./ShipmentsStatusChip";
import { useInlineUpdateShipmentMutation } from "query/shipmentEdit";
import type { ShipmentsMeta } from "query/shipmentsMeta";
import {
  SHIPMENTS_LIST_PAGE_SIZE,
  type GroupedShipmentInfo,
  type ShipmentItem,
} from "query/shipmentsList";

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

/**
 * أيقونة اكتمال «التوصيل المجمع».
 *
 * الطلبات المرتبطة هي نواتج تقسيم أوردر واحد، فتتشارك رقم الأوردر. تظهر الأيقونة
 * خضراء حين تكون كلها وصلت المخزن، وكهرمانية مع العدّاد حين ما زال بعضها ناقصاً.
 * الحساب تلقائي من حالات الطلبات — لا يُضبط يدوياً.
 */
function GroupedShipmentIcon({ grouped, onClick }: { grouped: GroupedShipmentInfo | null; onClick?: () => void }) {
  if (!grouped || grouped.relatedCount <= 1) {
    return null;
  }

  const { complete, inWarehouseCount, relatedCount } = grouped;
  const title = complete
    ? `اكتمل بالمخزن — كل الطلبات المرتبطة (${relatedCount}) وصلت`
    : `لم يكتمل بالمخزن — ${inWarehouseCount} من ${relatedCount} وصلت`;

  return (
    <Tooltip title={title} arrow>
      <Box
        component={onClick ? "button" : "span"}
        type={onClick ? "button" : undefined}
        aria-label={title}
        onClick={onClick ? (e: React.MouseEvent) => { e.stopPropagation(); onClick(); } : undefined}
        sx={{
          border: "none", cursor: onClick ? "pointer" : "default",
          display: "inline-flex", alignItems: "center", gap: "2px",
          px: "5px", py: "1px", borderRadius: "5px",
          fontFamily: FONT, fontSize: "10px", fontWeight: 700,
          bgcolor: complete ? "#dcfce7" : "#fef3c7",
          color: complete ? "#15803d" : "#b45309",
        }}
      >
        {complete
          ? <Inventory2OutlinedIcon sx={{ fontSize: 12 }} />
          : <PendingActionsOutlinedIcon sx={{ fontSize: 12 }} />}
        {inWarehouseCount}/{relatedCount}
      </Box>
    </Tooltip>
  );
}

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

const INLINE_CTRL: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "11.5px",
  color: HX.tx,
  background: HX.surface2,
  border: `0.5px solid ${HX.border}`,
  borderRadius: 7,
  padding: "5px 7px",
};

/** ألوان حالة الجدولة حسب نص الحالة (المعرّفات ديناميكية من الـ meta). */
function schedStateStyle(label: string): React.CSSProperties {
  const l = label || "";
  let bg: string = HX.surface2, color: string = HX.tx2, border: string = HX.border;
  if (/ملغي/.test(l)) { bg = HX.redLight; color = HX.red; border = "rgba(239,68,68,.3)"; }
  else if (/مؤجل/.test(l)) { bg = HX.amberLight; color = "#92400e"; border = "rgba(245,158,11,.3)"; }
  else if (/لا يوجد رد/.test(l)) { bg = "rgba(249,115,22,.1)"; color = "#c2410c"; border = "rgba(249,115,22,.3)"; }
  else if (/الإتصال|الاتصال/.test(l)) { bg = "rgba(59,130,246,.1)"; color = "#2563eb"; border = "rgba(59,130,246,.3)"; }
  else if (/استلم/.test(l)) { bg = "rgba(100,116,139,.12)"; color = "#475569"; border = "rgba(100,116,139,.3)"; }
  else if (/مجدول/.test(l)) { bg = HX.greenLight; color = HX.green; border = "rgba(16,185,129,.3)"; }
  return {
    fontFamily: FONT, fontSize: "11px", fontWeight: 700, borderRadius: 20,
    padding: "4px 10px", border: `0.5px solid ${border}`, background: bg, color,
    cursor: "pointer", maxWidth: 185,
  };
}

/** حالات لا يقبل الخادم إعادة تخصيصها: مسلّمة/ملغية/مرفوضة (4-6 و13-21). */
const REASSIGN_CLOSED_STATUSES = new Set([4, 5, 6, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
const canReassign = (s: ShipmentItem) =>
  s.reassignedToOperationNumber == null && !REASSIGN_CLOSED_STATUSES.has(Number(s.shipmentStatus));

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
  onView: (shipment: ShipmentItem) => void;
  onDelete: (shipment: ShipmentItem) => void;
  onReassign?: (shipment: ShipmentItem) => void;
  onTrack?: (shipment: ShipmentItem) => void;
  /** فتح نافذة أصناف الشحنة المجمّعة */
  onGroupedClick?: (shipment: ShipmentItem) => void;
  selectionModel?: number[];
  onToggleSelect?: (id: number) => void;
  onToggleAll?: () => void;
  meta?: ShipmentsMeta;
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
  onView,
  onDelete,
  onReassign,
  onTrack,
  onGroupedClick,
  selectionModel = [],
  onToggleSelect,
  onToggleAll,
  meta,
}: ShipmentsTableProps) {
  const inlineMut = useInlineUpdateShipmentMutation();
  const carriers = meta?.shippingCompanies ?? [];
  const schedStatuses = meta?.scheduleStatuses ?? [];
  const canEditInline = !isVendor;
  const save = (id: number, body: Parameters<typeof inlineMut.mutate>[0]["body"]) =>
    inlineMut.mutate({ id, body });
  const onSchedDateChange = (s: ShipmentItem, v: string) => {
    const body: Parameters<typeof inlineMut.mutate>[0]["body"] = { scheduledDeliveryDate: v || null };
    // كما في التصميم: تحديد موعد بدون حالة يضبط الحالة «مجدول» إن وُجدت.
    if (v && s.scheduleStatus == null) {
      const sched = schedStatuses.find((o) => /^مجدول/.test(o.label));
      if (sched) body.scheduleStatus = Number(sched.value);
    }
    save(s.id, body);
  };
  const canSelect = !isVendor && Boolean(onToggleSelect) && Boolean(onToggleAll);
  const isAllSelected = canSelect && shipments.length > 0 && shipments.every((s) => selectionModel.includes(s.id));
  const isIndeterminate = canSelect && !isAllSelected && shipments.some((s) => selectionModel.includes(s.id));

  // هيكل تحميل عند أي جلب (تحميل أول أو إعادة جلب بعد تغيير فلتر/صفحة)
  if (isLoading || (isFetching && !inlineMut.isPending)) {
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
              {canSelect && (
                <th style={{ ...TH, textAlign: "center", width: 36 }}>
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={() => onToggleAll?.()}
                  />
                </th>
              )}
              <th style={TH}>رقم العملية</th>
              <th style={TH}>رقم الشحنة</th>
              <th style={TH}>كود المنتج</th>
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
              <th style={TH}>موعد الجدولة</th>
              <th style={TH}>حالة الجدولة</th>
              <th style={TH}>تاريخ التوصيل</th>
              <th style={{ ...TH, textAlign: "center" }}>الأيام</th>
              {!isVendor && <th style={{ ...TH, textAlign: "center" }}>إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, idx) => {
              const rowBg = selectionModel.includes(s.id)
                ? HX.accentLight
                : s.reassignedToOperationNumber != null ? HX.amberLight : idx % 2 === 0 ? HX.surface : HX.surface2;
              return (
              <tr
                key={s.id}
                style={{ background: rowBg, transition: "background .1s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = HX.accentLight; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg; }}
              >
                {canSelect && (
                  <td style={{ ...TD, textAlign: "center" }}>
                    <Checkbox
                      size="small"
                      checked={selectionModel.includes(s.id)}
                      onChange={() => onToggleSelect?.(s.id)}
                    />
                  </td>
                )}

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
                    onClick={() => onView(s)}
                    sx={{
                      border: "none", background: "none", p: 0, cursor: "pointer",
                      fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: HX.accent,
                      display: "inline-flex", alignItems: "center", gap: "3px",
                      textDecoration: "none", minHeight: 44,
                      "&:hover": { textDecoration: "underline" },
                      "&:focus-visible": { outline: `2px solid ${HX.accent}`, outlineOffset: 2 },
                    }}
                  >
                    {s.shipmentNumber || s.orderNumber || "—"}
                  </Box>
                </td>

                {/* كود المنتج */}
                <td style={TD} title={s.productSku || undefined}>
                  <Box
                    component="span"
                    sx={{
                      fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3,
                      px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2,
                    }}
                  >
                    {s.productSku || "—"}
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
                  <ShipmentStatusBadge status={s.shipmentStatus} label={s.shipmentStatusLabel} />
                  {s.reassignedToOperationNumber != null && (
                    <Box sx={{ mt: "3px", fontSize: "10.5px", fontWeight: 700, color: "#92400e", fontFamily: FONT }}>
                      نُقل إلى عملية #{s.reassignedToOperationNumber || "—"}
                    </Box>
                  )}
                </td>

                {/* نوع الشحنة — ومعها أيقونة اكتمال المجموعة للتوصيل المجمع */}
                <td style={TD}>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>
                      {s.shipmentTypeLabel || "—"}
                    </Box>
                    <GroupedShipmentIcon grouped={s.groupedShipment} onClick={onGroupedClick ? () => onGroupedClick(s) : undefined} />
                  </Box>
                </td>

                {/* حالة الدفع */}
                <td style={TD}>
                  {s.paymentStatus != null
                    ? <PaymentStatusBadge status={s.paymentStatus} label={s.paymentStatusLabel} />
                    : <span style={{ color: HX.tx3 }}>—</span>
                  }
                </td>

                {/* التوصيل بواسطة — شركة الشحن الفعلية، وليس هوميكس/البائع */}
                <td style={TD}>
                  {canEditInline ? (
                    <select
                      aria-label="التوصيل بواسطة"
                      style={{ ...INLINE_CTRL, width: 150 }}
                      value={s.shippingCompany != null ? String(s.shippingCompany) : ""}
                      disabled={inlineMut.isPending}
                      onChange={(e) => save(s.id, { shippingCompany: e.target.value === "" ? null : Number(e.target.value) })}
                    >
                      <option value="">— اختر —</option>
                      {s.shippingCompany != null && !carriers.some((c) => String(c.value) === String(s.shippingCompany)) && (
                        <option value={String(s.shippingCompany)}>{s.shippingCompanyName}</option>
                      )}
                      {carriers.map((c) => <option key={c.value} value={String(c.value)}>{c.label}</option>)}
                    </select>
                  ) : (
                    <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                      {s.shippingCompanyName || "—"}
                    </Box>
                  )}
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

                {/* موعد الجدولة */}
                <td style={TD}>
                  {canEditInline ? (
                    <input
                      type="date"
                      aria-label="موعد الجدولة"
                      style={{ ...INLINE_CTRL, width: 120 }}
                      value={s.scheduledDeliveryDate ? moment(s.scheduledDeliveryDate).format("YYYY-MM-DD") : ""}
                      disabled={inlineMut.isPending}
                      onChange={(e) => onSchedDateChange(s, e.target.value)}
                    />
                  ) : (
                    <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>
                      {fmtDate(s.scheduledDeliveryDate)}
                    </Box>
                  )}
                </td>

                {/* حالة الجدولة */}
                <td style={TD}>
                  {canEditInline ? (
                    <select
                      aria-label="حالة الجدولة"
                      style={schedStateStyle(s.scheduleStatusLabel)}
                      value={s.scheduleStatus != null ? String(s.scheduleStatus) : ""}
                      disabled={inlineMut.isPending}
                      onChange={(e) => save(s.id, { scheduleStatus: e.target.value === "" ? null : Number(e.target.value) })}
                    >
                      <option value="">— غير محدد —</option>
                      {schedStatuses.map((o) => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                    </select>
                  ) : (
                    <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                      {s.scheduleStatusLabel || "—"}
                    </Box>
                  )}
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
                      {onTrack && <ActionBtn
                        onClick={(e) => { e.stopPropagation(); onTrack(s); }}
                        bg={HX.accentLight} hoverBg={HX.accent} color={HX.accent} title="تتبع الشحنة"
                      ><LocalShippingOutlinedIcon sx={{ fontSize: 16 }} /></ActionBtn>}
                      {onReassign && canReassign(s) && <ActionBtn
                        onClick={(e) => { e.stopPropagation(); onReassign(s); }}
                        bg={HX.amberLight} hoverBg={HX.amber} color={HX.amber} title="إعادة تخصيص"
                      ><SwapHorizOutlinedIcon sx={{ fontSize: 16 }} /></ActionBtn>}
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
            );})}
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
