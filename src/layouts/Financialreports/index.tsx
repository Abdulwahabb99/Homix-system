/**
 * التقارير المالية — تسويات الصناع (دورة الفوترة).
 * الصفحة رفيعة: تُنسّق الحالة وتوزّع البيانات على المكوّنات المقسّمة.
 * البيانات ثابتة حالياً عبر `useFinancialSettlements` (جاهزة لربط الـ BE لاحقاً).
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { HX } from "layouts/Orders/ordersHomixTheme";

import { useFinancialSettlements } from "./hooks/useFinancialSettlements";
import { PAGE_TITLE, PAGE_SUBTITLE, DEFAULT_PERIOD_ID, DEFAULT_TAB } from "./utils/constants";
import { tabsWrapSx, FONT } from "./utils/styles";
import { SettlementTabKey } from "./utils/types";

import FinancialPeriodBar from "./components/FinancialPeriodBar";
import FinancialKpiRow from "./components/FinancialKpiRow";
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

export default function Financialreports() {
  const [periodId, setPeriodId] = useState(DEFAULT_PERIOD_ID);
  const [tab, setTab] = useState<SettlementTabKey>(DEFAULT_TAB);

  const { sellers, kpis } = useFinancialSettlements(periodId);

  // TODO(BE): ربط أزرار التصدير/الفاتورة اليدوية بنقاط النهاية عند توفّرها.
  const actions = (
    <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      <Box component="button" type="button" onClick={() => {}} sx={ghostBtnSx}>
        <FileDownloadOutlinedIcon /> تصدير PDF
      </Box>
      <Box component="button" type="button" onClick={() => {}} sx={ghostBtnSx}>
        <FileDownloadOutlinedIcon /> تصدير Excel
      </Box>
      <Box component="button" type="button" onClick={() => {}} sx={primaryBtnSx}>
        <AddIcon /> فاتورة يدوية
      </Box>
    </Box>
  );

  return (
    <DashboardLayout pageTitle={PAGE_TITLE} pageSubtitle={PAGE_SUBTITLE} pageActions={actions}>
      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "16px", fontFamily: FONT }}>
        <FinancialPeriodBar value={periodId} onChange={setPeriodId} />
        <FinancialKpiRow kpis={kpis} />

        <Box sx={tabsWrapSx}>
          <FinancialTabs active={tab} onChange={setTab} count={sellers.length} />
          {tab === "warehouse" && <WarehouseTab sellers={sellers} />}
          {tab === "seller" && <SellerTab sellers={sellers} />}
          {tab === "comprehensive" && <ComprehensiveTab sellers={sellers} />}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
