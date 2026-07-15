/**
 * مسار تنقّل الشريط العلوي: «المستخدمون / {اسم المستخدم}».
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { breadcrumbCurSx, breadcrumbLinkSx, breadcrumbSx } from "../utils/styles";
import { PARENT_LABEL } from "../utils/constants";

interface UserDetailBreadcrumbProps {
  current: string;
  onParentClick: () => void;
}

export default function UserDetailBreadcrumb({ current, onParentClick }: UserDetailBreadcrumbProps) {
  return (
    <Box sx={breadcrumbSx}>
      <Box component="a" onClick={onParentClick} sx={breadcrumbLinkSx}>{PARENT_LABEL}</Box>
      <Box component="span" sx={{ color: HX.tx3 }}>/</Box>
      <Box component="span" sx={breadcrumbCurSx}>{current}</Box>
    </Box>
  );
}
