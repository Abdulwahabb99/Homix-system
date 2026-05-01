import React from "react";
import { Box, Grid, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
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
───────────────────────────────────────────── */
const TH_SK = {
  bgcolor: HX.surface2,
  p: "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  whiteSpace: "nowrap" as const,
  fontFamily: "'Cairo',sans-serif",
} as const;

const TD_SK = {
  p: "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  fontFamily: "'Cairo',sans-serif",
} as const;

const COLS = [
  { label: "رقم العملية",   w: 100 },
  { label: "رقم الطلب",    w: 90  },
  { label: "كود المنتج",   w: 100 },
  { label: "اسم العميل",   w: 160 },
  { label: "حالة الطلب",   w: 120 },
  { label: "اسم المصنع",   w: 150 },
  { label: "سعر التكلفة",  w: 100 },
  { label: "سعر البيع",    w: 100 },
  { label: "حالة الدفع",   w: 130 },
  { label: "التوصيل",      w: 110 },
  { label: "الأولوية",     w: 100 },
  { label: "حالة التصنيع", w: 140 },
  { label: "تاريخ الطلب",  w: 90  },
  { label: "تاريخ التصنيع",w: 95  },
  { label: "عداد الأيام",  w: 95  },
  { label: "المسئول",      w: 130 },
  { label: "النوع",        w: 90  },
  { label: "",             w: 90  },
];

/** Widths of skeleton cells — varied for natural feel */
const WIDTHS = [55, 45, 60, 100, 72, 90, 50, 55, 80, 55, 40, 90, 55, 55, 50, 80, 45, 60];

export function OrdersHomixTableSkeleton({ rows = 10 }: { rows?: number }) {
  const totalW = 44 + COLS.reduce((s, c) => s + c.w, 0);

  return (
    <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
      {/* Card header */}
      <Box sx={{ p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
        <Skeleton variant="text" width={100} height={20} sx={pulse} />
        <Skeleton variant="text" width={60} height={16} sx={pulse} />
      </Box>

      {/* Table — same single-container approach as real table */}
      <Box sx={{ overflow: "auto", maxHeight: 560, "&::-webkit-scrollbar": { width: 4, height: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: HX.border, borderRadius: 4 } }}>
        <Table sx={{ minWidth: totalW, tableLayout: "fixed", borderCollapse: "collapse", fontFamily: "'Cairo',sans-serif" }}>
          <colgroup>
            <col style={{ width: 44 }} />
            {COLS.map((c, i) => <col key={i} style={{ width: c.w }} />)}
          </colgroup>

          <TableHead component="thead" sx={{ position: "sticky", top: 0, zIndex: 3 }}>
            <TableRow>
              {/* checkbox col */}
              <TableCell sx={{ ...TH_SK, width: 44, textAlign: "center" }}>
                <Skeleton variant="rounded" width={14} height={14} sx={{ mx: "auto", ...pulse }} />
              </TableCell>
              {COLS.map((c, i) => (
                <TableCell key={i} sx={{ ...TH_SK, width: c.w, textAlign: "right" }}>
                  <Skeleton variant="text" width={c.label.length * 7 || 20} height={14} sx={pulse} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.from({ length: rows }).map((_, ri) => (
              <TableRow key={ri} sx={{ "&:last-child td": { borderBottom: "none" } }}>
                {/* checkbox */}
                <TableCell sx={{ ...TD_SK, width: 44, textAlign: "center" }}>
                  <Skeleton variant="rounded" width={14} height={14} sx={{ mx: "auto", ...pulse }} />
                </TableCell>
                {COLS.map((c, ci) => (
                  <TableCell key={ci} sx={{ ...TD_SK, width: c.w }}>
                    {/* avatar + text for customer column */}
                    {ci === 3 ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <Skeleton variant="circular" width={26} height={26} sx={pulse} />
                        <Skeleton variant="text" width={WIDTHS[ci]} height={14} sx={pulse} />
                      </Box>
                    ) : ci === 5 ? (
                      /* factory cell — small square + text */
                      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <Skeleton variant="rounded" width={22} height={22} sx={{ borderRadius: "6px", ...pulse }} />
                        <Skeleton variant="text" width={WIDTHS[ci]} height={14} sx={pulse} />
                      </Box>
                    ) : ci === 4 || ci === 8 || ci === 11 ? (
                      /* badge columns */
                      <Skeleton variant="rounded" width={WIDTHS[ci] + 20} height={22} sx={{ borderRadius: "20px", ...pulse }} />
                    ) : ci === 17 ? (
                      /* actions */
                      <Box sx={{ display: "flex", gap: "3px", justifyContent: "center" }}>
                        {[0, 1, 2].map((j) => (
                          <Skeleton key={j} variant="rounded" width={26} height={26} sx={{ borderRadius: "7px", ...pulse }} />
                        ))}
                      </Box>
                    ) : (
                      <Skeleton variant="text" width={WIDTHS[ci]} height={14} sx={pulse} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination stub */}
      <Box sx={{
        borderTop: `0.5px solid ${HX.border}`,
        p: "10px 14px",
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
