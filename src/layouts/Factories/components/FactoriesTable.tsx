/**
 * بطاقة جدول الصنّاع: ترويسة (عدّاد + تصدير Excel) + جدول قابل للتمرير أفقياً
 * برأس ملتصق + ترقيم أسفل.
 */
import React from "react";
import { Box } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { fmt } from "../utils/calc";
import { FACTORY_COLUMNS, TABLE_MIN_WIDTH } from "../utils/constants";
import {
  emptyStateSx, ghostBtnSx, tableCardSx, tableHeadBarSx, TH, FONT,
} from "../utils/styles";
import { Factory } from "../utils/types";
import FactoriesPagination from "./FactoriesPagination";
import FactoryTableRow from "./FactoryTableRow";

export interface FactoriesTableProps {
  items: Factory[];
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  sortKey: "name" | "spec" | null;
  sortDir: "asc" | "desc";
  onSort: (key: "name" | "spec") => void;
  onView: (f: Factory) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onExport: () => void;
}

/** سهم الترتيب — محايد إذا العمود غير مُرتَّب حالياً */
function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  const sx = { fontSize: 11, marginInlineStart: "3px", verticalAlign: "middle" } as const;
  if (!active) return <UnfoldMoreIcon sx={{ ...sx, opacity: 0.4 }} />;
  return dir === "asc"
    ? <ArrowUpwardIcon sx={{ ...sx, color: HX.accent }} />
    : <ArrowDownwardIcon sx={{ ...sx, color: HX.accent }} />;
}

export default function FactoriesTable({
  items, totalCount, page, totalPages, onPageChange,
  sortKey, sortDir, onSort, onView, onEdit, onDelete, onExport,
}: FactoriesTableProps) {
  return (
    <Box sx={tableCardSx}>
      <Box sx={tableHeadBarSx}>
        <Box>
          <Box sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>
            قائمة الصنّاع
          </Box>
          <Box sx={{ fontSize: "11px", color: HX.tx3, mt: "1px", fontFamily: FONT }}>
            {fmt(totalCount)} صانع
          </Box>
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onExport}
          sx={{ ...ghostBtnSx, height: 30, fontSize: "11.5px" }}
        >
          <FileDownloadOutlinedIcon /> Excel
        </Box>
      </Box>

      {items.length === 0 ? (
        <Box sx={emptyStateSx}>لا توجد مصانع مطابقة للفلاتر</Box>
      ) : (
        <>
          <Box sx={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: TABLE_MIN_WIDTH,
                borderCollapse: "collapse",
                direction: "rtl",
              }}
            >
              <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr>
                  {FACTORY_COLUMNS.map((c) => {
                    const sortable = Boolean(c.sortKey);
                    return (
                      <th
                        key={c.key}
                        onClick={sortable ? () => onSort(c.sortKey!) : undefined}
                        style={{
                          ...TH,
                          ...(c.center ? { textAlign: "center" as const } : null),
                          cursor: sortable ? "pointer" : "default",
                        }}
                      >
                        {c.label}
                        {sortable ? (
                          <SortIcon active={sortKey === c.sortKey} dir={sortDir} />
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <FactoryTableRow
                    key={f.id}
                    factory={f}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </Box>

          <FactoriesPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={onPageChange}
          />
        </>
      )}
    </Box>
  );
}
