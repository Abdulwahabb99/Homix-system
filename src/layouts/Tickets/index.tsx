import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import AddIcon from "@mui/icons-material/Add";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import HomixDataTable from "shared/components/HomixDataTable/HomixDataTable";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";
import {
  TicketStatusChip,
  TicketTypeChip,
  DayCounter,
} from "layouts/Tickets/components/TicketChips";
import TicketDetailView from "layouts/Tickets/components/TicketDetailView";
import NewTicketModal from "layouts/Tickets/components/NewTicketModal";
import TicketSettingsModal from "layouts/Tickets/components/TicketSettingsModal";
import {
  DEFAULT_QUICK_REPLIES,
  DEFAULT_TICKET_TYPES,
  MOCK_TICKETS,
  MockOp,
  Ticket,
} from "layouts/Tickets/utils/constants";

const BRAND = "#6366f1";

// ─── Button sx بنفس ستايل tickets.html ────────────────────────────────────────
const BTN_P = {
  height: "32px",
  px: "14px",
  py: 0,
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "none",
  bgcolor: BRAND,
  color: "#fff",
  border: "none",
  boxShadow: "none",
  minWidth: 0,
  "&:hover": { bgcolor: "#5254e0", boxShadow: "none" },
} as const;

const BTN_G = {
  height: "32px",
  px: "12px",
  py: 0,
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "none",
  bgcolor: "#f9fafb",
  color: "#6b7280",
  border: "0.5px solid rgba(0,0,0,0.09)",
  boxShadow: "none",
  minWidth: 0,
  "&:hover": {
    borderColor: BRAND,
    color: BRAND,
    bgcolor: "#f9fafb",
    boxShadow: "none",
  },
} as const;

// ─── Filter input/select sx — نفس .finput و .fsel في tickets.html ─────────────
function FINPUT_SX(width: number) {
  return {
    width,
    "& .MuiInputBase-root": {
      height: 32,
      borderRadius: "8px",
      bgcolor: "#fff",
      fontFamily: "'Cairo',sans-serif",
      fontSize: "12px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "0.5px solid rgba(0,0,0,0.09)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      border: "0.5px solid rgba(0,0,0,0.18) !important",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${BRAND} !important`,
    },
    "& .MuiInputBase-input": {
      padding: "0 10px",
      fontSize: "12px",
      color: "#111827",
      fontFamily: "'Cairo',sans-serif",
      "&::placeholder": { color: "#9ca3af", opacity: 1 },
    },
    "& .MuiInputAdornment-root": { marginLeft: 0 },
    "& legend": { display: "none" },
    "& fieldset": { top: 0 },
  } as const;
}

function FSEL_SX(minWidth: number) {
  return {
    minWidth,
    height: 32,
    borderRadius: "8px",
    bgcolor: "#fff",
    fontFamily: "'Cairo',sans-serif",
    fontSize: "12px",
    color: "#6b7280",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "0.5px solid rgba(0,0,0,0.09)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      border: "0.5px solid rgba(0,0,0,0.18) !important",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${BRAND} !important`,
    },
    "& .MuiSelect-select": {
      padding: "0 10px !important",
      height: "32px !important",
      display: "flex",
      alignItems: "center",
      fontSize: "12px",
      fontFamily: "'Cairo',sans-serif",
    },
  } as const;
}

