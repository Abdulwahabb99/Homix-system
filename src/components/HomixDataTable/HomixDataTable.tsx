import React from "react";
import { Box } from "@mui/material";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

export interface HomixColumn<T> {
  key: string;
  header: string;
  align?: "right" | "center" | "left";
  width?: number | string;
  minWidth?: number | string;
  render?: (row: T) => React.ReactNode;
}

export interface HomixDataTableProps<T> {
  columns: HomixColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyLabel?: string;
  /** min table width to enable horizontal scroll on small screens */
  rowMinWidth?: number;
  skeletonRows?: number;
}

const thBase: React.CSSProperties = {
  fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: HX.tx2,
  padding: "11px 14px", whiteSpace: "nowrap",
  borderBottom: `1px solid ${HX.border}`, background: HX.surface2,
};

const tdBase: React.CSSProperties = {
  fontFamily: FONT, fontSize: "12.5px", color: HX.tx,
  padding: "11px 14px", whiteSpace: "nowrap",
  borderBottom: `0.5px solid ${HX.border}`, verticalAlign: "middle",
};

/** Presentational, HX-styled table for client-side lists (zebra + hover + skeleton + empty). */
export default function HomixDataTable<T>({
  columns, rows, getRowKey, isLoading, emptyLabel = "لا توجد بيانات", rowMinWidth = 720, skeletonRows = 6,
}: HomixDataTableProps<T>) {
  return (
    <Box sx={{ ...cardSx }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: rowMinWidth, borderCollapse: "collapse", direction: "rtl" }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ ...thBase, textAlign: c.align ?? "right", width: c.width, minWidth: c.minWidth }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(skeletonRows)].map((_, r) => (
                  <tr key={r} style={{ background: r % 2 === 0 ? HX.surface : HX.surface2 }}>
                    {columns.map((c) => (
                      <td key={c.key} style={tdBase}>
                        <Box sx={{
                          height: 14, borderRadius: "5px", bgcolor: HX.surface3,
                          animation: "hx-pulse 1.4s ease-in-out infinite",
                          "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.45 } },
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row, idx) => (
                  <tr
                    key={getRowKey(row)}
                    style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = HX.accentLight; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? HX.surface : HX.surface2; }}
                  >
                    {columns.map((c) => (
                      <td key={c.key} style={{ ...tdBase, textAlign: c.align ?? "right" }}>
                        {c.render ? c.render(row) : (row as any)[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </Box>

      {!isLoading && rows.length === 0 && (
        <Box sx={{ py: 6, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3 }}>
          {emptyLabel}
        </Box>
      )}
    </Box>
  );
}
