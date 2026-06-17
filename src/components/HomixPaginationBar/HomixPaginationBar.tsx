import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [];
  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  pages.push(1);
  if (left > 2)           pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1)  pages.push("…");
  pages.push(total);

  return pages;
}

export interface HomixPaginationBarProps {
  /** 0-indexed current page */
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  /** receives 0-indexed new page */
  onPageChange: (page: number) => void;
  /** label used in "عرض X–Y من Z {itemLabel}" — defaults to "سجل" */
  itemLabel?: string;
}

export default function HomixPaginationBar({
  page,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  itemLabel = "سجل",
}: HomixPaginationBarProps) {
  const current = page + 1; // 1-indexed for display
  const from    = totalCount === 0 ? 0 : page * pageSize + 1;
  const to      = Math.min(current * pageSize, totalCount);
  const pages   = getPageNumbers(current, totalPages);
  const rafRef  = useRef<number | null>(null);

  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = prev; };
  }, []);

  const handlePageChange = (p: number) => {
    const savedY = window.scrollY;
    onPageChange(p);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        window.scrollTo({ top: savedY, behavior: "instant" as ScrollBehavior });
      });
    });
  };

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 30,
    height: 30,
    borderRadius: 8,
    border: `0.5px solid ${HX.border}`,
    background: HX.surface,
    fontFamily: FONT,
    fontSize: "12.5px",
    fontWeight: 600,
    cursor: "pointer",
    color: HX.tx2,
    padding: "0 7px",
    userSelect: "none" as const,
    transition: "background .13s, color .13s, border-color .13s",
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: HX.accent,
    color: "#fff",
    borderColor: HX.accent,
    fontWeight: 700,
  };

  const btnDisabled: React.CSSProperties = {
    ...btnBase,
    opacity: 0.35,
    cursor: "default",
  };

  return (
    <Box
      sx={{
        borderTop: `0.5px solid ${HX.border}`,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "14px",
        py: "10px",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {/* count label */}
      <Box sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx2, order: 0 }}>
        {totalCount === 0
          ? "لا توجد نتائج"
          : `عرض ${from}–${to} من ${totalCount.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${itemLabel}`}
      </Box>

      {/* page buttons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "5px", order: 1, flexWrap: "wrap" }}>
        <button
          style={current <= 1 ? btnDisabled : btnBase}
          disabled={current <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              style={{ ...btnBase, border: "none", background: "transparent", cursor: "default", color: HX.tx3 }}
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              style={p === current ? btnActive : btnBase}
              onClick={() => p !== current && handlePageChange((p as number) - 1)}
            >
              {p}
            </button>
          )
        )}

        <button
          style={current >= totalPages ? btnDisabled : btnBase}
          disabled={current >= totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          ›
        </button>
      </Box>
    </Box>
  );
}
