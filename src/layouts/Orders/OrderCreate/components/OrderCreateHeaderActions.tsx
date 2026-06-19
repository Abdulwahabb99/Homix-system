import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";

const btnBase = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  px: "16px", height: 34, borderRadius: "9px", border: "none",
  fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, whiteSpace: "nowrap",
  transition: ".15s", "& svg": { fontSize: 14 },
} as const;

export interface OrderCreateHeaderActionsProps {
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
}

/** Top-bar actions: رجوع + إنشاء الطلب. */
export default function OrderCreateHeaderActions({
  onSubmit, canSubmit, isSubmitting,
}: OrderCreateHeaderActionsProps) {
  const navigate = useNavigate();
  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => navigate("/orders")}
        sx={{ ...btnBase, border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx2, cursor: "pointer", "&:hover": { borderColor: HX.accent, color: HX.accent } }}
      >
        <ArrowBackIosNewIcon sx={{ transform: "scaleX(-1)" }} /> رجوع
      </Box>
      <Box
        component="button"
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
        sx={{
          ...btnBase,
          bgcolor: canSubmit ? HX.accent : HX.surface3,
          color: canSubmit ? "#fff" : HX.tx3,
          cursor: canSubmit && !isSubmitting ? "pointer" : "not-allowed",
          boxShadow: canSubmit ? "0 4px 12px rgba(99,102,241,0.25)" : "none",
          "&:hover": canSubmit ? { bgcolor: "#4f46e5" } : {},
        }}
      >
        {isSubmitting ? <CircularProgress size={13} sx={{ color: "#fff" }} /> : <CheckRoundedIcon />}
        إنشاء الطلب
      </Box>
    </>
  );
}
