import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, IconButton, Switch, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import HomixDataTable, { type HomixColumn } from "components/HomixDataTable/HomixDataTable";
import HomixSearchInput from "components/HomixSearchInput/HomixSearchInput";
import HomixStatusBadge from "components/HomixStatusBadge/HomixStatusBadge";
import HomixKpiCard from "components/HomixKpiCard/HomixKpiCard";
import { HX } from "layouts/Orders/ordersHomixTheme";
import axiosRequest from "shared/functions/axiosRequest";
import EditVendorModal from "./components/EditVendorModal";

function Vendors() {
  const [isloading, setIsLoading] = useState(false);
  const [isEditModalOpenned, setIsEditModalOpenned] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const getVendors = () => {
    setIsLoading(true);
    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/vendors`)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }
        const newData = data.data.sort((a, b) => a.id - b.id);
        setVendors(newData);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleChange = (id, value) => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/vendors/${id}/activeStatus`)
      .then(() => {
        const newData = vendors.map((vendor) =>
          vendor.id === id ? { ...vendor, active: !value } : vendor
        );
        setVendors(newData);
        NotificationMeassage("success", "تم تغير الحالة");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const handleEditVendor = (daysToDeliver, password) => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/vendors/${selectedVendor.id}`, {
        ...(daysToDeliver && { daysToDeliver: daysToDeliver }),
        ...(password && { password: password }),
      })
      .then(() => {
        const updatedVendors = vendors.map((vendor) =>
          selectedVendor.id === vendor.id
            ? { ...vendor, ...(daysToDeliver && { daysToDeliver: daysToDeliver }) }
            : vendor
        );
        setVendors(updatedVendors);
        setIsEditModalOpenned(false);
        NotificationMeassage("success", "تم تعديل المورد بنجاح");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  useEffect(() => {
    getVendors();
  }, []);

  const onlineCount = useMemo(() => vendors.filter((v) => v.active).length, [vendors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      (v) =>
        (v.name || "").toLowerCase().includes(q) ||
        (v.user?.email || "").toLowerCase().includes(q)
    );
  }, [vendors, search]);

  const columns: HomixColumn<any>[] = [
    {
      key: "name", header: "اسم البائع", minWidth: 160,
      render: (v) => <Box component="span" sx={{ fontWeight: 700, color: HX.tx }}>{v.name}</Box>,
    },
    {
      key: "email", header: "البريد الإلكتروني", minWidth: 200,
      render: (v) => <Box component="span" sx={{ color: HX.tx2 }}>{v.user?.email || "—"}</Box>,
    },
    {
      key: "status", header: "الحالة", align: "center", minWidth: 160,
      render: (v) => (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <HomixStatusBadge
            label={v.active ? "نشط" : "غير نشط"}
            bg={v.active ? HX.greenLight : HX.surface3}
            color={v.active ? "#065f46" : HX.tx2}
            dot={v.active ? HX.green : HX.tx3}
          />
          <Switch size="small" checked={!!v.active} onChange={() => handleChange(v.id, v.active)} />
        </Box>
      ),
    },
    {
      key: "actions", header: "تعديل", align: "center", width: 90,
      render: (v) => (
        <Tooltip title="تعديل">
          <IconButton
            size="small"
            aria-label="تعديل البائع"
            onClick={() => { setSelectedVendor(v); setIsEditModalOpenned(true); }}
            sx={{ color: HX.blue, bgcolor: HX.blueLight, borderRadius: "8px", "&:hover": { bgcolor: HX.blue, color: "#fff" } }}
          >
            <EditIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <DashboardLayout pageTitle="البائعون" pageSubtitle="إدارة حسابات البائعين وحالتهم">
      <ToastContainer />

      {isEditModalOpenned && (
        <EditVendorModal
          open={isEditModalOpenned}
          onClose={() => setIsEditModalOpenned(false)}
          data={selectedVendor}
          onEdit={handleEditVendor}
        />
      )}

      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* KPI strip */}
        <Grid container spacing="10px">
          <Grid item xs={4}>
            <HomixKpiCard icon={<StorefrontIcon />} iconBg={HX.accentLight} iconColor={HX.accent} valueColor={HX.accent} label="إجمالي البائعين" value={vendors.length} />
          </Grid>
          <Grid item xs={4}>
            <HomixKpiCard icon={<CheckCircleIcon />} iconBg={HX.greenLight} iconColor={HX.green} valueColor={HX.green} label="نشط" value={onlineCount} />
          </Grid>
          <Grid item xs={4}>
            <HomixKpiCard icon={<DoNotDisturbOnIcon />} iconBg={HX.surface3} iconColor={HX.tx2} label="غير نشط" value={vendors.length - onlineCount} />
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
          getRowKey={(v) => v.id}
          isLoading={isloading}
          emptyLabel="لا يوجد بائعون"
        />
      </Box>
    </DashboardLayout>
  );
}

export default Vendors;
