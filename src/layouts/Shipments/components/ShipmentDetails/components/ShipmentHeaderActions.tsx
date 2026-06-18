import React from "react";
import { Box } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import TimelineIcon from "@mui/icons-material/Timeline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";

const btnBase = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  px: "15px", height: 34, borderRadius: "9px", cursor: "pointer",
  fontFamily: FONT, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
  transition: ".15s", "& svg": { fontSize: 15 },
} as const;

/** Top-bar action buttons: تصدير PDF / إعادة جدولة / تتبع الشحنة. */
export default function ShipmentHeaderActions() {
  return (
    <>
      <Box component="button" type="button" onClick={() => window.print()} sx={{
        ...btnBase, border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx2,
        "&:hover": { borderColor: HX.accent, color: HX.accent },
      }}>
        <PictureAsPdfOutlinedIcon /> تصدير PDF
      </Box>
      <Box component="button" type="button" sx={{
        ...btnBase, border: "0.5px solid rgba(245,158,11,0.25)", bgcolor: HX.amberLight, color: "#92400e",
        "&:hover": { bgcolor: HX.amber, color: "#fff" },
      }}>
        <EventRepeatOutlinedIcon /> إعادة جدولة
      </Box>
      <Box component="button" type="button" sx={{
        ...btnBase, border: "none", bgcolor: HX.accent, color: "#fff",
        "&:hover": { bgcolor: "#4f46e5" },
      }}>
        <TimelineIcon /> تتبع الشحنة
      </Box>
    </>
  );
}
