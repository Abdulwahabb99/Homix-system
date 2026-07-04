import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";

/* ─────────────────────────────────────────────
   Shared — muted blocks + wave (no broken ::after)
───────────────────────────────────────────── */
const skBg = alpha("#64748b", 0.1);

/** Use with skeleton `animation="wave"` */
const skSx = { bgcolor: skBg, transform: "none" } as const;

const skSxAccent = { bgcolor: alpha(HX.accent, 0.16), transform: "none" } as const;

/* ─────────────────────────────────────────────
   KPI Row Skeleton — 6 cards (layout ↔ real KpiCard)
───────────────────────────────────────────── */
function KpiCardSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        p: "12px 14px",
        border: `0.5px solid ${HX.border}`,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: "8px" }}>
        <Skeleton
          variant="rounded"
          animation="wave"
          width={30}
          height={30}
          sx={{ borderRadius: "8px", ...skSxAccent }}
        />
      </Box>
      <Skeleton
        variant="rounded"
        animation="wave"
        width="55%"
        height={22}
        sx={{ mb: "6px", borderRadius: "6px", ...skSx }}
      />
      <Skeleton variant="rounded" animation="wave" width="72%" height={12} sx={{ borderRadius: "4px", ...skSx }} />
      <Skeleton
        variant="rounded"
        animation="wave"
        width="88%"
        height={11}
        sx={{ mt: "7px", borderRadius: "4px", ...skSx }}
      />
    </Box>
  );
}

