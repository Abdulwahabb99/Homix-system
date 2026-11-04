/**
 * التقارير المالية — تسويات الصناع (دورة الفوترة).
 * الصفحة رفيعة: تُنسّق الحالة (يوم الفوترة/التبويب) وتوزّع بيانات الـ BE على
 * المكوّنات المقسّمة عبر `useFinancialSettlements` (GET /orders/financialReport).
 */
import React, { useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import moment from "moment-timezone";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { exportFinancialReport, type FinancialDateRange } from "query/financialReport";
import { useGenerateInvoices } from "query/financialInvoices";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { usePermissions } from "shared/permissions";

import { useFinancialSettlements } from "./hooks/useFinancialSettlements";
import { PAGE_TITLE, PAGE_SUBTITLE, DEFAULT_BILLING_DAY, DEFAULT_TAB } from "./utils/constants";
import { tabsWrapSx, FONT } from "./utils/styles";
import { BillingDay, SettlementTabKey } from "./utils/types";

import FinancialPeriodBar from "./components/FinancialPeriodBar";
import FinancialKpiRow from "./components/FinancialKpiRow";
import FinancialReportsSkeleton from "./components/FinancialReportsSkeleton";
import FinancialTabs from "./components/FinancialTabs";
import WarehouseTab from "./components/tabs/WarehouseTab";
import SellerTab from "./components/tabs/SellerTab";
import ComprehensiveTab from "./components/tabs/ComprehensiveTab";
import InvoicesArchive from "./invoices/InvoicesArchive";
import InvoicedOrdersView from "./invoices/InvoicedOrdersView";
import InvoiceDetailDialog from "./invoices/InvoiceDetailDialog";
import ManualAdjustmentDialog from "./invoices/ManualAdjustmentDialog";
import ActivityLogDialog from "./invoices/ActivityLogDialog";
import ReconciliationDialog from "./invoices/ReconciliationDialog";
import { cairoDay, inputSx } from "./invoices/shared";

type PageView = "current" | "archive" | "invoiced";

const ghostBtnSx = {
  display: "inline-flex", alignItems: "center", gap: "6px", height: 34, px: "14px",
  bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, borderRadius: "9px",
  fontSize: "12px", fontWeight: 600, fontFamily: FONT, color: HX.tx2, cursor: "pointer",
  transition: ".15s", "&:hover": { borderColor: HX.accent, color: HX.accent }, "& svg": { fontSize: 15 },
} as const;

const primaryBtnSx = {
  display: "inline-flex", alignItems: "center", gap: "6px", height: 34, px: "16px",
  bgcolor: HX.accent, color: "#fff", border: "none", borderRadius: "9px",
  fontSize: "12.5px", fontWeight: 700, fontFamily: FONT, cursor: "pointer",
  transition: ".15s", "&:hover": { bgcolor: "#5254e0" }, "& svg": { fontSize: 15 },
} as const;

const stateBoxSx = {
  display: "flex", alignItems: "center", justifyContent: "center",
  gap: "10px", p: "48px 18px", fontSize: "13px", fontFamily: FONT, color: HX.tx2,
} as const;

export default function Financialreports() {
  const [billingDay, setBillingDay] = useState<BillingDay>(DEFAULT_BILLING_DAY);
  const [tab, setTab] = useState<SettlementTabKey>(DEFAULT_TAB);
  const [view, setView] = useState<PageView>("current");
  /** شهر دورة سابقة للتقرير الحي ("" = الدورة الأحدث) */
  const [pastMonth, setPastMonth] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [rangeDraft, setRangeDraft] = useState<FinancialDateRange>({ startDate: "", endDate: "" });
  const [range, setRange] = useState<FinancialDateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [openInvoiceId, setOpenInvoiceId] = useState<number | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [reconOpen, setReconOpen] = useState(false);
  const { canExport, can } = usePermissions();
  const authUser = useSelector((state: any) => state.auth?.user);
  const isVendor = authUser?.userType === "2";
  /** الإجراءات الكتابية للمالية فقط — البائع قراءة فقط حتى لو وصلته الصلاحية */
  const canSettle = can("finance_settle") && !isVendor;
  const generate = useGenerateInvoices();

  const referenceDate = pastMonth ? `${pastMonth}-${billingDay}` : undefined;
  const { sections, kpis, cycle, isLoading, isError } = useFinancialSettlements(billingDay, referenceDate, range);

  const activeSellers = sections[tab];
  const counts: Record<SettlementTabKey, number> = {
    warehouse: sections.warehouse.length,
    seller: sections.seller.length,
    comprehensive: sections.comprehensive.length,
  };

  /** تصدير Excel — نفس معاملات التقرير المعروض (دورة الفوترة الحالية) */
  const handleExportExcel = () => {
    if (isExporting) return;
    setIsExporting(true);
    exportFinancialReport(billingDay, undefined, referenceDate, range)
      .catch(() => NotificationMeassage("error", "حدث خطأ أثناء التصدير"))
      .finally(() => setIsExporting(false));
  };

  /** تصدير PDF = حفظ الصفحة كـ PDF من مربع طباعة المتصفح (لا يوجد PDF من الخادم) */
  const handlePrintPage = () => window.print();

  const cycleClosed = Boolean(cycle?.endDate && new Date(cycle.endDate).getTime() < Date.now());
  const canGenerate = canSettle && !range && cycle?.mode === "billingCycle" && cycleClosed;
  const handleGenerate = () => {
    if (!cycle?.endDate || generate.isPending) return;
    if (!window.confirm("إصدار فواتير هذه الدورة كمسودّات لكل الصنّاع؟ (العملية آمنة للتكرار ولن تكرّر طلبًا مفوترًا)")) return;
    generate.mutate({ billingDay, referenceDate: cairoDay(cycle.endDate) }, {
      onSuccess: (res) => {
        const created = res.invoices.filter((i) => i.created).length;
        const added = res.invoices.reduce((total, i) => total + i.added, 0);
        NotificationMeassage("success", `تم إصدار ${created} فاتورة جديدة (${added} طلب) — راجعها من الأرشيف`);
        setView("archive");
      },
    });
  };

  const actions = (
    <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      {canSettle && (
        <Box component="button" type="button" onClick={() => setActivityOpen(true)} sx={ghostBtnSx}>سجل النشاط</Box>
      )}
      {canSettle && (
        <Box component="button" type="button" onClick={() => setReconOpen(true)} sx={ghostBtnSx}>تسوية الحساب</Box>
      )}
      {canExport("finance") && view === "current" && (
        <Box component="button" type="button" onClick={handlePrintPage} sx={ghostBtnSx}>
          <FileDownloadOutlinedIcon /> تصدير PDF
        </Box>
      )}
      {canExport("finance") && view === "current" && (
        <Box
          component="button"
          type="button"
          onClick={handleExportExcel}
          disabled={isExporting}
          sx={{ ...ghostBtnSx, opacity: isExporting ? 0.6 : 1 }}
        >
          {isExporting ? (
            <CircularProgress size={13} sx={{ color: HX.tx2 }} />
          ) : (
            <FileDownloadOutlinedIcon />
          )}
          تصدير Excel
        </Box>
      )}
      {canGenerate && (
        <Box component="button" type="button" onClick={handleGenerate} disabled={generate.isPending} sx={{ ...ghostBtnSx, opacity: generate.isPending ? 0.6 : 1 }}>
          إصدار فواتير الدورة
        </Box>
      )}
      {canSettle && (
        <Box component="button" type="button" onClick={() => setManualOpen(true)} sx={primaryBtnSx}>
          <AddIcon /> فاتورة يدوية
        </Box>
      )}
    </Box>
  );

  let tabContent: React.ReactNode;
  if (isError) {
    tabContent = <Box sx={{ ...stateBoxSx, color: HX.red }}>تعذّر تحميل التقرير — حاول مرة أخرى.</Box>;
  } else if (activeSellers.length === 0) {
    tabContent = <Box sx={stateBoxSx}>لا توجد بيانات لهذه الدورة.</Box>;
  } else if (tab === "warehouse") {
    tabContent = <WarehouseTab sellers={activeSellers} billingDay={billingDay} cycle={cycle} referenceDate={referenceDate} range={range} />;
  } else if (tab === "seller") {
    tabContent = <SellerTab sellers={activeSellers} billingDay={billingDay} cycle={cycle} referenceDate={referenceDate} range={range} />;
  } else {
    tabContent = <ComprehensiveTab sellers={activeSellers} billingDay={billingDay} cycle={cycle} referenceDate={referenceDate} range={range} />;
  }

  const viewTabs = [
    { key: "current", label: "الفواتير الجارية", count: view === "current" && !isLoading ? counts.comprehensive : null },
    { key: "archive", label: "الأرشيف", count: null },
    { key: "invoiced", label: "الطلبات المفوترة", count: null },
  ] as const;

  const periodControls = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", p: "12px 16px", bgcolor: HX.surface, border: `1px solid ${HX.border}`, borderRadius: "12px" }}>
      <Box component="label" htmlFor="financial-past-month" sx={{ color: HX.tx, fontSize: "13px", fontWeight: 700 }}>دورة سابقة</Box>
      <Box component="input" id="financial-past-month" type="month" value={pastMonth}
        max={moment().tz("Africa/Cairo").format("YYYY-MM")}
        disabled={Boolean(range)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPastMonth(event.target.value)}
        sx={{ ...inputSx, minHeight: 36 }} />
      {pastMonth && !range && (
        <Box component="button" type="button" onClick={() => setPastMonth("")} sx={ghostBtnSx}>الدورة الأحدث</Box>
      )}
      <Box component="button" type="button" onClick={() => setCustomOpen((v) => !v)} sx={ghostBtnSx}>
        {range ? "فترة مخصصة (مفعّلة)" : "فترة مخصصة"}
      </Box>
      {customOpen && (
        <>
          <Box component="input" type="date" aria-label="من تاريخ" value={rangeDraft.startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRangeDraft((d) => ({ ...d, startDate: e.target.value }))} sx={inputSx} />
          <Box component="input" type="date" aria-label="إلى تاريخ" value={rangeDraft.endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRangeDraft((d) => ({ ...d, endDate: e.target.value }))} sx={inputSx} />
          <Box component="button" type="button" sx={primaryBtnSx}
            onClick={() => {
              if (!rangeDraft.startDate || !rangeDraft.endDate || rangeDraft.startDate > rangeDraft.endDate) {
                NotificationMeassage("error", "اختر تاريخ بداية قبل أو يساوي تاريخ النهاية");
                return;
              }
              setRange({ ...rangeDraft });
            }}>تطبيق</Box>
          {range && (
            <Box component="button" type="button" sx={ghostBtnSx} onClick={() => { setRange(undefined); setCustomOpen(false); }}>إلغاء الفترة</Box>
          )}
        </>
      )}
      <Box component="span" sx={{ color: HX.tx2, fontSize: "12px" }}>
        {range ? "الفترة المخصصة للعرض والتصدير فقط (على تاريخ التسليم) — لا تُصدر فواتير منها."
          : "اختر شهرًا ويوم 13 أو 28 لعرض دورة سابقة، أو حدّد فترة مخصصة."}
      </Box>
    </Box>
  );

  return (
    <DashboardLayout pageTitle={PAGE_TITLE} pageSubtitle={PAGE_SUBTITLE} pageActions={actions}>
      <ToastContainer />

      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "16px", fontFamily: FONT }}>
        <Box role="tablist" aria-label="عرض الفواتير" sx={{ display: "flex", alignSelf: "flex-start", gap: "6px", p: "4px", bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, borderRadius: "12px", flexWrap: "wrap" }}>
          {viewTabs.map((item) => {
            const active = view === item.key;
            return (
              <Box key={item.key} component="button" type="button" role="tab" aria-selected={active}
                onClick={() => setView(item.key)}
                sx={{ display: "flex", alignItems: "center", gap: "8px", px: "18px", py: "8px", border: "none", borderRadius: "9px", bgcolor: active ? HX.surface : "transparent", color: active ? HX.accent : HX.tx2, boxShadow: active ? "0 1px 3px rgba(0,0,0,.08)" : "none", fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, cursor: "pointer", transition: ".15s", "&:hover": { color: active ? HX.accent : HX.tx }, "&:focus-visible": { outline: `2px solid ${HX.accent}`, outlineOffset: 2 } }}>
                {item.label}
                {item.count !== null && (
                  <Box component="span" sx={{ bgcolor: active ? HX.accent : HX.border2, color: active ? "#fff" : HX.tx2, fontSize: "10px", px: "7px", py: "1px", borderRadius: "8px", fontWeight: 700 }}>{item.count}</Box>
                )}
              </Box>
            );
          })}
        </Box>

        {view === "archive" && (
          <InvoicesArchive isVendor={isVendor} canSettle={canSettle} onOpen={setOpenInvoiceId} />
        )}
        {view === "invoiced" && <InvoicedOrdersView onOpenInvoice={setOpenInvoiceId} />}

        {view === "current" && (
          <>
            {periodControls}
            {isLoading ? (
              <FinancialReportsSkeleton />
            ) : (
              <>
                <FinancialPeriodBar billingDay={billingDay} onChange={setBillingDay} cycle={cycle} />
                <FinancialKpiRow kpis={kpis} archive={Boolean(pastMonth) || Boolean(range)} />

                <Box sx={tabsWrapSx}>
                  <FinancialTabs active={tab} onChange={setTab} counts={counts} />
                  {tabContent}
                </Box>
              </>
            )}
          </>
        )}
      </Box>

      <InvoiceDetailDialog invoiceId={openInvoiceId} isVendor={isVendor} canSettle={canSettle} onClose={() => setOpenInvoiceId(null)} />
      {canSettle && <ManualAdjustmentDialog open={manualOpen} onClose={() => setManualOpen(false)} />}
      {canSettle && <ActivityLogDialog open={activityOpen} onClose={() => setActivityOpen(false)} />}
      {canSettle && <ReconciliationDialog open={reconOpen} onClose={() => setReconOpen(false)} />}
    </DashboardLayout>
  );
}
