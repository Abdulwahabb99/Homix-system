/**
 * غلاف بطاقة موحّد (.card + .ch): أيقونة عنوان + عنوان + عنصر يمين اختياري (شارة/عدّاد).
 */
import React from "react";
import { Box } from "@mui/material";
import { cardBodySx, cardHeadSx, cardSx, cardTitleSx } from "../utils/styles";

interface DetailCardProps {
  title: string;
  icon: React.ReactNode;
  /** عنصر يظهر يمين الترويسة (شارة/عدّاد) */
  headerRight?: React.ReactNode;
  /** استخدام محتوى بلا padding افتراضي (للمصفوفات) */
  flush?: boolean;
  children: React.ReactNode;
}

export default function DetailCard({ title, icon, headerRight, flush, children }: DetailCardProps) {
  return (
    <Box sx={cardSx}>
      <Box sx={cardHeadSx}>
        <Box sx={cardTitleSx}>
          {icon}
          {title}
        </Box>
        {headerRight}
      </Box>
      {flush ? children : <Box sx={cardBodySx}>{children}</Box>}
    </Box>
  );
}
