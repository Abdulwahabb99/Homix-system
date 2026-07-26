/**
 * شبكة بطاقات الصنّاع (3 أعمدة على الشاشات الكبيرة) + ترقيم أسفلها ليطابق
 * سلوك عرض الجدول.
 */
import React from "react";
import { Box } from "@mui/material";
import { cardsGridSx, emptyStateSx, tableCardSx } from "../utils/styles";
import { Factory } from "../utils/types";
import FactoriesPagination from "./FactoriesPagination";
import FactoryCard from "./FactoryCard";

export interface FactoriesCardsGridProps {
  items: Factory[];
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onView: (f: Factory) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function FactoriesCardsGrid({
  items, totalCount, page, totalPages, onPageChange, onView, onEdit, onDelete,
}: FactoriesCardsGridProps) {
  if (items.length === 0) {
    return (
      <Box sx={tableCardSx}>
        <Box sx={emptyStateSx}>لا توجد مصانع مطابقة للفلاتر</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Box sx={cardsGridSx}>
        {items.map((f) => (
          <FactoryCard
            key={f.id}
            factory={f}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Box>

      <Box sx={tableCardSx}>
        <FactoriesPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      </Box>
    </Box>
  );
}
