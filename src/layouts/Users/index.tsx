/**
 * المستخدمون — الصفحة الرفيعة: تُنسّق الحالة وتوزّع البيانات على المكوّنات المقسّمة.
 * تعيد استخدام `GET /users` عبر useUsers، مع فلترة (بحث/دور) وترقيم من جانب العميل.
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useUsers } from "./hooks/useUsers";
import { PAGE_TITLE, PAGE_SUBTITLE } from "./utils/constants";
import { addBtnSx, FONT } from "./utils/styles";
import { AppUser } from "./utils/types";
import UsersKpiRow from "./components/UsersKpiRow";
import UsersFilterBar from "./components/UsersFilterBar";
import UsersTable from "./components/UsersTable";
import UserModal from "./components/UserModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function Users() {
  const {
    paged, total, page, pageCount, setPage,
    search, setSearch, role, setRole, roleCounts,
    kpis, isLoading, deleteUser,
  } = useUsers();

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const openAdd = () => { setEditUser(null); setModalOpen(true); };
  const openEdit = (u: AppUser) => { setEditUser(u); setModalOpen(true); };
  const openView = (u: AppUser) => navigate(`/users/${u.id}`);

  const confirmDelete = () => {
    if (deleteTarget) deleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout
      pageTitle={PAGE_TITLE}
      pageSubtitle={PAGE_SUBTITLE}
      pageActions={
        <Box component="button" type="button" onClick={openAdd} sx={addBtnSx}>
          <AddIcon /> إضافة مستخدم
        </Box>
      }
    >
      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "12px", fontFamily: FONT }}>
        <UsersKpiRow kpis={kpis} />

        <UsersFilterBar
          search={search}
          onSearch={setSearch}
          role={role}
          onRole={setRole}
          roleCounts={roleCounts}
        />

        <UsersTable
          rows={paged}
          total={total}
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          isLoading={isLoading}
          onView={openView}
          onEdit={openEdit}
          onDelete={(u) => setDeleteTarget(u)}
        />
      </Box>

      <UserModal open={modalOpen} editUser={editUser} onClose={() => setModalOpen(false)} />

      {deleteTarget && (
        <ConfirmDeleteModal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          handleConfirmDelete={confirmDelete}
        />
      )}
    </DashboardLayout>
  );
}
