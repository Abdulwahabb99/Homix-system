import React from "react";
import { Box, Grid, Skeleton, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";

const skBg = alpha("#64748b", 0.1);
const skSx = { bgcolor: skBg, transform: "none" } as const;
const skSxAccent = { bgcolor: alpha("#6366f1", 0.16), transform: "none" } as const;

/** صف البلاطات — 5 بطاقات بنفس تخطيط صفحة التذاكر */
export function TicketsKpiRowSkeleton() {
  return (
    <Grid container spacing={1.5} mb={2.5}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Grid item xs={6} sm={4} md={12 / 5} key={i}>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2.5,
              p: 1.75,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.25 }}>
              <Skeleton
                variant="rounded"
                animation="wave"
                width={34}
                height={34}
                sx={{ borderRadius: 2, ...skSxAccent }}
              />
              <Skeleton variant="rounded" animation="wave" width={36} height={14} sx={{ borderRadius: 1, ...skSx }} />
            </Box>
            <Skeleton
              variant="rounded"
              animation="wave"
              width="48%"
              height={28}
              sx={{ mb: 0.5, borderRadius: 1, ...skSx }}
            />
            <Skeleton variant="rounded" animation="wave" width="72%" height={14} sx={{ borderRadius: "4px", ...skSx }} />
            <Skeleton
              variant="rounded"
              animation="wave"
              width="88%"
              height={11}
              sx={{ mt: 0.75, borderRadius: "4px", ...skSx }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

/** شريط الفلاتر — مطابقة تقريبية للحقول الحقيقية */
export function TicketsFilterBarSkeleton() {
  const Field = ({ w }: { w: number }) => (
    <Skeleton variant="rounded" animation="wave" width={w} height={32} sx={{ borderRadius: "8px", ...skSx, flexShrink: 0 }} />
  );
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "14px",
        border: "0.5px solid rgba(0,0,0,0.09)",
        boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
        p: "10px 14px",
        mb: 2,
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Field w={160} />
      <Field w={150} />
      <Box sx={{ width: "0.5px", height: 24, bgcolor: "rgba(0,0,0,0.09)", flexShrink: 0 }} />
      <Field w={128} />
      <Field w={112} />
      <Field w={130} />
      <Box sx={{ width: "0.5px", height: 24, bgcolor: "rgba(0,0,0,0.09)", flexShrink: 0 }} />
      <Field w={138} />
      <Field w={138} />
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          flexBasis: { xs: "100%", md: "auto" },
          justifyContent: { xs: "flex-end", md: "flex-start" },
          ml: { xs: 0, md: "auto" },
        }}
      >
        <Skeleton variant="rounded" animation="wave" width={72} height={32} sx={{ borderRadius: "8px", ...skSxAccent }} />
        <Skeleton variant="rounded" animation="wave" width={96} height={32} sx={{ borderRadius: "8px", ...skSx }} />
      </Box>
    </Box>
  );
}

const TH_SK: React.CSSProperties = {
  background: HX.surface2,
  padding: "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  whiteSpace: "nowrap",
  fontFamily: "'Cairo',sans-serif",
  textAlign: "start",
  verticalAlign: "top",
};

const TD_SK: React.CSSProperties = {
  padding: "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  fontFamily: "'Cairo',sans-serif",
  verticalAlign: "top",
  textAlign: "start",
};

/** نفس أعمدة TicketsHomixTable */
const COLS = [
  { label: "رقم العملية", w: 110 },
  { label: "رقم الطلب", w: 92 },
  { label: "كود المنتج", w: 128 },
  { label: "البائع", w: 128 },
  { label: "نوع التذكرة", w: 148 },
  { label: "تاريخ الرفع", w: 98 },
  { label: "تاريخ الغلق", w: 98 },
  { label: "عداد الأيام", w: 96 },
  { label: "الحالة", w: 104 },
  { label: "المسئول", w: 132 },
  { label: "رد المسئول", w: 128 },
  { label: "رد صاحب التذكرة", w: 128 },
  { label: "ملاحظات", w: 118 },
  { label: "", w: 88 },
] as const;

