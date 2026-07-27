/**
 * هيكل تحميل تفاصيل المصنع — يحفظ شكل الشبكة (عمودان) فلا تقفز الصفحة.
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { cardBodySx, cardHeadSx, cardSx, colStackSx, detailGridSx } from "../utils/styles";

const pulseSx = {
  animation: "hx-pulse 1.4s ease-in-out infinite",
  "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.45 } },
} as const;

function Bar({ w, h = 12 }: { w: string | number; h?: number }) {
  return <Box sx={{ width: w, height: h, borderRadius: "6px", bgcolor: HX.surface3, ...pulseSx }} />;
}

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <Box sx={cardSx}>
      <Box sx={cardHeadSx}>
        <Bar w={120} h={13} />
        <Bar w={60} h={10} />
      </Box>
      <Box sx={cardBodySx}>
        {[...Array(rows)].map((_, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "10px", py: "9px" }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: HX.surface3, ...pulseSx }} />
            <Bar w={90} h={11} />
            <Bar w="40%" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function FactoryDetailSkeleton() {
  return (
    <Box sx={detailGridSx}>
      <Box sx={colStackSx}>
        <CardSkeleton rows={3} />
        <CardSkeleton rows={2} />
      </Box>
      <Box sx={colStackSx}>
        <CardSkeleton rows={4} />
        <CardSkeleton rows={1} />
      </Box>
    </Box>
  );
}
