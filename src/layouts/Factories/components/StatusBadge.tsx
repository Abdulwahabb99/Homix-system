/**
 * شارة حالة المصنع (أونلاين / أوفلاين) — نقطة ملوّنة + نص، مطابقة لـ .bdg.
 */
import React from "react";
import { Box } from "@mui/material";
import { STATUS_LABELS } from "../utils/constants";
import { statusBadgeSx } from "../utils/styles";
import { FactoryStatus } from "../utils/types";

export default function StatusBadge({
  status,
  small,
}: {
  status: FactoryStatus;
  /** حجم أصغر داخل بطاقات العرض */
  small?: boolean;
}) {
  const online = status === 1;
  return (
    <Box
      component="span"
      sx={{ ...statusBadgeSx(online), ...(small ? { fontSize: "10px" } : null) }}
    >
      {STATUS_LABELS[status] ?? "—"}
    </Box>
  );
}