export function OrdersHomixKpiRowSkeleton() {
  return (
    <Grid container spacing="10px">
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid item xs={6} sm={4} md={4} lg={4} xl={2} key={i}>
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
    <Box
      sx={{
        ...cardSx,
        p: "14px 18px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "12px" }}>
        <Skeleton
          variant="rounded"
          animation="wave"
          width={14}
          height={14}
          sx={{ borderRadius: "4px", flexShrink: 0, ...skSxAccent }}
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          width={76}
          height={17}
          sx={{ borderRadius: "6px", ...skSx }}
        />
      </Box>
      <Grid container spacing="10px">
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Skeleton
                variant="rounded"
                animation="wave"
                width={`${42 + (i % 3) * 9}%`}
                height={11}
                sx={{ borderRadius: "4px", maxWidth: 120, ...skSx }}
              />
              <Skeleton
                variant="rounded"
                animation="wave"
                height={34}
                sx={{ width: "100%", borderRadius: "8px", ...skSx }}
              />
            </Box>
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
  const labelBar = (w: number) => (
    <Skeleton
      variant="rounded"
      animation="wave"
      width={w}
      height={13}
      sx={{ borderRadius: "4px", ...skSx }}
    />
  );

  const FieldOutline = () => (
    <Skeleton variant="rounded" animation="wave" height={34} sx={{ borderRadius: "8px", width: "100%", ...skSx }} />
  );

  return (
    <Box sx={{ ...cardSx, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "12px 18px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Skeleton
            variant="rounded"
            animation="wave"
            width={14}
            height={14}
            sx={{ borderRadius: "4px", ...skSxAccent }}
          />
          <Skeleton variant="rounded" animation="wave" width={68} height={18} sx={{ borderRadius: "6px", ...skSx }} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Skeleton variant="rounded" animation="wave" width={130} height={15} sx={{ borderRadius: "4px", ...skSx }} />
          <Skeleton variant="rounded" animation="wave" width={22} height={22} sx={{ borderRadius: "50%", ...skSx }} />
        </Box>
      </Box>

      <Box sx={{ p: "14px 18px", borderTop: `0.5px solid ${HX.border}`, borderBottom: `0.5px solid ${HX.border}` }}>
        <Box sx={{ mb: "10px" }}>{labelBar(72)}</Box>
        <Grid container spacing="10px">
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={12 / 5} key={i}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "5px", mb: 0 }}>
                {labelBar(64 + (i % 2) * 12)}
                <FieldOutline />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ p: "14px 18px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Box sx={{ mb: "12px" }}>{labelBar(96)}</Box>
        <Grid container spacing="10px" alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {labelBar(58)}
              <FieldOutline />
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {labelBar(120)}
              <Skeleton variant="rounded" animation="wave" height={40} sx={{ borderRadius: "8px", width: "100%", ...skSx }} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          p: "11px 18px",
          bgcolor: HX.surface2,
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
        }}
      >
        <Skeleton variant="rounded" animation="wave" width={90} height={34} sx={{ borderRadius: "8px", ...skSx }} />
        <Skeleton variant="rounded" animation="wave" width={120} height={34} sx={{ borderRadius: "8px", ...skSx }} />
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
  { label: "حالة التصنيع", w: 140 },
  { label: "تاريخ الطلب",  w: 90  },
  { label: "تاريخ التصنيع",w: 100 },
  { label: "عداد الأيام",  w: 100 },
  { label: "المسئول",      w: 140 },
  { label: "النوع",        w: 90  },
  { label: "",             w: 90  },
];

const SK_WIDTHS = [55, 45, 60, 100, 72, 90, 50, 55, 80, 55, 90, 55, 55, 50, 80, 45, 60];

export function OrdersHomixTableSkeleton({ rows = 10 }: { rows?: number }) {
  const totalW = CHECKBOX_W_SK + COLS.reduce((s, c) => s + c.w, 0);

  return (
    <Box sx={{ ...cardSx, display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
      {/* Card header */}
      <Box sx={{ p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
        <Skeleton variant="rounded" animation="wave" width={100} height={18} sx={{ borderRadius: "6px", ...skSx }} />
        <Skeleton variant="rounded" animation="wave" width={72} height={14} sx={{ borderRadius: "4px", ...skSx }} />
      </Box>

      {/* Same single-container, pure-HTML approach as the real table */}
      <div style={{
        overflow: "auto", maxHeight: 460, flex: 1,
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
                <Skeleton variant="rounded" animation="wave" width={14} height={14} sx={{ mx: "auto", ...skSx }} />
              </th>
              {COLS.map((c, i) => (
                <th key={i} style={TH_SK}>
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={Math.min(12 + c.label.length * 8, 120)}
                    height={13}
                    sx={{ borderRadius: "4px", ...skSx }}
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri}>
                <td style={{ ...TD_SK, textAlign: "center" }}>
                  <Skeleton variant="rounded" animation="wave" width={14} height={14} sx={{ mx: "auto", ...skSx }} />
                </td>
                {COLS.map((c, ci) => (
                  <td key={ci} style={TD_SK}>
                    {ci === 3 ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <Skeleton variant="circular" animation="wave" width={26} height={26} sx={skSx} />
                        <Skeleton variant="rounded" animation="wave" width={SK_WIDTHS[ci]} height={13} sx={{ borderRadius: "4px", ...skSx }} />
                      </Box>
                    ) : ci === 5 ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <Skeleton variant="rounded" animation="wave" width={22} height={22} sx={{ borderRadius: "6px", ...skSx }} />
                        <Skeleton variant="rounded" animation="wave" width={SK_WIDTHS[ci]} height={13} sx={{ borderRadius: "4px", ...skSx }} />
                      </Box>
                    ) : ci === 4 || ci === 8 || ci === 10 ? (
                      <Skeleton variant="rounded" animation="wave" width={SK_WIDTHS[ci] + 20} height={22} sx={{ borderRadius: "20px", ...skSx }} />
                    ) : ci === 16 ? (
                      <Box sx={{ display: "flex", gap: "3px", justifyContent: "center" }}>
                        {[0, 1, 2].map((j) => (
                          <Skeleton key={j} variant="rounded" animation="wave" width={26} height={26} sx={{ borderRadius: "7px", ...skSx }} />
                        ))}
                      </Box>
                    ) : (
                      <Skeleton variant="rounded" animation="wave" width={SK_WIDTHS[ci]} height={13} sx={{ borderRadius: "4px", ...skSx }} />
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
        <Skeleton variant="rounded" animation="wave" width={160} height={15} sx={{ borderRadius: "4px", ...skSx }} />
        <Box sx={{ display: "flex", gap: "4px" }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" animation="wave" width={28} height={28} sx={{ borderRadius: "7px", ...skSx }} />
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
