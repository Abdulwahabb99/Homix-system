import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";

/* ─────────────────────────────────────────────
   Shared
───────────────────────────────────────────── */
const pulse = {
  "&::after": {
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
  },
} as const;

/* ─────────────────────────────────────────────
   KPI Row Skeleton — 6 cards
───────────────────────────────────────────── */
function KpiCardSkeleton() {
  return (
    <Box sx={{
      bgcolor: HX.surface,
      borderRadius: HX.r,
      p: "12px 14px",
      border: `0.5px solid ${HX.border}`,
      height: 96,
    }}>
      {/* icon */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: "10px" }}>
        <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: "8px", ...pulse }} />
      </Box>
      {/* value */}
      <Skeleton variant="text" width={52} height={28} sx={{ mb: "4px", ...pulse }} />
      {/* label */}
      <Skeleton variant="text" width={80} height={16} sx={{ ...pulse }} />
      {/* change */}
      <Skeleton variant="text" width={100} height={14} sx={{ mt: "4px", ...pulse }} />
    </Box>
  );
}

export function OrdersHomixKpiRowSkeleton() {
  return (
    <Grid container spacing="10px">
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid item xs={6} sm={4} md={2} key={i}>
          <KpiCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

/* ─────────────────────────────────────────────
   Search Card Skeleton — 4 fields
───────────────────────────────────────────── */
export function OrdersHomixSearchCardSkeleton() {
  return (
    <Box sx={{ ...cardSx, p: "14px 18px" }}>
      {/* header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "12px" }}>
        <Skeleton variant="circular" width={14} height={14} sx={pulse} />
        <Skeleton variant="text" width={50} height={20} sx={pulse} />
      </Box>
      {/* 4 fields */}
      <Grid container spacing="10px">
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="text" width={70} height={16} sx={{ mb: "4px", ...pulse }} />
            <Skeleton variant="rounded" height={34} sx={{ borderRadius: "8px", ...pulse }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Filters Panel Skeleton — collapsed look
───────────────────────────────────────────── */
export function OrdersHomixFiltersPanelSkeleton() {
  return (
    <Box sx={{ ...cardSx }}>
      {/* header row */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        p: "12px 18px",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Skeleton variant="rounded" width={14} height={14} sx={{ ...pulse }} />
          <Skeleton variant="text" width={60} height={20} sx={pulse} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Skeleton variant="text" width={130} height={16} sx={pulse} />
          <Skeleton variant="circular" width={22} height={22} sx={pulse} />
        </Box>
      </Box>

      {/* ROW 1 — 5 selects */}
      <Box sx={{ p: "14px 18px", borderTop: `0.5px solid ${HX.border}`, borderBottom: `0.5px solid ${HX.border}` }}>
        <Skeleton variant="text" width={60} height={14} sx={{ mb: "10px", ...pulse }} />
        <Grid container spacing="10px">
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={12 / 5} key={i}>
              <Skeleton variant="text" width={70} height={14} sx={{ mb: "4px", ...pulse }} />
              <Skeleton variant="rounded" height={34} sx={{ borderRadius: "8px", ...pulse }} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ROW 2 — المسئول + dates + priority */}
      <Box sx={{ p: "14px 18px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Skeleton variant="text" width={100} height={14} sx={{ mb: "12px", ...pulse }} />
        <Grid container spacing="10px">
          {/* المسئول */}
          <Grid item xs={12} sm={6} md={2}>
            <Skeleton variant="text" width={60} height={14} sx={{ mb: "4px", ...pulse }} />
            <Skeleton variant="rounded" height={34} sx={{ borderRadius: "8px", ...pulse }} />
          </Grid>
          {/* من تاريخ */}
          <Grid item xs={12} sm={6} md={2}>
            <Skeleton variant="text" width={60} height={14} sx={{ mb: "4px", ...pulse }} />
            <Skeleton variant="rounded" height={34} sx={{ borderRadius: "8px", ...pulse }} />
          </Grid>
          {/* إلى تاريخ */}
          <Grid item xs={12} sm={6} md={2}>
            <Skeleton variant="text" width={60} height={14} sx={{ mb: "4px", ...pulse }} />
            <Skeleton variant="rounded" height={34} sx={{ borderRadius: "8px", ...pulse }} />
          </Grid>
          {/* priority pills */}
          <Grid item xs={12} sm={12} md={6}>
            <Skeleton variant="text" width={50} height={14} sx={{ mb: "4px", ...pulse }} />
            <Box sx={{ display: "flex", gap: "7px" }}>
              {["مستعجل جداً", "مستعجل", "بالمدة المحددة"].map((lbl, i) => (
                <Skeleton key={i} variant="rounded" width={90 + i * 14} height={34} sx={{ borderRadius: "8px", ...pulse }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box sx={{
        p: "11px 18px", bgcolor: HX.surface2,
        display: "flex", justifyContent: "flex-end", gap: "8px",
      }}>
        <Skeleton variant="rounded" width={90} height={34} sx={{ borderRadius: "8px", ...pulse }} />
        <Skeleton variant="rounded" width={120} height={34} sx={{ borderRadius: "8px", ...pulse }} />
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Table Skeleton — header + N skeleton rows
   Uses pure <table> just like OrdersHomixTableV2
───────────────────────────────────────────── */
const TH_SK: React.CSSProperties = {
  background:   HX.surface2,
  padding:      "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  whiteSpace:   "nowrap",
  fontFamily:   "'Cairo',sans-serif",
  textAlign:    "right",
};

const TD_SK: React.CSSProperties = {
  padding:      "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  fontFamily:   "'Cairo',sans-serif",
};

const CHECKBOX_W_SK = 44;

const COLS = [
  { label: "رقم العملية",   w: 110 },
  { label: "رقم الطلب",    w: 95  },
  { label: "كود المنتج",   w: 105 },
  { label: "اسم العميل",   w: 170 },
  { label: "حالة الطلب",   w: 120 },
  { label: "اسم المصنع",   w: 155 },
  { label: "سعر التكلفة",  w: 110 },
  { label: "سعر البيع",    w: 110 },
  { label: "حالة الدفع",   w: 130 },
  { label: "التوصيل",      w: 115 },
  { label: "الأولوية",     w: 95  },
  { label: "حالة التصنيع", w: 140 },
  { label: "تاريخ الطلب",  w: 90  },
  { label: "تاريخ التصنيع",w: 100 },
  { label: "عداد الأيام",  w: 100 },
  { label: "المسئول",      w: 140 },
  { label: "النوع",        w: 90  },
  { label: "",             w: 90  },
];

const SK_WIDTHS = [55, 45, 60, 100, 72, 90, 50, 55, 80, 55, 40, 90, 55, 55, 50, 80, 45, 60];

export function OrdersHomixTableSkeleton({ rows = 10 }: { rows?: number }) {
  const totalW = CHECKBOX_W_SK + COLS.reduce((s, c) => s + c.w, 0);

  return (
    <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
      {/* Card header */}
      <Box sx={{ p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
        <Skeleton variant="text" width={100} height={20} sx={pulse} />
        <Skeleton variant="text" width={60} height={16} sx={pulse} />
      </Box>

      {/* Same single-container, pure-HTML approach as the real table */}
      <div style={{
        overflow: "auto", maxHeight: 560, flex: 1,
        scrollbarWidth: "thin", scrollbarColor: `${HX.border} transparent`,
      }}>
        <table style={{
          tableLayout: "fixed", borderCollapse: "collapse",
          minWidth: totalW, width: "100%",
          fontFamily: "'Cairo',sans-serif",
        }}>
          <colgroup>
            <col style={{ width: CHECKBOX_W_SK }} />
            {COLS.map((c, i) => <col key={i} style={{ width: c.w }} />)}
          </colgroup>

          <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
            <tr>
              <th style={{ ...TH_SK, textAlign: "center", width: CHECKBOX_W_SK }}>
                <Skeleton variant="rounded" width={14} height={14} sx={{ mx: "auto", ...pulse }} />
              </th>
              {COLS.map((c, i) => (
                <th key={i} style={TH_SK}>
                  <Skeleton variant="text" width={c.label.length * 7 || 20} height={14} sx={pulse} />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri}>
                <td style={{ ...TD_SK, textAlign: "center" }}>
                  <Skeleton variant="rounded" width={14} height={14} sx={{ mx: "auto", ...pulse }} />
                </td>
                {COLS.map((c, ci) => (
                  <td key={ci} style={TD_SK}>
                    {ci === 3 ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <Skeleton variant="circular" width={26} height={26} sx={pulse} />
                        <Skeleton variant="text" width={SK_WIDTHS[ci]} height={14} sx={pulse} />
                      </Box>
                    ) : ci === 5 ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <Skeleton variant="rounded" width={22} height={22} sx={{ borderRadius: "6px", ...pulse }} />
                        <Skeleton variant="text" width={SK_WIDTHS[ci]} height={14} sx={pulse} />
                      </Box>
                    ) : ci === 4 || ci === 8 || ci === 11 ? (
                      <Skeleton variant="rounded" width={SK_WIDTHS[ci] + 20} height={22} sx={{ borderRadius: "20px", ...pulse }} />
                    ) : ci === 17 ? (
                      <Box sx={{ display: "flex", gap: "3px", justifyContent: "center" }}>
                        {[0, 1, 2].map((j) => (
                          <Skeleton key={j} variant="rounded" width={26} height={26} sx={{ borderRadius: "7px", ...pulse }} />
                        ))}
                      </Box>
                    ) : (
                      <Skeleton variant="text" width={SK_WIDTHS[ci]} height={14} sx={pulse} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination stub */}
      <Box sx={{
        borderTop: `0.5px solid ${HX.border}`, p: "10px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Skeleton variant="text" width={160} height={16} sx={pulse} />
        <Box sx={{ display: "flex", gap: "4px" }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width={28} height={28} sx={{ borderRadius: "7px", ...pulse }} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Convenience: full page top-section skeleton
───────────────────────────────────────────── */
export function OrdersHomixPageTopSkeleton() {
  return (
    <>
      <OrdersHomixKpiRowSkeleton />
      <OrdersHomixSearchCardSkeleton />
      <OrdersHomixFiltersPanelSkeleton />
    </>
  );
}
