import React from "react";
import { Box } from "@mui/material";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import moment from "moment";
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

/** لون التذهيب لصف «أُعيد تخصيصه» (gold-light في التصميم) */
const GOLD_LIGHT = "rgba(201,169,110,0.1)";

/** .tbl th */
const TH: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "10.5px",
  fontWeight: 700,
  color: HX.tx3,
  letterSpacing: ".3px",
  padding: "11px 12px",
  textAlign: "right",
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${HX.border2}`,
  background: HX.surface2,
};

/** .tbl td (الخلفية والفاصل السفلي يُضبطان من الصف) */
const TD: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "12px",
  color: HX.tx,
  padding: "11px 12px",
  textAlign: "right",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
};

const DASH = <span style={{ color: HX.tx3 }}>—</span>;

/** .chk — صندوق اختيار أصلي 15px بلون التمييز */
const CHK: React.CSSProperties = { width: 15, height: 15, accentColor: HX.accent, cursor: "pointer", margin: 0 };

function HeaderCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate, checked]);
  return <input ref={ref} type="checkbox" aria-label="تحديد الكل" style={CHK} checked={checked} onChange={onChange} />;
}

/**
 * شارة اكتمال «التوصيل المجمع» (.wh-badge) تحت رقم الشحنة.
 *
 * الطلبات المرتبطة هي نواتج تقسيم أوردر واحد، فتتشارك رقم الأوردر. تظهر الشارة
 * خضراء حين تكون كلها وصلت المخزن، وكهرمانية حين ما زال بعضها ناقصاً، ومحايدة إن لم
 * يصل أي صنف. الحساب تلقائي من حالات الطلبات — لا يُضبط يدوياً. الضغط يفتح نافذة الأصناف.
 */
function GroupedWarehouseBadge({ grouped, onClick }: { grouped: GroupedShipmentInfo | null; onClick?: () => void }) {
  if (!grouped || grouped.relatedCount <= 1) {
    return null;
  }

  const { complete, inWarehouseCount, relatedCount } = grouped;
  const none = !complete && inWarehouseCount === 0;
  const text = complete
    ? `✓ كل الأصناف في المخزن (${relatedCount}/${relatedCount})`
    : none
      ? `لسه ولا صنف في المخزن (0/${relatedCount})`
      : `${inWarehouseCount} من ${relatedCount} أصناف في المخزن`;
  const tone = complete
    ? { bg: HX.greenLight, color: HX.green, border: "rgba(16,185,129,.3)" }
    : none
      ? { bg: HX.surface2, color: HX.tx3, border: HX.border }
      : { bg: HX.amberLight, color: "#92400e", border: "rgba(245,158,11,.3)" };

  return (
    <Box
      component="button"
      type="button"
      title="اعرض أصناف الشحنة"
      aria-label={text}
      onClick={onClick ? (e: React.MouseEvent) => { e.stopPropagation(); onClick(); } : undefined}
      sx={{
        display: "flex", alignItems: "center", gap: "4px", width: "fit-content", mt: "4px",
        fontFamily: FONT, fontSize: "10px", fontWeight: 700, p: "2px 8px", borderRadius: "20px",
        border: `0.5px solid ${tone.border}`, bgcolor: tone.bg, color: tone.color,
        cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap",
        "&:hover": { filter: "brightness(.96)" },
      }}
    >
      <span>📦</span>
      {text}
    </Box>
  );
}

/** .icon-sm-btn — زر أيقونة 28px بحدود 0.5px (variant: عادي / خطر / إعادة تخصيص) */
function ActionBtn({
  onClick,
  variant = "default",
  title,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  variant?: "default" | "danger" | "realloc";
  title?: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = React.useState(false);
  const tone =
    variant === "danger"
      ? { color: HX.red, border: "rgba(239,68,68,.25)", hoverBg: HX.redLight, hoverColor: HX.red, hoverBorder: "rgba(239,68,68,.25)" }
      : variant === "realloc"
        ? { color: "#8a6d3b", border: "rgba(201,169,110,.35)", hoverBg: GOLD_LIGHT, hoverColor: "#8a6d3b", hoverBorder: "rgba(201,169,110,.35)" }
        : { color: HX.tx2, border: HX.border, hoverBg: HX.surface2, hoverColor: HX.accent, hoverBorder: HX.accent };
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        border: `0.5px solid ${hover ? tone.hoverBorder : tone.border}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: hover ? tone.hoverBg : HX.surface2,
        color: hover ? tone.hoverColor : tone.color,
        transition: ".15s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/** أيقونات feather المستخدمة في التصميم (13px، stroke 2) */
function FeatherIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} stroke="currentColor" fill="none" strokeWidth={2} aria-hidden="true">
      {children}
    </svg>
  );
}
const TruckIcon = () => (
  <FeatherIcon>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </FeatherIcon>
);
const TrashIcon = () => (
  <FeatherIcon>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </FeatherIcon>
);
const EditSquareIcon = () => (
  <FeatherIcon>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
  </FeatherIcon>
);
const RepeatIcon = () => (
  <FeatherIcon>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </FeatherIcon>
);

/** .sched-input / .carrier-select (العرض يُحدَّد عند الاستخدام) */
const INLINE_CTRL: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "11.5px",
  color: HX.tx,
  background: HX.surface2,
  border: `0.5px solid ${HX.border}`,
  borderRadius: 7,
  padding: "5px 7px",
};

/** ألوان حالة الجدولة حسب نص الحالة (المعرّفات ديناميكية من الـ meta) — .sched-state */
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

/** التاريخ كما في التصميم: YYYY-MM-DD بأرقام لاتينية أو «—» رمادية */
function fmtDate(d: string | null | undefined): React.ReactNode {
  if (!d) return DASH;
  return moment(d).format("YYYY-MM-DD");
}

/** مبلغ بأرقام عربية-هندية وفواصل عربية + «ج.م» (لهذا الجدول فقط)؛ الصفر يُعرض 0 كالتصميم */
function fmtMoney(n: number): string {
  const v = Number(n);
  return `${v > 0 ? v.toLocaleString("ar-EG", { maximumFractionDigits: 0 }) : "0"} ج.م`;
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
              height: 58,
              bgcolor: HX.surface,
              borderBottom: `0.5px solid ${HX.border}`,
              opacity: i % 2 === 0 ? 0.7 : 0.45,
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
        <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl", fontSize: 12, minWidth: 2000 }}>
          <thead>
            <tr>
              {canSelect && (
                <th style={{ ...TH, width: 36 }}>
                  <HeaderCheckbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={() => onToggleAll?.()}
                  />
                </th>
              )}
              <th style={TH}>رقم العملية</th>
              <th style={TH}>رقم الشحنة</th>
              <th style={TH}>اسم العميل</th>
              <th style={TH}>البائع</th>
              <th style={TH}>المحافظة</th>
              <th style={TH}>حالة الشحنة</th>
              <th style={TH}>نوع الشحنة</th>
              <th style={TH}>حالة الدفع</th>
              <th style={TH}>التوصيل بواسطة</th>
              <th style={TH}>المبلغ المطلوب</th>
              <th style={TH}>تكلفة الشحن</th>
              <th style={TH}>تاريخ الاستلام</th>
              <th style={TH}>موعد الجدولة</th>
              <th style={TH}>حالة الجدولة</th>
              <th style={TH}>تاريخ التوصيل</th>
              <th style={TH}>الأيام</th>
              {!isVendor && <th style={TH}>إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => {
              const selected = selectionModel.includes(s.id);
              const reassigned = s.reassignedToOperationNumber != null;
              // الأولوية كما في CSS التصميم: الإعادة تخصيص/التحديد تبقى عند المرور، والمرور وحده surface2.
              const baseBg = selected ? HX.accentLight : reassigned ? GOLD_LIGHT : "transparent";
              return (
              <Box
                component="tr"
                key={s.id}
                sx={{
                  "& > td": { background: baseBg, borderBottom: `0.5px solid ${HX.border}` },
                  "&:hover > td": { background: selected || reassigned ? baseBg : HX.surface2 },
                  "&:last-of-type > td": { borderBottom: "none" },
                }}
              >
                {canSelect && (
                  <td style={TD}>
                    <input
                      type="checkbox"
                      aria-label="تحديد الشحنة"
                      style={CHK}
                      checked={selected}
                      onChange={() => onToggleSelect?.(s.id)}
                    />
                  </td>
                )}

                {/* رقم العملية — .op-id */}
                <td style={{ ...TD, color: HX.accent, fontWeight: 700 }}>
                  {s.operationNumber || "—"}
                </td>

                {/* رقم الشحنة — .ship-no + شارة المخزن للمجمّعة */}
                <td style={TD}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onView(s)}
                    sx={{
                      border: "none", background: "none", p: 0, cursor: "pointer",
                      fontFamily: FONT, fontSize: "11.5px", fontWeight: 600, color: HX.accent,
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      "&:hover": { textDecoration: "underline" },
                      "&:focus-visible": { outline: `2px solid ${HX.accent}`, outlineOffset: 2 },
                    }}
                  >
                    <span>{s.shipmentNumber || s.orderNumber || "—"}</span>
                    <span aria-hidden="true">🔗</span>
                  </Box>
                  <GroupedWarehouseBadge
                    grouped={s.groupedShipment}
                    onClick={onGroupedClick ? () => onGroupedClick(s) : undefined}
                  />
                </td>

                {/* اسم العميل + الهاتف */}
                <td style={TD}>
                  <div style={{ fontWeight: 700 }}>{s.customerName || "—"}</div>
                  {s.customerPhone ? (
                    <div style={{ fontSize: "10.5px", color: HX.tx3, direction: "ltr", textAlign: "right" }}>
                      {s.customerPhone}
                    </div>
                  ) : null}
                </td>

                {/* البائع */}
                <td style={{ ...TD, color: HX.accent }}>{s.sellerName || "—"}</td>

                {/* المحافظة */}
                <td style={TD}>{s.governorate || DASH}</td>

                {/* حالة الشحنة */}
                <td style={TD}>
                  <ShipmentStatusBadge status={s.shipmentStatus} label={s.shipmentStatusLabel} />
                  {reassigned && (
                    <Box sx={{ mt: "3px", fontSize: "10.5px", fontWeight: 700, color: "#92400e", fontFamily: FONT }}>
                      نُقل إلى عملية #{s.reassignedToOperationNumber || "—"}
                    </Box>
                  )}
                </td>

                {/* نوع الشحنة */}
                <td style={{ ...TD, color: HX.tx2 }}>{s.shipmentTypeLabel || "—"}</td>

                {/* حالة الدفع */}
                <td style={TD}>
                  {s.paymentStatus != null
                    ? <PaymentStatusBadge status={s.paymentStatus} label={s.paymentStatusLabel} />
                    : DASH
                  }
                </td>

                {/* التوصيل بواسطة — شركة الشحن الفعلية، وليس هوميكس/البائع */}
                <td style={TD}>
                  {canEditInline ? (
                    <select
                      aria-label="التوصيل بواسطة"
                      style={{ ...INLINE_CTRL, width: 150, appearance: "auto" }}
                      value={s.shippingCompany != null ? String(s.shippingCompany) : ""}
                      disabled={inlineMut.isPending}
                      onChange={(e) => save(s.id, { shippingCompany: e.target.value === "" ? null : Number(e.target.value) })}
                    >
                      <option value="">— اختر مندوب —</option>
                      {s.shippingCompany != null && !carriers.some((c) => String(c.value) === String(s.shippingCompany)) && (
                        <option value={String(s.shippingCompany)}>{s.shippingCompanyName}</option>
                      )}
                      {carriers.map((c) => <option key={c.value} value={String(c.value)}>{c.label}</option>)}
                    </select>
                  ) : (
                    s.shippingCompanyName || DASH
                  )}
                </td>

                {/* المبلغ المطلوب */}
                <td style={{ ...TD, fontWeight: 800 }}>
                  {s.amountToCollect != null ? fmtMoney(s.amountToCollect) : DASH}
                </td>

                {/* تكلفة الشحن */}
                <td style={{ ...TD, color: HX.tx2 }}>
                  {s.shippingCost != null ? fmtMoney(s.shippingCost) : DASH}
                </td>

                {/* تاريخ الاستلام */}
                <td style={TD}>{fmtDate(s.receivedInWarehouseDate)}</td>

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
                    fmtDate(s.scheduledDeliveryDate)
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
                    s.scheduleStatusLabel || DASH
                  )}
                </td>

                {/* تاريخ التوصيل */}
                <td style={TD}>{fmtDate(s.deliveryDate)}</td>

                {/* الأيام */}
                <td style={TD}>
                  <DaysInTransitBadge days={s.daysCounter ?? null} />
                </td>

                {/* إجراءات — الترتيب كما في التصميم: تتبع، حذف، تعديل، إعادة تخصيص */}
                {!isVendor && (
                  <td style={TD}>
                    <Box sx={{ display: "flex", gap: "5px" }}>
                      {onTrack && <ActionBtn
                        onClick={(e) => { e.stopPropagation(); onTrack(s); }}
                        title="تتبع الشحنة"
                      ><TruckIcon /></ActionBtn>}
                      <ActionBtn
                        onClick={(e) => { e.stopPropagation(); onDelete(s); }}
                        variant="danger" title="حذف"
                      ><TrashIcon /></ActionBtn>
                      <ActionBtn
                        onClick={(e) => { e.stopPropagation(); onEdit(s); }}
                        title="تعديل"
                      ><EditSquareIcon /></ActionBtn>
                      {onReassign && canReassign(s) && <ActionBtn
                        onClick={(e) => { e.stopPropagation(); onReassign(s); }}
                        variant="realloc" title="إعادة تخصيص"
                      ><RepeatIcon /></ActionBtn>}
                    </Box>
                  </td>
                )}
              </Box>
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
