import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";

const linkSx = { cursor: "pointer", color: HX.tx2, "&:hover": { color: HX.accent } } as const;
const sepSx = { color: HX.tx3 } as const;

/** Top-bar breadcrumb: 🏠 / الطلبات / إضافة طلب جديد. */
export default function OrderCreateBreadcrumb() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: FONT, fontSize: "12.5px", color: HX.tx3, flexWrap: "wrap" }}>
      <Box component="span" onClick={() => navigate("/")} sx={{ display: "flex", ...linkSx }}>
        <HomeRoundedIcon sx={{ fontSize: 16 }} />
      </Box>
      <Box component="span" sx={sepSx}>/</Box>
      <Box component="span" onClick={() => navigate("/orders")} sx={linkSx}>الطلبات</Box>
      <Box component="span" sx={sepSx}>/</Box>
      <Box component="span" sx={{ color: HX.tx, fontWeight: 800 }}>إضافة طلب جديد</Box>
    </Box>
  );
}
