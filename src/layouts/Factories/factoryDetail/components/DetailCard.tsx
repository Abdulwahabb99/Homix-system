/**
 * هيكل بطاقة تفاصيل — ترويسة (أيقونة + عنوان + عنصر جانبي) + جسم.
 * مطابق لـ .card / .ch / .cb في التصميم.
 */
import React from "react";
import { Box } from "@mui/material";
import { cardBodySx, cardHeadSx, cardSx, cardTitleSx } from "../utils/styles";

export interface DetailCardProps {
  icon: React.ReactNode;
  title: string;
  /** عنصر في الطرف المقابل للعنوان (عدّاد، رابط، شارة…) */
  action?: React.ReactNode;
  /** يُلغي حشوة الجسم — للجداول والشبكات الممتدّة لحدود البطاقة */
  noPadding?: boolean;
  children: React.ReactNode;
}

export default function DetailCard({ icon, title, action, noPadding, children }: DetailCardProps) {
  return (
    <Box sx={cardSx}>
      <Box sx={cardHeadSx}>
        <Box sx={cardTitleSx}>
          {icon}
          {title}
        </Box>
        {action}
      </Box>
      <Box sx={noPadding ? undefined : cardBodySx}>{children}</Box>
    </Box>
  );
}
