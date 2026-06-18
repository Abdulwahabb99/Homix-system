import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EngineeringIcon from "@mui/icons-material/Engineering";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import HomixDataTable, { type HomixColumn } from "components/HomixDataTable/HomixDataTable";
import HomixSearchInput from "components/HomixSearchInput/HomixSearchInput";
import HomixStatusBadge from "components/HomixStatusBadge/HomixStatusBadge";
import HomixKpiCard from "components/HomixKpiCard/HomixKpiCard";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { getUserType } from "shared/utils/constants";
import axiosRequest from "shared/functions/axiosRequest";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const ROLE_BADGE: Record<string, { bg: string; color: string; dot: string }> = {
  "1": { bg: HX.accentLight, color: "#3730a3", dot: HX.accent },
  "2": { bg: HX.blueLight,   color: "#1e40af", dot: HX.blue },
  "3": { bg: HX.tealLight,   color: "#0f766e", dot: HX.teal },
  "4": { bg: HX.amberLight,  color: "#92400e", dot: HX.amber },
};

function Users() {
  const [isloading, setIsLoading] = useState(false);
  const [isDeleteModalOpenned, setIsDeleteModalOpenned] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const getUsers = () => {
    setIsLoading(true);
    axiosRequest
      .get("/users")
      .then(({ data }) => {
        const newData = data.data.sort((a, b) => a.id - b.id);
        setUsers(newData);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteUser = () => {
    axiosRequest
      .delete(`/users/${selectedUserId}`)
      .then(() => {
        setIsDeleteModalOpenned(false);
        const newData = users.filter((user) => user.id !== selectedUserId);
        setUsers(newData);
        NotificationMeassage("success", "تم حذف المستخدم");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const roleCount = (type: string) => users.filter((u) => String(u.userType) === type).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      return name.includes(q) || (u.email || "").toLowerCase().includes(q);
    });
  }, [users, search]);

  const columns: HomixColumn<any>[] = [
    {
      key: "name", header: "الاسم", minWidth: 160,
      render: (u) => <Box component="span" sx={{ fontWeight: 700, color: HX.tx }}>{`${u.firstName} ${u.lastName}`}</Box>,
    },
    {
      key: "email", header: "البريد الإلكتروني", minWidth: 200,
      render: (u) => <Box component="span" sx={{ color: HX.tx2 }}>{u.email || "—"}</Box>,
    },
    {
      key: "userType", header: "نوع المستخدم", align: "center", minWidth: 130,
      render: (u) => {
        const c = ROLE_BADGE[String(u.userType)] ?? { bg: HX.surface3, color: HX.tx2, dot: HX.tx3 };
        return <HomixStatusBadge label={getUserType(u.userType)} bg={c.bg} color={c.color} dot={c.dot} />;
      },
    },
    {
      key: "actions", header: "إجراءات", align: "center", width: 120,
      render: (u) => (
        <Box sx={{ display: "inline-flex", gap: "6px" }}>
          <Tooltip title="تعديل">
            <IconButton
              size="small" aria-label="تعديل المستخدم"
              onClick={() => navigate(`/users/edit/${u.id}`)}
              sx={{ color: HX.blue, bgcolor: HX.blueLight, borderRadius: "8px", "&:hover": { bgcolor: HX.blue, color: "#fff" } }}
            >
              <EditIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              size="small" aria-label="حذف المستخدم"
              onClick={() => { setSelectedUserId(u.id); setIsDeleteModalOpenned(true); }}
              sx={{ color: HX.red, bgcolor: HX.redLight, borderRadius: "8px", "&:hover": { bgcolor: HX.red, color: "#fff" } }}
            >
              <DeleteIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout
      pageTitle="المستخدمون"
      pageSubtitle="إدارة حسابات النظام والصلاحيات"
      pageActions={
        <Box
          component="button"
          type="button"
          onClick={() => navigate("/users/add")}
          sx={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            px: "15px", height: 36, borderRadius: "9px", border: "none",
            bgcolor: HX.accent, color: "#fff", cursor: "pointer",
            fontSize: "13px", fontFamily: "'Cairo', sans-serif", fontWeight: 700,
            transition: ".15s", "&:hover": { bgcolor: "#4f46e5" },
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} /> مستخدم جديد
        </Box>
      }
    >
      <ToastContainer />
      {isDeleteModalOpenned && selectedUserId && (
        <ConfirmDeleteModal
          open={isDeleteModalOpenned}
          onClose={() => setIsDeleteModalOpenned(false)}
          handleConfirmDelete={deleteUser}
        />
      )}

      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* KPI strip */}
        <Grid container spacing="10px">
          <Grid item xs={6} sm={4} md={2.4}>
            <HomixKpiCard icon={<GroupIcon />} iconBg={HX.accentLight} iconColor={HX.accent} valueColor={HX.accent} label="إجمالي المستخدمين" value={users.length} />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <HomixKpiCard icon={<AdminPanelSettingsIcon />} iconBg={HX.accentLight} iconColor={HX.accent} label="مدير" value={roleCount("1")} />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <HomixKpiCard icon={<StorefrontIcon />} iconBg={HX.blueLight} iconColor={HX.blue} label="مورد" value={roleCount("2")} />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <HomixKpiCard icon={<EngineeringIcon />} iconBg={HX.tealLight} iconColor={HX.teal} label="عمليات" value={roleCount("3")} />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <HomixKpiCard icon={<LocalShippingIcon />} iconBg={HX.amberLight} iconColor={HX.amber} label="لوجستي" value={roleCount("4")} />
          </Grid>
        </Grid>

        {/* Search */}
        <Box sx={{ bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`, p: "12px 14px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <HomixSearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم أو البريد الإلكتروني..." />
        </Box>

        {/* Table */}
        <HomixDataTable
          columns={columns}
          rows={filtered}
          getRowKey={(u) => u.id}
          isLoading={isloading}
          emptyLabel="لا يوجد مستخدمون"
        />
      </Box>
    </DashboardLayout>
  );
}

export default Users;
