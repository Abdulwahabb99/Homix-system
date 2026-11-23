/**
 * «أخطاء وتصحيحات» — مراجعة تلقائية لبيانات الفواتير المحفوظة مع زر تصحيح لكل مشكلة.
 * التصحيح يعيد استخدام نفس إجراءات الفاتورة (شيل البند / تحديث المسودة / فتح الفاتورة)؛
 * الفواتير غير المعلّقة تعرض «رجوع لمعلّقة أولًا».
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useLineAction, useRefreshDraft, useVendorOptions } from "query/financialInvoices";
import { useInvoiceIssues, type InvoiceIssue, type IssueOccurrence } from "query/financialInvoiceIssues";
import { arNum } from "../utils/format";
import { currentMonthCairo } from "../utils/cycle";
import { FONT } from "../utils/styles";
import { ISSUES_EMPTY_TEXT, SEVERITY_LABEL, fixesFor } from "../utils/invoiceIssues";
import { EmptyState, btnDangerSx, btnGhostSx, cardBoxSx, inputSx, tdSx, thSx } from "./shared";
import { VendorSelect } from "./FilterFields";

const severityPillSx = (severity: InvoiceIssue["severity"]) => ({
  px: "10px", py: "2px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, fontFamily: FONT,
  color: severity === "error" ? HX.red : "#b45309", bgcolor: severity === "error" ? HX.redLight : HX.amberLight,
});

function OccurrenceFixes({ issue, occurrence, onOpenInvoice }: { issue: InvoiceIssue; occurrence: IssueOccurrence; onOpenInvoice: (id: number) => void }) {
  const lineAction = useLineAction();
  const refresh = useRefreshDraft();
  const busy = lineAction.isPending || refresh.isPending;
  const fixes = fixesFor(issue, occurrence);
  return (
    <Box sx={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", py: "2px" }}>
      <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>
        {occurrence.invoiceCode ?? `#${occurrence.invoiceId}`}{issue.occurrences.length > 1 ? ` — ${occurrence.vendorName}` : ""}
      </Box>
      {fixes.map((fix) => {
        if (fix.kind === "locked") return <Box key="locked" component="span" sx={{ fontSize: "11.5px", color: HX.tx3, fontWeight: 700 }}>{fix.label}</Box>;
        if (fix.kind === "open") {
          return <Box key="open" component="button" type="button" sx={btnGhostSx} onClick={() => onOpenInvoice(occurrence.invoiceId)}>{fix.label}</Box>;
        }
        if (fix.kind === "remove") {
          return (
            <Box key="remove" component="button" type="button" disabled={busy} sx={btnDangerSx}
              onClick={() => {
                if (occurrence.lineId === null || !window.confirm("شيل البند ده من الفاتورة؟ (البند بيتعلّم محذوف ومش هيترجع للدورات)")) return;
                lineAction.mutate({ id: occurrence.invoiceId, lineId: occurrence.lineId, action: "delete", reason: `تصحيح: ${issue.typeLabel}` });
              }}>{fix.label}</Box>
          );
        }
        return (
          <Box key="refresh" component="button" type="button" disabled={busy} sx={btnGhostSx} onClick={() => refresh.mutate(occurrence.invoiceId)}>{fix.label}</Box>
        );
      })}
    </Box>
  );
}

export default function InvoiceIssuesView({ onOpenInvoice }: { onOpenInvoice: (id: number) => void }) {
  const [month, setMonth] = useState(currentMonthCairo());
  const [billingDay, setBillingDay] = useState<"" | "13" | "28">("");
  const [vendorId, setVendorId] = useState("");
  const vendors = useVendorOptions(true);
  const { data, isLoading, isError, isFetching } = useInvoiceIssues({
    billingDay: billingDay ? (Number(billingDay) as 13 | 28) : undefined,
    month: month || undefined,
    vendorId: vendorId ? Number(vendorId) : undefined,
  });
  const issues = data?.issues ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", p: "12px 16px", bgcolor: HX.surface, border: `1px solid ${HX.border}`, borderRadius: "12px" }}>
        <Box component="label" htmlFor="issues-month" sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx }}>الشهر</Box>
        <Box component="input" id="issues-month" type="month" value={month} sx={inputSx}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMonth(event.target.value)} />
        <Box component="select" aria-label="يوم الفوترة" value={billingDay} sx={inputSx}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setBillingDay(event.target.value as "" | "13" | "28")}>
          <option value="">كل الدورات</option>
          <option value="13">دورة 13</option>
          <option value="28">دورة 28</option>
        </Box>
        <VendorSelect value={vendorId} onChange={setVendorId} options={vendors.data ?? []} />
        {month && <Box component="button" type="button" sx={btnGhostSx} onClick={() => setMonth("")}>كل الشهور</Box>}
        {data && (
          <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
            {arNum(data.counts.errors)} خطأ • {arNum(data.counts.warnings)} تحذير • اتفحصت {arNum(data.scopedInvoices)} فاتورة{isFetching ? " …" : ""}
          </Box>
        )}
      </Box>

      {data?.truncated && (
        <Box sx={{ fontSize: "12px", color: HX.red, px: "4px" }}>الفحص اقتصر على أحدث الفواتير بسبب الحجم — اختار شهر أو صانع لفحص كامل.</Box>
      )}

      <Box sx={cardBoxSx}>
        {isLoading ? (
          <EmptyState text="جارٍ الفحص…" />
        ) : isError ? (
          <Box sx={{ py: 5, textAlign: "center", color: HX.red, fontSize: 13, fontFamily: FONT }}>تعذّر تحميل الأخطاء — حاول مرة أخرى.</Box>
        ) : issues.length === 0 ? (
          <EmptyState text={ISSUES_EMPTY_TEXT} />
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT }}>
              <thead>
                <tr>
                  {["الخطورة", "النوع", "رقم العملية", "رقم الطلب", "الصانع", "التفاصيل", "التصحيح"].map((label) => (
                    <Box component="th" key={label} sx={thSx}>{label}</Box>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <Box component="td" sx={tdSx}><Box component="span" sx={severityPillSx(issue.severity)}>{SEVERITY_LABEL[issue.severity]}</Box></Box>
                    <Box component="td" sx={tdSx}>{issue.typeLabel}</Box>
                    <Box component="td" sx={tdSx}>{issue.operationNumber || "—"}</Box>
                    <Box component="td" sx={tdSx}>{issue.orderNumber || "—"}</Box>
                    <Box component="td" sx={tdSx}>{issue.vendorName || "—"}</Box>
                    <Box component="td" sx={{ ...tdSx, whiteSpace: "normal", minWidth: 220 }}>{issue.details}</Box>
                    <Box component="td" sx={{ ...tdSx, whiteSpace: "normal" }}>
                      {issue.occurrences.map((occurrence) => (
                        <OccurrenceFixes key={`${occurrence.invoiceId}:${occurrence.lineId ?? "inv"}`} issue={issue} occurrence={occurrence} onOpenInvoice={onOpenInvoice} />
                      ))}
                    </Box>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
