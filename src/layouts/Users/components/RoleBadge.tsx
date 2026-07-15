/**
 * شارة الدور (.role-bdg) — لون حسب نوع المستخدم.
 */
import React from "react";
import { Box } from "@mui/material";
import { roleBadgeSx } from "../utils/styles";
import { roleMeta } from "../utils/constants";

export default function RoleBadge({ userType }: { userType: string | number | undefined }) {
  const m = roleMeta(userType);
  return <Box component="span" sx={roleBadgeSx(m.bg, m.color)}>{m.label}</Box>;
}
