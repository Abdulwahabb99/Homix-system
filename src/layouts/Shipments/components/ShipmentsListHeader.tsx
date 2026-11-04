import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { SHIPMENTS_SORT_OPTIONS } from "../constants";

const FONT = "'Cairo', sans-serif";

interface ShipmentsListHeaderProps {
  totalCount: number;
  isFetching?: boolean;
  sortValue: string;
  onSortChange?: (key: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
}

/** شريط رأس بطاقة القائمة — نفس شكل رأس جدول الطلبات (عنوان + عدد، ترتيب، Excel). */
export default function ShipmentsListHeader({
  totalCount,
  isFetching,
  sortValue,
  onSortChange,
  onExport,
  isExporting,
}: ShipmentsListHeaderProps) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`,
      flexWrap: "wrap", gap: 1, flexShrink: 0,
    }}>
      <Box sx={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "6px", fontFamily: FONT }}>
        <Box component="span" sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx }}>
          قائمة الشحنات
        </Box>
        {isFetching ? (
          <Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.tx2 }}>
            — جارٍ التحميل...
          </Box>
        ) : (
          <>
            <Box component="span" sx={{ fontSize: "12px", fontWeight: 500, color: HX.tx3 }}>—</Box>
            <Box component="span" sx={{ fontSize: "13.5px", fontWeight: 750, color: HX.tx, letterSpacing: "-0.02em" }}>
              {`${totalCount.toLocaleString("en-US", { maximumFractionDigits: 0 })} شحنة`}
            </Box>
          </>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <Box
          component="select"
          aria-label="ترتيب الشحنات"
          value={sortValue}
          onChange={(e) => onSortChange?.((e.target as HTMLSelectElement).value)}
          sx={{
            fontFamily: FONT,
            fontSize: "12px",
            height: 30,
            px: "10px",
            border: `0.5px solid ${HX.border}`,
            borderRadius: "8px",
            bgcolor: HX.surface,
            color: HX.tx2,
            outline: "none",
            cursor: "pointer",
            "&:focus": { borderColor: HX.accent },
          }}
        >
          {SHIPMENTS_SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </Box>

        {onExport && (
          <Box
            component="button"
            type="button"
            onClick={onExport}
            disabled={isExporting}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              height: 30,
              px: "12px",
              fontSize: "11.5px",
              fontWeight: 600,
              fontFamily: FONT,
              bgcolor: HX.surface2,
              color: HX.tx2,
              border: `0.5px solid ${HX.border}`,
              borderRadius: "8px",
              cursor: isExporting ? "default" : "pointer",
              opacity: isExporting ? 0.6 : 1,
              transition: ".15s",
              "&:hover": { borderColor: HX.accent, color: HX.accent },
            }}
          >
            {isExporting ? "جارٍ التصدير…" : "Excel"}
          </Box>
        )}
      </Box>
    </Box>
  );
}
