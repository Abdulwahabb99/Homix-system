/**
 * غلاف بطاقة قسم قابل لإعادة الاستخدام: إطار موحّد + ترويسة (أيقونة + عنوان)
 * مع منطقة إجراء اختيارية يسار الترويسة. يوحّد شكل كل بطاقات صفحة التفاصيل.
 */
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { cardSx, cardHeaderSx, cardTitleSx } from "../styles";

interface SectionCardProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  /** عنصر يُعرض في يسار الترويسة (زر/شارة/عدّاد) */
  headerRight?: React.ReactNode;
  /** أنماط إضافية لجسم البطاقة (padding مثلاً) */
  bodySx?: SxProps<Theme>;
  children: React.ReactNode;
}

export default function SectionCard({ icon, title, headerRight, bodySx, children }: SectionCardProps) {
  const hasHeader = icon || title || headerRight;
  return (
    <Box sx={cardSx}>
      {hasHeader ? (
        <Box sx={cardHeaderSx}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon}
            {title != null ? <Typography sx={cardTitleSx}>{title}</Typography> : null}
          </Stack>
          {headerRight}
        </Box>
      ) : null}
      <Box sx={bodySx}>{children}</Box>
    </Box>
  );
}
