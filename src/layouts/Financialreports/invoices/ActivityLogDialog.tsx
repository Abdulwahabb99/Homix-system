/**
 * سجل النشاط (قراءة فقط) — كل تغيير حالة/تعديل على أي فاتورة مع المستخدم والتوقيت (من الـ BE، لا من المتصفح).
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useInvoiceActivity } from "query/financialInvoices";
import { FONT } from "../utils/styles";
import { ACTION_LABELS, EmptyState, ModalShell, btnGhostSx, fmtDateTime } from "./shared";

const PAGE_SIZE = 50;

const describe = (detail: Record<string, unknown>): string => {
  const parts: string[] = [];
  if (typeof detail.label === "string") parts.push(detail.label);
  if (detail.orderNumber) parts.push(`طلب #${detail.orderNumber}`);
  if (typeof detail.amount === "number") parts.push(`${detail.amount} ج.م`);
  if (typeof detail.transferAmount === "number") parts.push(`مبلغ التحويل ${detail.transferAmount} ج.م`);
  if (typeof detail.difference === "number" && detail.difference !== 0) parts.push(`الفرق ${detail.difference} ج.م`);
  if (typeof detail.bankTotal === "number") parts.push(`البنك ${detail.bankTotal} / النظام ${String(detail.systemTotal)} / الفرق ${String(detail.difference)}`);
  if (typeof detail.reason === "string" && detail.reason) parts.push(detail.reason);
  return parts.join(" — ");
};

export default function ActivityLogDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useInvoiceActivity({ page, size: PAGE_SIZE }, open);
  const rows = data?.rows ?? [];
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  return (
    <ModalShell open={open} onClose={onClose} maxWidth="sm" title="سجل النشاط">
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: FONT }}>
        {isError ? <EmptyState text="تعذّر تحميل السجل." /> : isLoading ? <EmptyState text="جارٍ التحميل..." /> : rows.length === 0 ? <EmptyState text="لسه مفيش نشاط متسجل." /> : rows.map((e) => (
          <Box key={e.id} sx={{ border: `0.5px solid ${HX.border}`, borderRadius: "10px", p: "9px 12px", fontSize: "12.5px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
              <b>{ACTION_LABELS[e.action] ?? e.action}</b>
              <span style={{ color: HX.tx3, fontSize: 11.5 }}>{fmtDateTime(e.createdAt)}</span>
            </Box>
            <Box sx={{ color: HX.tx2, mt: "2px" }}>{[e.vendorName, e.invoiceCode, describe(e.detail ?? {})].filter(Boolean).join(" — ")}</Box>
            <Box sx={{ color: HX.tx3, fontSize: "11px", mt: "2px" }}>بواسطة: {e.actorName ?? "—"}</Box>
          </Box>
        ))}
        {pages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontSize: "12px" }}>
            <Box component="button" type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} sx={btnGhostSx}>السابق</Box>
            <span>{page} / {pages}</span>
            <Box component="button" type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} sx={btnGhostSx}>التالي</Box>
          </Box>
        )}
      </Box>
    </ModalShell>
  );
}
