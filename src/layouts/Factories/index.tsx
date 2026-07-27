/**
 * صفحة الصنّاع (المصانع) — تصميم homix_factories_v3.html فوق API الصنّاع.
 *
 * الصفحة رفيعة: كل المنطق في `useFactoriesPage` (استعلامات + فلاتر + طلبات
 * التعديل) وكل العرض في `components/`.
 */
import React from "react";
import { Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";

import ConfirmDeleteModal from "./ConfirmDeleteModal";
import FactoriesCardsGrid from "./components/FactoriesCardsGrid";
import FactoriesKpiRow from "./components/FactoriesKpiRow";
import FactoriesSkeleton from "./components/FactoriesSkeleton";
import FactoriesTable from "./components/FactoriesTable";
import FactoriesToolbar from "./components/FactoriesToolbar";
import FactoryFormModal from "./components/FactoryFormModal";
import { useFactoriesPage } from "./hooks/useFactoriesPage";
import { PAGE_SUBTITLE, PAGE_TITLE } from "./utils/constants";
import { emptyStateSx, ghostBtnSx, primaryBtnSx, tableCardSx, FONT } from "./utils/styles";
import { FactoryListItem } from "./utils/types";

export default function Factories() {
  const navigate = useNavigate();
  const page = useFactoriesPage();

  // TODO(BE): لا توجد نقطة نهاية لتصدير الصنّاع بعد
  const handleExport = () => NotificationMeassage("info", "التصدير غير متاح بعد");

  const handleView = (f: FactoryListItem) => navigate(`/factories/${f.id}`);

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

  let body: React.ReactNode;
  if (page.isLoading) {
    body = <FactoriesSkeleton />;
  } else if (page.isError) {
    body = (
      <Box sx={tableCardSx}>
        <Box sx={{ ...emptyStateSx, color: HX.red }}>تعذّر تحميل الصنّاع — حاول مرة أخرى.</Box>
      </Box>
    );
  } else {
    body = (
      <>
        <FactoriesKpiRow summary={page.summary} />

        <FactoriesToolbar
          meta={page.meta}
          filters={page.filters}
          onFilterChange={page.setFilter}
          onApply={page.applyNow}
          onReset={page.resetFilters}
          view={page.view}
          onViewChange={page.setView}
        />

        {page.view === "table" ? (
          <FactoriesTable
            items={page.items}
            totalCount={page.totalItems}
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
            isFetching={page.isFetching}
          />
        ) : (
          <FactoriesCardsGrid
            items={page.items}
            totalCount={page.totalItems}
            page={page.page}
            totalPages={page.totalPages}
            onPageChange={page.setPage}
            onView={handleView}
            onEdit={page.openEdit}
            onDelete={page.askDelete}
            isFetching={page.isFetching}
          />
        )}
      </>
    );
  }

  return (
    <DashboardLayout pageTitle={PAGE_TITLE} pageSubtitle={PAGE_SUBTITLE} pageActions={actions}>
      <ToastContainer />

      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "14px", fontFamily: FONT }}>
        {body}
      </Box>

      <FactoryFormModal
        open={page.isFormOpen}
        factoryId={page.editingId}
        meta={page.meta}
        isSaving={page.isSaving}
        onClose={page.closeForm}
        onSave={page.saveFactory}
      />

      <ConfirmDeleteModal
        open={page.pendingDeleteId !== null}
        onClose={page.cancelDelete}
        handleConfirmDelete={page.confirmDelete}
        itemName={page.items.find((f) => f.id === page.pendingDeleteId)?.name}
        isDeleting={page.isDeleting}
      />
    </DashboardLayout>
  );
}
