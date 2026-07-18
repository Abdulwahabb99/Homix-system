/**
 * هيكل تحميل (skeleton) لصفحة تفاصيل المستخدم — يطابق تخطيط الصفحة الحقيقي:
 * شبكة عمودين (مصفوفة الصلاحيات | بطاقات الحساب/الوظيفة/التحويل/سجل النشاط).
 * يعيد استخدام أنماط التخطيط نفسها لضمان تطابق الأبعاد قبل وبعد التحميل.
 */
import React from "react";
import { Box, Skeleton } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  bankHeaderSx,
  cardBodySx,
  cardHeadSx,
  cardSx,
  colSx,
  contentSx,
  gridSx,
  infoRowSx,
  permItemSx,
  permItemsSx,
  permSecHeadSx,
  permSectionSx,
  tlItemSx,
} from "../utils/styles";

const DIVIDER = `0.5px solid ${HX.border}`;

/** أعداد عناصر المجموعات (تقريبية للهيكل فقط، تطابق شكل permissionsSummary) */
const SKELETON_GROUP_SIZES = [1, 4, 3, 3, 4, 4, 2, 2, 3, 3, 2, 4];

/* ترويسة بطاقة: أيقونة + عنوان (+ عنصر يمين اختياري) */
function CardHeadSkeleton({ right, titleWidth = 110 }: { right?: React.ReactNode; titleWidth?: number }) {
  return (
    <Box sx={cardHeadSx}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Skeleton variant="rounded" width={16} height={16} />
        <Skeleton width={titleWidth} height={16} />
      </Box>
      {right}
    </Box>
  );
}

/* صف معلومات: أيقونة + عنوان + قيمة (+ زر نسخ اختياري) */
function InfoRowSkeleton({ copy = false }: { copy?: boolean }) {
  return (
    <Box sx={infoRowSx}>
      <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: "8px", flexShrink: 0 }} />
      <Skeleton width={80} height={13} sx={{ flexShrink: 0 }} />
      <Skeleton height={14} sx={{ flex: 1 }} />
      {copy && <Skeleton variant="rounded" width={24} height={24} sx={{ borderRadius: "6px", flexShrink: 0 }} />}
    </Box>
  );
}

/* بطاقة معلومات: ترويسة + عدد من الصفوف */
function InfoCardSkeleton({ rows, copyRows = 0 }: { rows: number; copyRows?: number }) {
  return (
    <Box sx={cardSx}>
      <CardHeadSkeleton />
      <Box sx={cardBodySx}>
        {Array.from({ length: rows }, (_, i) => (
          <InfoRowSkeleton key={i} copy={i >= rows - copyRows} />
        ))}
      </Box>
    </Box>
  );
}

export default function UserDetailsSkeleton() {
  return (
    <Box sx={contentSx}>
      <Box sx={gridSx}>
        {/* العمود الأيسر: مصفوفة الصلاحيات */}
        <Box sx={colSx}>
          <Box sx={cardSx}>
            <CardHeadSkeleton
              titleWidth={70}
              right={<Skeleton variant="rounded" width={92} height={22} sx={{ borderRadius: "6px" }} />}
            />
            {SKELETON_GROUP_SIZES.map((n, gi) => {
              const lastRowStart = n % 2 === 0 ? n - 2 : n - 1;
              return (
                <Box key={gi} sx={permSectionSx}>
                  <Box sx={permSecHeadSx}>
                    <Skeleton variant="rounded" width={26} height={26} sx={{ borderRadius: "7px", flexShrink: 0 }} />
                    <Skeleton width={120} height={14} sx={{ flex: 1 }} />
                    <Skeleton variant="rounded" width={34} height={18} sx={{ borderRadius: "5px" }} />
                  </Box>
                  <Box sx={permItemsSx}>
                    {Array.from({ length: n }, (_, i) => (
                      <Box
                        key={i}
                        sx={{
                          ...(permItemSx as object),
                          borderBottom: i >= lastRowStart ? "none" : DIVIDER,
                          borderInlineStart: { xs: "none", sm: i % 2 === 1 ? DIVIDER : "none" },
                        }}
                      >
                        <Skeleton variant="rounded" width={22} height={22} sx={{ borderRadius: "6px", flexShrink: 0 }} />
                        <Skeleton height={13} sx={{ flex: 1 }} />
                        <Skeleton variant="rounded" width={40} height={16} sx={{ borderRadius: "4px" }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* العمود الأيمن: الحساب + الوظيفة + التحويل + سجل النشاط */}
        <Box sx={colSx}>
          {/* بيانات الحساب */}
          <InfoCardSkeleton rows={5} />

          {/* بيانات وظيفية ومالية */}
          <InfoCardSkeleton rows={2} />

          {/* بيانات التحويل */}
          <Box sx={cardSx}>
            <CardHeadSkeleton />
            <Box sx={cardBodySx}>
              <Box sx={bankHeaderSx}>
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "8px", bgcolor: "rgba(255,255,255,.16)" }} />
                <Box>
                  <Skeleton width={70} height={16} sx={{ bgcolor: "rgba(255,255,255,.16)" }} />
                  <Skeleton width={54} height={12} sx={{ bgcolor: "rgba(255,255,255,.1)", mt: "2px" }} />
                </Box>
              </Box>
              <InfoRowSkeleton />
              <InfoRowSkeleton copy />
              <InfoRowSkeleton copy />
              <InfoRowSkeleton copy />
            </Box>
          </Box>

          {/* سجل النشاط */}
          <Box sx={cardSx}>
            <CardHeadSkeleton titleWidth={80} />
            <Box sx={cardBodySx}>
              {Array.from({ length: 4 }, (_, i) => (
                <Box key={i} sx={tlItemSx}>
                  <Skeleton variant="circular" width={28} height={28} sx={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="70%" height={14} />
                    <Skeleton width="50%" height={12} sx={{ mt: "3px" }} />
                    <Skeleton width={70} height={11} sx={{ mt: "3px" }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
