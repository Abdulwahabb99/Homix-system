/**
 * التقارير المالية — تسويات الصناع (دورة الفوترة).
 * الصفحة رفيعة: تُنسّق الحالة (يوم الفوترة/التبويب) وتوزّع بيانات الـ BE على
 * المكوّنات المقسّمة عبر `useFinancialSettlements` (GET /orders/financialReport).
 */
import React, { useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { exportFinancialReport } from "query/financialReport";
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
  const [isExporting, setIsExporting] = useState(false);
  const { canExport } = usePermissions();

  const { sections, kpis, cycle, isLoading, isError } = useFinancialSettlements(billingDay);

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
    exportFinancialReport(billingDay)
      .catch(() => NotificationMeassage("error", "حدث خطأ أثناء التصدير"))
      .finally(() => setIsExporting(false));
  };

  // TODO(BE): لا توجد نقطة نهاية لتصدير PDF ولا للفاتورة اليدوية بعد.
  const notAvailable = () => NotificationMeassage("info", "غير متاح بعد");

  const actions = (
    <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      {canExport("finance") && (
        <Box component="button" type="button" onClick={notAvailable} sx={ghostBtnSx}>
          <FileDownloadOutlinedIcon /> تصدير PDF
        </Box>
      )}
      {canExport("finance") && (
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
      <Box component="button" type="button" onClick={notAvailable} sx={primaryBtnSx}>
        <AddIcon /> فاتورة يدوية
      </Box>
    </Box>
  );

  let tabContent: React.ReactNode;
  if (isError) {
    tabContent = <Box sx={{ ...stateBoxSx, color: HX.red }}>تعذّر تحميل التقرير — حاول مرة أخرى.</Box>;
  } else if (activeSellers.length === 0) {
    tabContent = <Box sx={stateBoxSx}>لا توجد بيانات لهذه الدورة.</Box>;
  } else if (tab === "warehouse") {
    tabContent = <WarehouseTab sellers={activeSellers} billingDay={billingDay} />;
  } else if (tab === "seller") {
    tabContent = <SellerTab sellers={activeSellers} billingDay={billingDay} />;
  } else {
    tabContent = <ComprehensiveTab sellers={activeSellers} billingDay={billingDay} cycle={cycle} />;
  }

  return (
    <DashboardLayout pageTitle={PAGE_TITLE} pageSubtitle={PAGE_SUBTITLE} pageActions={actions}>
      <ToastContainer />

      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "16px", fontFamily: FONT }}>
        {isLoading ? (
          <FinancialReportsSkeleton />
        ) : (
          <>
            <FinancialPeriodBar billingDay={billingDay} onChange={setBillingDay} cycle={cycle} />
            <FinancialKpiRow kpis={kpis} />

            <Box sx={tabsWrapSx}>
              <FinancialTabs active={tab} onChange={setTab} counts={counts} />
              {tabContent}
            </Box>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
