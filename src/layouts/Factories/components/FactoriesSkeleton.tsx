/**
 * هيكل تحميل صفحة الصنّاع — يحافظ على ارتفاع المؤشرات والجدول حتى لا تقفز
 * الصفحة عند وصول البيانات.
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { kpiCardSx, tableCardSx } from "../utils/styles";

const pulseSx = {
  animation: "hx-pulse 1.4s ease-in-out infinite",
  "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.45 } },
} as const;

function Bar({ w, h = 12 }: { w: string | number; h?: number }) {
  return <Box sx={{ width: w, height: h, borderRadius: "6px", bgcolor: HX.surface3, ...pulseSx }} />;
}

export default function FactoriesSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Box sx={{
        display: "grid", gap: "10px",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" },
      }}>
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} sx={kpiCardSx}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: "10px" }}>
              <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: HX.surface3, ...pulseSx }} />
              <Bar w={30} h={10} />
            </Box>
            <Box sx={{ mb: "6px" }}><Bar w={70} h={20} /></Box>
            <Bar w={110} />
          </Box>
        ))}
      </Box>

      <Box sx={tableCardSx}>
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            sx={{
              height: 48,
              display: "flex",
              alignItems: "center",
              gap: "14px",
              px: "16px",
              bgcolor: i % 2 === 0 ? HX.surface : HX.surface2,
              borderBottom: `0.5px solid ${HX.border}`,
            }}
          >
            <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: HX.surface3, ...pulseSx }} />
            <Bar w={150} />
            <Bar w={90} />
            <Bar w={120} />
            <Bar w={70} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
