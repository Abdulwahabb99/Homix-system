/**
 * الموردون — الصفحة الرفيعة: تُنسّق الحالة وتوزّع البيانات على المكوّنات المقسّمة.
 * تعيد استخدام `GET /vendors` عبر useVendors مع فلترة (بحث/حالة) وترقيم من جانب العميل.
 * الإضافة/الحذف/العرض/التصدير أزرار مؤقتة (لا endpoint بعد) — تُظهر تنبيه «قريباً».
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { usePermissions } from "shared/permissions";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { ToastContainer } from "react-toastify";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { useVendors } from "./hooks/useVendors";
import { PAGE_TITLE, PAGE_SUBTITLE } from "./utils/constants";
import { addBtnSx, topGhostBtnSx } from "./utils/styles";
import { Vendor } from "./utils/types";
import VendorsKpiRow from "./components/VendorsKpiRow";
import VendorsFilterBar from "./components/VendorsFilterBar";
import VendorsTable from "./components/VendorsTable";
import VendorEditModal from "./components/VendorEditModal";

const soon = () => NotificationMeassage("info", "هذه الميزة قريباً");

export default function Vendors() {
  const {
    paged, total, page, pageCount, setPage,
    search, setSearch, status, setStatus,
    kpis, isLoading, toggleActive, editVendor, isEditing,
  } = useVendors();

  const [editVendorRow, setEditVendorRow] = useState<Vendor | null>(null);
  const { canAdd } = usePermissions();

  const handleReset = () => { setSearch(""); setStatus("all"); };

  return (
    <DashboardLayout
      pageTitle={PAGE_TITLE}
      pageSubtitle={PAGE_SUBTITLE}
      pageActions={
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <Box component="button" type="button" onClick={soon} sx={topGhostBtnSx}>
            <FileDownloadOutlinedIcon /> تصدير Excel
          </Box>
          {canAdd("vendors") && (
            <Box component="button" type="button" onClick={soon} sx={addBtnSx}>
              <AddIcon /> إضافة مورد
            </Box>
          )}
        </Box>
      }
    >
      <ToastContainer />
      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <VendorsKpiRow kpis={kpis} />

        <VendorsFilterBar
          search={search}
          onSearch={setSearch}
          status={status}
          onStatus={setStatus}
          onReset={handleReset}
        />

        <VendorsTable
          rows={paged}
          total={total}
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          isLoading={isLoading}
          onToggleStatus={(v) => toggleActive(v.id)}
          onView={soon}
          onEdit={(v) => setEditVendorRow(v)}
          onDelete={soon}
          onExport={soon}
        />
      </Box>

      <VendorEditModal
        open={Boolean(editVendorRow)}
        vendor={editVendorRow}
        isSaving={isEditing}
        onClose={() => setEditVendorRow(null)}
        onSave={(values) =>
          editVendor({
            id: editVendorRow!.id,
            daysToDeliver: values.daysToDeliver,
            password: values.password,
            accountManager: values.accountManager,
          })
        }
        onToggleStatus={(v) => toggleActive(v.id)}
      />
    </DashboardLayout>
  );
}
