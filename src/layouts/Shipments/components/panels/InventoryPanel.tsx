import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

export default function InventoryPanel() {
  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        border: `0.5px solid ${HX.border}`,
        py: 6,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: "13px",
        color: HX.tx3,
      }}
    >
      سيتم إضافة هذه الميزة قريباً
    </Box>
  );
}
