/**
 * شارة تخصّص المصنع — خلفية ولون نص لكل تخصّص (مطابقة لـ .spec-badge).
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { SPEC_BG, SPEC_TEXT } from "../utils/constants";
import { specBadgeSx } from "../utils/styles";
import { FactorySpec } from "../utils/types";

export default function SpecBadge({ spec }: { spec: FactorySpec }) {
  return (
    <Box
      component="span"
      sx={{
        ...specBadgeSx,
        bgcolor: SPEC_BG[spec] ?? HX.accentLight,
        color: SPEC_TEXT[spec] ?? HX.accent,
      }}
    >
      {spec}
    </Box>
  );
}
