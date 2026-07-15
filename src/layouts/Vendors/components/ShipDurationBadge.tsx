/**
 * شارة مدة الشحن — سريع/متوسط/بطيء حسب عدد الأيام. «—» عند غياب القيمة.
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { shipBadgeSx, FONT } from "../utils/styles";
import { SHIP_FAST_MAX, SHIP_MID_MAX } from "../utils/constants";

export default function ShipDurationBadge({ days }: { days: number | string | undefined }) {
  const d = Number(days);
  if (!Number.isFinite(d) || d <= 0) {
    return <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px", fontFamily: FONT }}>—</Box>;
  }
  if (d <= SHIP_FAST_MAX) return <Box component="span" sx={shipBadgeSx("fast")}>⚡ {d} يوم</Box>;
  if (d <= SHIP_MID_MAX) return <Box component="span" sx={shipBadgeSx("mid")}>📦 {d} أيام</Box>;
  return <Box component="span" sx={shipBadgeSx("slow")}>⏳ {d} أيام</Box>;
}