const SK_W = [52, 44, 78, 88, 88, 48, 48, 36, 68, 96, 70, 70, 64, 44];

function TicketsMobileCardsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Stack spacing={1.25} sx={{ px: 1, py: 1 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box
          key={i}
          sx={{
            border: `0.5px solid ${HX.border}`,
            borderRadius: "12px",
            p: "12px 14px",
            bgcolor: HX.surface,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Skeleton variant="rounded" animation="wave" width={72} height={16} sx={{ ...skSx, borderRadius: 1 }} />
            <Skeleton variant="rounded" animation="wave" width={52} height={22} sx={{ borderRadius: "20px", ...skSx }} />
          </Box>
          <Skeleton variant="rounded" animation="wave" width="88%" height={12} sx={{ mb: 0.75, ...skSx }} />
          <Skeleton variant="rounded" animation="wave" width="65%" height={12} sx={{ ...skSx }} />
        </Box>
      ))}
    </Stack>
  );
}

export function TicketsHomixTableSkeleton({ rows = 10 }: { rows?: number }) {
  const tableWidth = COLS.reduce((s, c) => s + c.w, 0);

  return (
    <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "11px 14px",
          borderBottom: `0.5px solid ${HX.border}`,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <Skeleton variant="rounded" animation="wave" width={100} height={18} sx={{ borderRadius: "6px", ...skSx }} />
          <Skeleton variant="rounded" animation="wave" width={120} height={16} sx={{ borderRadius: "4px", ...skSx }} />
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          overflow: "auto",
          maxHeight: 560,
          flex: 1,
        }}
      >
        <TicketsMobileCardsSkeleton rows={6} />
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" }, overflow: "auto", maxHeight: 560, flex: 1 }}>
        <table
          style={{
            tableLayout: "fixed",
            borderCollapse: "collapse",
            minWidth: tableWidth,
            width: "100%",
          }}
        >
          <colgroup>
            {COLS.map((c) => (
              <col key={c.label} style={{ width: c.w }} />
            ))}
          </colgroup>
          <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
            <tr>
              {COLS.map((c, i) => (
                <th key={i} style={TH_SK}>
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={Math.min(14 + c.label.length * 7, 100)}
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
                {COLS.map((_, ci) => (
                  <td key={ci} style={TD_SK}>
                    {ci === 9 ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Skeleton variant="circular" animation="wave" width={22} height={22} sx={skSx} />
                        <Skeleton
                          variant="rounded"
                          animation="wave"
                          width={SK_W[ci] ?? 60}
                          height={13}
                          sx={{ borderRadius: "4px", ...skSx }}
                        />
                      </Box>
                    ) : ci === 4 || ci === 8 ? (
                      <Skeleton
                        variant="rounded"
                        animation="wave"
                        width={(SK_W[ci] ?? 56) + 28}
                        height={22}
                        sx={{ borderRadius: "20px", ...skSx }}
                      />
                    ) : ci === 13 ? (
                      <Box sx={{ display: "flex", gap: "3px", justifyContent: "flex-start" }}>
                        {[0, 1].map((j) => (
                          <Skeleton key={j} variant="rounded" animation="wave" width={26} height={26} sx={{ borderRadius: "7px", ...skSx }} />
                        ))}
                      </Box>
                    ) : (
                      <Skeleton
                        variant="rounded"
                        animation="wave"
                        width={SK_W[ci] ?? 50}
                        height={13}
                        sx={{ borderRadius: "4px", ...skSx }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box sx={{ borderTop: `0.5px solid ${HX.border}`, p: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Skeleton variant="rounded" animation="wave" width={180} height={15} sx={{ borderRadius: "4px", ...skSx }} />
        <Box sx={{ display: "flex", gap: "4px" }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" animation="wave" width={28} height={28} sx={{ borderRadius: "7px", ...skSx }} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
