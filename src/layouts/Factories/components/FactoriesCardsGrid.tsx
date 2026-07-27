/**
 * شبكة بطاقات الصنّاع (3 أعمدة على الشاشات الكبيرة) + ترقيم أسفلها ليطابق
 * سلوك عرض الجدول.
 */
import React from "react";
import { Box } from "@mui/material";
import { cardsGridSx, emptyStateSx, tableCardSx } from "../utils/styles";
import { FactoryListItem } from "../utils/types";
import FactoriesPagination from "./FactoriesPagination";
import FactoryCard from "./FactoryCard";

export interface FactoriesCardsGridProps {
  items: FactoryListItem[];
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onView: (f: FactoryListItem) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isFetching?: boolean;
}

export default function FactoriesCardsGrid({
  items, totalCount, page, totalPages, onPageChange, onView, onEdit, onDelete, isFetching,
}: FactoriesCardsGridProps) {
  if (items.length === 0) {
    return (
      <Box sx={tableCardSx}>
        <Box sx={emptyStateSx}>لا توجد مصانع مطابقة للفلاتر</Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: "flex", flexDirection: "column", gap: "14px",
      opacity: isFetching ? 0.6 : 1, transition: "opacity .2s",
    }}>
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
