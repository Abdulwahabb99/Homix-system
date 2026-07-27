/**
 * شارة حالة المصنع — النص من `statusLabel` كما يرده الـ API، والرقم يحدّد اللون.
 */
import React from "react";
import { Box } from "@mui/material";
import { STATUS_ONLINE } from "../utils/constants";
import { statusBadgeSx } from "../utils/styles";

export default function StatusBadge({
  status,
  label,
  small,
}: {
  status: number | null | undefined;
  label?: string;
  /** حجم أصغر داخل بطاقات العرض */
  small?: boolean;
}) {
  const text = (label ?? "").trim();
  if (!text && status == null) return <>—</>;
  return (
    <Box
      component="span"
      sx={{ ...statusBadgeSx(status === STATUS_ONLINE), ...(small ? { fontSize: "10px" } : null) }}
    >
      {text || "—"}
    </Box>
  );
}
