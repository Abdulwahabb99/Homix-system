/**
 * صفحة الصنّاع (المصانع) — تصميم homix_factories_v3.html.
 *
 * الصفحة رفيعة: كل المنطق في `useFactoriesPage` وكل العرض في `components/`.
 * البيانات ثابتة حالياً (`data/staticFactories`) والربط بالـ API لاحقاً يمسّ
 * الـ hook فقط.
 */
import React from "react";
import { Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";

import ConfirmDeleteModal from "./ConfirmDeleteModal";
import FactoriesCardsGrid from "./components/FactoriesCardsGrid";
import FactoriesKpiRow from "./components/FactoriesKpiRow";
import FactoriesTable from "./components/FactoriesTable";
import FactoriesToolbar from "./components/FactoriesToolbar";
import FactoryFormModal from "./components/FactoryFormModal";
import { useFactoriesPage } from "./hooks/useFactoriesPage";
import { PAGE_SUBTITLE, PAGE_TITLE } from "./utils/constants";
import { ghostBtnSx, primaryBtnSx, FONT } from "./utils/styles";
import { Factory } from "./utils/types";

export default function Factories() {
  const navigate = useNavigate();
  const page = useFactoriesPage();

  // TODO(BE): التصدير الفعلي عبر نقطة نهاية الصنّاع عند توفّرها
  const handleExport = () => NotificationMeassage("info", "التصدير غير متاح بعد");

  const handleView = (f: Factory) => navigate(`/factories/${f.id}`);

  const actions = (
    <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      <Box component="button" type="button" onClick={handleExport} sx={ghostBtnSx}>
        <FileDownloadOutlinedIcon /> تصدير
      </Box>
      <Box component="button" type="button" onClick={page.openAdd} sx={primaryBtnSx}>
        <AddIcon /> إضافة صانع
      </Box>
    </Box>
  );

  return (
    <DashboardLayout pageTitle={PAGE_TITLE} pageSubtitle={PAGE_SUBTITLE} pageActions={actions}>
      <ToastContainer />

      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "14px", fontFamily: FONT }}>
        <FactoriesKpiRow kpis={page.kpis} />

        <FactoriesToolbar
          filters={page.filters}
          onFilterChange={page.setFilter}
          onReset={page.resetFilters}
          view={page.view}
          onViewChange={page.setView}
        />

        {page.view === "table" ? (
          <FactoriesTable
            items={page.pageItems}
            totalCount={page.filteredCount}
            page={page.page}
            totalPages={page.totalPages}
            onPageChange={page.setPage}
            sortKey={page.sortKey}
            sortDir={page.sortDir}
            onSort={page.toggleSort}
            onView={handleView}
            onEdit={page.openEdit}
            onDelete={page.askDelete}
            onExport={handleExport}
          />
        ) : (
          <FactoriesCardsGrid
            items={page.pageItems}
            totalCount={page.filteredCount}
            page={page.page}
            totalPages={page.totalPages}
            onPageChange={page.setPage}
            onView={handleView}
            onEdit={page.openEdit}
            onDelete={page.askDelete}
          />
        )}
      </Box>

      <FactoryFormModal
        open={page.isFormOpen}
        factory={page.editingFactory}
        initialValues={page.formInitialValues}
        onClose={page.closeForm}
        onSave={page.saveFactory}
      />

      <ConfirmDeleteModal
        open={page.pendingDeleteId !== null}
        onClose={page.cancelDelete}
        handleConfirmDelete={page.confirmDelete}
      />
    </DashboardLayout>
  );
}
