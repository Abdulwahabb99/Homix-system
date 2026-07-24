/**
 * هيكل تحميل (skeleton) لصفحة التقارير المالية — يحاكي شريط الدورة + صف مؤشرات
 * الأداء (4 بطاقات) + جدول التسويات (ترويسة + صفوف) بنفس أبعاد الحالة الفعلية،
 * فيظهر تخطيط ثابت أثناء جلب البيانات بدل مؤشّر دوران فارغ.
 */
import React from "react";
import { Box, Skeleton } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  periodBarSx,
  kpiCardSx,
  tabsWrapSx,
  tabsHeadSx,
  tabSx,
  sellersHeaderSx,
  sellerRowSx,
} from "../utils/styles";

/** شبكة تبويب المخزن (التبويب الافتراضي): صورة + اسم + 3 أعمدة رقمية + زر التوسعة */
const GRID = "34px 1fr 120px 120px 120px 40px";
const KPI_COUNT = 4;
const ROW_COUNT = 6;

const shimmerSx = { bgcolor: HX.surface3 } as const;

/** سطر رمادي بزوايا دائرية بعرض/ارتفاع محدّدين */
function Bar({ w, h = 12 }: { w: number | string; h?: number }) {
  return <Skeleton variant="rounded" animation="wave" width={w} height={h} sx={shimmerSx} />;
}

/** شريط اختيار دورة الفوترة */
function PeriodBarSkeleton() {
  return (
    <Box sx={periodBarSx}>
      <Bar w={78} h={13} />
      <Box sx={{ display: "flex", gap: "6px" }}>
        <Skeleton variant="rounded" animation="wave" width={70} height={30} sx={{ ...shimmerSx, borderRadius: "20px" }} />
        <Skeleton variant="rounded" animation="wave" width={70} height={30} sx={{ ...shimmerSx, borderRadius: "20px" }} />
      </Box>
      <Box sx={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <Skeleton variant="rounded" animation="wave" width={230} height={28} sx={{ ...shimmerSx, borderRadius: "20px" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Skeleton variant="circular" animation="wave" width={7} height={7} sx={shimmerSx} />
          <Bar w={64} h={12} />
        </Box>
      </Box>
    </Box>
  );
}

/** بطاقة KPI واحدة */
function KpiCardSkeleton() {
  return (
    <Box sx={kpiCardSx}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
        <Skeleton variant="rounded" animation="wave" width={36} height={36} sx={{ ...shimmerSx, borderRadius: "10px" }} />
        <Bar w={54} h={10} />
      </Box>
      <Bar w={110} h={24} />
      <Box sx={{ mt: "8px" }}>
        <Bar w="72%" h={11} />
      </Box>
      <Box sx={{ mt: "10px" }}>
        <Skeleton variant="rounded" animation="wave" width={96} height={18} sx={{ ...shimmerSx, borderRadius: "20px" }} />
      </Box>
    </Box>
  );
}

/** صف واحد في جدول التسويات */
function SellerRowSkeleton() {
  return (
    <Box sx={sellerRowSx(GRID, false)}>
      <Skeleton variant="circular" animation="wave" width={34} height={34} sx={shimmerSx} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Bar w="55%" h={12} />
        <Bar w="32%" h={10} />
      </Box>
      <Bar w={72} h={13} />
      <Bar w={72} h={13} />
      <Bar w={72} h={13} />
      <Skeleton variant="rounded" animation="wave" width={26} height={26} sx={{ ...shimmerSx, borderRadius: "7px", marginInlineStart: "auto" }} />
    </Box>
  );
}

export default function FinancialReportsSkeleton() {
  return (
    <Box
      aria-busy="true"
      aria-label="جارٍ تحميل التقرير"
      sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <PeriodBarSkeleton />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4,1fr)" }, gap: "12px" }}>
        {Array.from({ length: KPI_COUNT }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </Box>

      <Box sx={tabsWrapSx}>
        <Box sx={tabsHeadSx}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} sx={{ ...tabSx(false), pointerEvents: "none" }}>
              <Bar w={96} h={13} />
            </Box>
          ))}
        </Box>

        <Box sx={sellersHeaderSx(GRID)}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Bar key={i} w={i === 1 ? 90 : 56} h={10} />
          ))}
        </Box>

        {Array.from({ length: ROW_COUNT }).map((_, i) => (
          <SellerRowSkeleton key={i} />
        ))}
      </Box>
    </Box>
  );
}
