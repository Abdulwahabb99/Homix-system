import React from "react";
import { Box } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";

/** Centered full-height wrapper (inside the dashboard shell) for loading / error states. */
export default function CenterState({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: FONT, color: HX.tx2, gap: "10px" }}>
        {children}
      </Box>
    </DashboardLayout>
  );
}