const FMENU_SX = {
  fontSize: "12px",
  fontFamily: "'Cairo',sans-serif",
  color: "#374151",
  minHeight: 36,
} as const;

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  change,
  changeUp,
  topLabel,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  valueColor?: string;
  change?: string;
  changeUp?: boolean;
  topLabel?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.75,
        borderRadius: 2.5,
        borderColor: "divider",
        cursor: "default",
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.25}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
        {topLabel && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
            {topLabel}
          </Typography>
        )}
      </Stack>
      <Typography
        fontWeight={800}
        sx={{ fontSize: "1.4rem", lineHeight: 1, mb: 0.4, color: valueColor ?? "text.primary" }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={500}
        sx={{ fontSize: "0.78rem" }}
      >
        {label}
      </Typography>
      {change && (
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{
            display: "block",
            mt: 0.75,
            fontSize: "0.72rem",
            color: changeUp ? "#10b981" : "#ef4444",
          }}
        >
          {change}
        </Typography>
      )}
    </Paper>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [ticketTypes, setTicketTypes] = useState<string[]>(DEFAULT_TICKET_TYPES);
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);

  // views
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);

  // filters
  const [filterOp, setFilterOp] = useState("");
  const [filterOrder, setFilterOrder] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterResp, setFilterResp] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // ── Derived ──
  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filterOp && !t.op.toLowerCase().includes(filterOp.toLowerCase())) return false;
      if (filterOrder && !t.order.includes(filterOrder)) return false;
      if (filterType && t.type !== filterType) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterResp && t.resp !== filterResp) return false;
      if (filterFrom && t.openDate < filterFrom) return false;
      if (filterTo && t.openDate > filterTo) return false;
      return true;
    });
  }, [tickets, filterOp, filterOrder, filterType, filterStatus, filterResp, filterFrom, filterTo]);

  const kpi = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "مفتوحة").length;
    const closed = tickets.filter((t) => t.status === "مغلقة").length;
    const overdue7 = tickets.filter((t) => t.status === "مفتوحة" && t.days > 7).length;
    const closedWithDays = tickets.filter((t) => t.status === "مغلقة" && t.days > 0);
    const avgClose =
      closedWithDays.length > 0
        ? (closedWithDays.reduce((s, t) => s + t.days, 0) / closedWithDays.length).toFixed(1)
        : "1.8";
    return { total, open, closed, overdue7, avgClose };
  }, [tickets]);

  const responsibles = useMemo(() => Array.from(new Set(tickets.map((t) => t.resp))), [tickets]);

  // ── Handlers ──
  function resetFilters() {
    setFilterOp("");
    setFilterOrder("");
    setFilterType("");
    setFilterStatus("");
    setFilterResp("");
    setFilterFrom("");
    setFilterTo("");
  }

  const handleCreateTicket = useCallback(
    (data: { op: MockOp; type: string; resp: string; notes: string }) => {
      const now = new Date().toISOString();
      const today = now.split("T")[0];
      const time = new Date().toTimeString().slice(0, 5);
      const newT: Ticket = {
        id: `TK-${String(tickets.length + 1).padStart(3, "0")}`,
        op: data.op.op,
        order: data.op.order,
        code: data.op.code,
        seller: data.op.seller,
        type: data.type,
        openDate: today,
        closeDate: "—",
        days: 0,
        status: "مفتوحة",
        resp: data.resp,
        adminReply: "—",
        ownerReply: "—",
        notes: data.notes,
        chat: [
          { from: "admin", name: data.resp, msg: "تم فتح التذكرة بنجاح", time: `${today} ${time}` },
        ],
        attachments: [],
      };
      setTickets((prev) => [newT, ...prev]);
    },
    [tickets.length]
  );

  const handleUpdateTicket = useCallback((updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  function handleDeleteConfirm() {
    if (!deleteTicketId) return;
    setTickets((prev) => prev.filter((t) => t.id !== deleteTicketId));
    setDeleteTicketId(null);
    if (selectedTicketId === deleteTicketId) setSelectedTicketId(null);
  }

  // ── Columns ──
  const columns = useMemo(
    () => [
      {
        field: "op",
        headerName: "رقم العملية",
        minWidth: 110,
        renderCell: (p: any) => (
          <Typography
            variant="body2"
            fontWeight={800}
            sx={{
              color: BRAND,
              cursor: "pointer",
              fontSize: "0.8rem",
              textDecoration: "underline",
              textDecorationColor: "transparent",
              "&:hover": { textDecorationColor: BRAND },
              transition: "0.15s",
            }}
            onClick={() => setSelectedTicketId(p.row.id)}
          >
            {p.row.op}
          </Typography>
        ),
      },
      {
        field: "order",
        headerName: "رقم الطلب",
        minWidth: 100,
        renderCell: (p: any) => (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            #{p.row.order}
          </Typography>
        ),
      },
      {
        field: "code",
        headerName: "كود المنتج",
        minWidth: 100,
        renderCell: (p: any) => (
          <Box
            component="span"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              bgcolor: (t: any) => alpha(t.palette.text.primary, 0.06),
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              color: "text.secondary",
            }}
          >
            {p.row.code}
          </Box>
        ),
      },
      { field: "seller", headerName: "البائع", minWidth: 130, flex: 0.8 },
      {
        field: "type",
        headerName: "نوع التذكرة",
        minWidth: 140,
        renderCell: (p: any) => <TicketTypeChip type={p.row.type} />,
      },
      { field: "openDate", headerName: "تاريخ الرفع", minWidth: 110, sortable: false },
      { field: "closeDate", headerName: "تاريخ الغلق", minWidth: 110, sortable: false },
      {
        field: "days",
        headerName: "عداد الأيام",
        minWidth: 110,
        sortable: false,
        renderCell: (p: any) => <DayCounter days={p.row.days} isOpen={p.row.status === "مفتوحة"} />,
      },
      {
        field: "status",
        headerName: "الحالة",
        minWidth: 110,
        renderCell: (p: any) => <TicketStatusChip status={p.row.status} />,
      },
      {
        field: "resp",
        headerName: "المسئول",
        minWidth: 130,
        renderCell: (p: any) => (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.55rem",
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {(p.row.resp ?? "؟").charAt(0)}
            </Box>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {p.row.resp}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "adminReply",
        headerName: "رد المسئول",
        minWidth: 140,
        sortable: false,
        flex: 0.7,
        renderCell: (p: any) => (
          <Typography
            variant="body2"
            sx={{
              color: "#1d4ed8",
              fontSize: "0.78rem",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.row.adminReply}
          </Typography>
        ),
      },
      {
        field: "ownerReply",
        headerName: "رد صاحب التذكرة",
        minWidth: 140,
        sortable: false,
        flex: 0.7,
        renderCell: (p: any) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "0.78rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.row.ownerReply || "—"}
          </Typography>
        ),
      },
      {
        field: "notes",
        headerName: "ملاحظات",
        minWidth: 130,
        sortable: false,
        flex: 0.6,
        renderCell: (p: any) => (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{
              fontSize: "0.75rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.row.notes || "—"}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "",
        minWidth: 90,
        sortable: false,
        renderCell: (p: any) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="عرض التفاصيل">
              <IconButton
                size="small"
                onClick={() => setSelectedTicketId(p.row.id)}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1.5,
                  bgcolor: alpha(BRAND, 0.1),
                  color: BRAND,
                  "&:hover": { bgcolor: BRAND, color: "#fff" },
                }}
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف التذكرة">
              <IconButton
                size="small"
                onClick={() => setDeleteTicketId(p.row.id)}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1.5,
                  bgcolor: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  "&:hover": { bgcolor: "#ef4444", color: "#fff" },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    []
  );

  // ─────────────────────────────────────────────────────────────────────────────
  const pageActions = (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        disableElevation
        disableRipple={false}
        startIcon={<SettingsOutlinedIcon sx={{ fontSize: "13px !important" }} />}
        onClick={() => setSettingsOpen(true)}
        sx={BTN_G}
      >
        إدارة الأنواع والردود
      </Button>
      <Button
        size="small"
        variant="contained"
        disableElevation
        startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
        onClick={() => setNewTicketOpen(true)}
        sx={BTN_P}
      >
        تذكرة جديدة
      </Button>
    </Stack>
  );

  return (
    <DashboardLayout
      pageTitle="التذاكر"
      pageSubtitle="متابعة وإدارة تذاكر الدعم والشكاوى"
      pageActions={pageActions}
    >
      <Box sx={{ maxWidth: 1680, mx: "auto", width: "100%", mt: 2.5 }}>
        {/* ── KPI Row ── */}
        <Grid container spacing={1.5} mb={2.5}>
          <Grid item xs={6} sm={4} md={12 / 5}>
            <KpiCard
              icon={<ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />}
              iconBg={alpha(BRAND, 0.12)}
              iconColor={BRAND}
              label="إجمالي التذاكر"
              value={kpi.total}
              topLabel="الكل"
              change={`↑ 8 من الأسبوع الماضي`}
              changeUp
            />
          </Grid>
          <Grid item xs={6} sm={4} md={12 / 5}>
            <KpiCard
              icon={<WarningAmberIcon sx={{ fontSize: 15 }} />}
              iconBg="rgba(245,158,11,0.12)"
              iconColor="#f59e0b"
              label="تذاكر مفتوحة"
              value={kpi.open}
              valueColor="#f59e0b"
              change={`${
                tickets.filter((t) => t.status === "مفتوحة" && t.days > 3).length
              } تجاوزت 3 أيام`}
              changeUp={false}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={12 / 5}>
            <KpiCard
              icon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
              iconBg="rgba(16,185,129,0.12)"
              iconColor="#10b981"
              label="تذاكر مغلقة"
              value={kpi.closed}
              valueColor="#10b981"
              change={`↑ ${
                kpi.total ? ((kpi.closed / kpi.total) * 100).toFixed(1) : 0
              }% معدل الإغلاق`}
              changeUp
            />
          </Grid>
          <Grid item xs={6} sm={4} md={12 / 5}>
            <KpiCard
              icon={<ScheduleIcon sx={{ fontSize: 15 }} />}
              iconBg="rgba(59,130,246,0.12)"
              iconColor="#3b82f6"
              label="متوسط وقت الإغلاق (يوم)"
              value={kpi.avgClose}
              change="↑ أفضل من الشهر الماضي"
              changeUp
            />
          </Grid>
          <Grid item xs={6} sm={4} md={12 / 5}>
            <KpiCard
              icon={<WarningAmberIcon sx={{ fontSize: 15 }} />}
              iconBg="rgba(239,68,68,0.12)"
              iconColor="#ef4444"
              label="تجاوزت 7 أيام"
              value={kpi.overdue7}
              valueColor="#ef4444"
              change="تحتاج تدخل فوري"
              changeUp={false}
            />
          </Grid>
        </Grid>

        {/* ── Content: list or detail ── */}
        {selectedTicket ? (
          <TicketDetailView
            ticket={selectedTicket}
            quickReplies={quickReplies}
            onBack={() => setSelectedTicketId(null)}
            onUpdateTicket={handleUpdateTicket}
          />
        ) : (
          <>
            {/* Filter Bar — نفس ستايل .fbar في tickets.html */}
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: "14px",
                border: "0.5px solid rgba(0,0,0,0.09)",
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
                p: "10px 14px",
                mb: 2,
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* بحث برقم العملية */}
              <TextField
                placeholder="بحث برقم العملية..."
                value={filterOp}
                onChange={(e) => setFilterOp(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                sx={FINPUT_SX(160)}
              />

              {/* بحث برقم الطلب */}
              <TextField
                placeholder="بحث برقم الطلب..."
                value={filterOrder}
                onChange={(e) => setFilterOrder(e.target.value)}
                sx={FINPUT_SX(150)}
              />

              <Box sx={{ width: "0.5px", height: 24, bgcolor: "rgba(0,0,0,0.09)", flexShrink: 0 }} />

              {/* كل الأنواع */}
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                displayEmpty
                sx={FSEL_SX(128)}
              >
                <MenuItem value="" sx={FMENU_SX}>كل الأنواع</MenuItem>
                {ticketTypes.map((t) => (
                  <MenuItem key={t} value={t} sx={FMENU_SX}>{t}</MenuItem>
                ))}
              </Select>

              {/* كل الحالات */}
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                displayEmpty
                sx={FSEL_SX(112)}
              >
                <MenuItem value="" sx={FMENU_SX}>كل الحالات</MenuItem>
                <MenuItem value="مفتوحة" sx={FMENU_SX}>مفتوحة</MenuItem>
                <MenuItem value="مغلقة" sx={FMENU_SX}>مغلقة</MenuItem>
              </Select>

              {/* كل المسئولين */}
              <Select
                value={filterResp}
                onChange={(e) => setFilterResp(e.target.value)}
                displayEmpty
                sx={FSEL_SX(130)}
              >
                <MenuItem value="" sx={FMENU_SX}>كل المسئولين</MenuItem>
                {responsibles.map((r) => (
                  <MenuItem key={r} value={r} sx={FMENU_SX}>{r}</MenuItem>
                ))}
              </Select>

              <Box sx={{ width: "0.5px", height: 24, bgcolor: "rgba(0,0,0,0.09)", flexShrink: 0 }} />

              {/* تاريخ من */}
              <TextField
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={FINPUT_SX(138)}
              />

              {/* تاريخ إلى */}
              <TextField
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={FINPUT_SX(138)}
              />

              <Box sx={{ flex: 1 }} />

              <Button variant="contained" disableElevation sx={BTN_P}>
                تطبيق
              </Button>
              <Button
                onClick={resetFilters}
                startIcon={<RefreshIcon sx={{ fontSize: "13px !important" }} />}
                sx={BTN_G}
              >
                إعادة ضبط
              </Button>
            </Box>

            {/* Table */}
            <Box
              sx={{
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 1px 2px rgba(15,23,42,0.05), 0 2px 12px rgba(15,23,42,0.04)",
                overflow: "hidden",
                // إخفاء footer الـ DataGrid بالكامل بالـ CSS كضمان إضافي فوق hideFooter
                "& .MuiDataGrid-footerContainer": { display: "none !important" },
              }}
            >
              {/* Table header */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                px={2}
                py={1.5}
                sx={{ borderBottom: "1px solid", borderColor: "divider" }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    قائمة التذاكر
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem" }}>
                    {filteredTickets.length} تذكرة
                  </Typography>
                </Box>
                <Button size="small" sx={BTN_G}>
                  تصدير Excel
                </Button>
              </Stack>

              <HomixDataTable
                rows={filteredTickets}
                columns={columns}
                getRowId={(r) => r.id}
                height={520}
                page={0}
                pageSize={100}
                onPageChange={() => undefined}
                rowCount={filteredTickets.length}
                onSelectionModelChange={() => undefined}
                hideFooter
                disablePagination
                sx={{ border: "none", borderRadius: 0 }}
              />
            </Box>
          </>
        )}
      </Box>

      {/* ── Modals ── */}
      <NewTicketModal
        open={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        ticketTypes={ticketTypes}
        onCreateTicket={handleCreateTicket}
      />

      <TicketSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        ticketTypes={ticketTypes}
        quickReplies={quickReplies}
        onSave={(types, replies) => {
          setTicketTypes(types);
          setQuickReplies(replies);
        }}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTicketId)}
        onClose={() => setDeleteTicketId(null)}
        handleConfirmDelete={handleDeleteConfirm}
        title="هذه التذكرة"
      />
    </DashboardLayout>
  );
}
