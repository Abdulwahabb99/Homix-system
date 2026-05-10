import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, InputAdornment, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import AddIcon from "@mui/icons-material/Add";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import TicketsHomixTable from "layouts/Tickets/components/TicketsHomixTable";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";
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
import { ticketKeys } from "query/keys";
import { useTicketsList } from "query/ticketsList.api";

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
  const queryClient = useQueryClient();
  const TICKET_PAGE_SIZE = 10;
  const [ticketTablePage, setTicketTablePage] = useState(0);

  const ticketsQuery = useTicketsList({
    page: ticketTablePage + 1,
    pageSize: TICKET_PAGE_SIZE,
  });

  const tickets = useMemo((): Ticket[] => {
    if (ticketsQuery.isError) return MOCK_TICKETS;
    return ticketsQuery.data?.items ?? [];
  }, [ticketsQuery.isError, ticketsQuery.data?.items]);

  /** للترقيم من السيرفر؛ عند الخطأ نستخدم طول القائمة المعروضة (وهم/احتياطي). */
  const listTotalCount = ticketsQuery.isError ? tickets.length : (ticketsQuery.data?.totalCount ?? 0);

  const [ticketTypes, setTicketTypes] = useState<string[]>(DEFAULT_TICKET_TYPES);
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);

  // views
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
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

  useEffect(() => {
    setTicketTablePage(0);
  }, [filterOp, filterOrder, filterType, filterStatus, filterResp, filterFrom, filterTo]);

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
    const summary = ticketsQuery.data?.summary;
    if (!ticketsQuery.isError && summary) {
      const avgClose =
        summary.averageResolutionDays > 0
          ? summary.averageResolutionDays.toFixed(1)
          : "0.0";
      return {
        total: summary.total,
        open: summary.open,
        closed: summary.closed,
        overdue7: summary.overdueOpen,
        avgClose,
      };
    }
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
  }, [ticketsQuery.isError, ticketsQuery.data?.summary, tickets]);

  const responsibles = useMemo(() => Array.from(new Set(tickets.map((t) => t.resp))), [tickets]);

  const openTicket = useCallback((id: string) => {
    const t = filteredTickets.find((x) => x.id === id);
    if (t) setDetailTicket(t);
  }, [filteredTickets]);

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
    (_data: { op: MockOp; type: string; resp: string; notes: string }) => {
      void _data;
      void queryClient.invalidateQueries({ queryKey: ticketKeys.all() });
    },
    [queryClient]
  );

  const handleUpdateTicket = useCallback(
    (updated: Ticket) => {
      setDetailTicket((d) => (d?.id === updated.id ? updated : d));
      void queryClient.invalidateQueries({ queryKey: ticketKeys.all() });
    },
    [queryClient]
  );

  function handleDeleteConfirm() {
    if (!deleteTicketId) return;
    if (detailTicket?.id === deleteTicketId) setDetailTicket(null);
    void queryClient.invalidateQueries({ queryKey: ticketKeys.all() });
    setDeleteTicketId(null);
  }

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
        {detailTicket ? (
          <TicketDetailView
            ticket={detailTicket}
            quickReplies={quickReplies}
            onBack={() => setDetailTicket(null)}
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

            <TicketsHomixTable
              tickets={filteredTickets}
              totalCount={listTotalCount}
              page={ticketTablePage}
              pageSize={TICKET_PAGE_SIZE}
              onPageChange={setTicketTablePage}
              onView={openTicket}
              onDelete={setDeleteTicketId}
              isLoading={ticketsQuery.isLoading}
              headerActions={
                <Button size="small" sx={BTN_G}>
                  تصدير Excel
                </Button>
              }
            />
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
