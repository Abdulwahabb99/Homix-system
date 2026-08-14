import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, Grid, InputAdornment, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import AddIcon from "@mui/icons-material/Add";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import TicketsHomixTable from "layouts/Tickets/components/TicketsHomixTable";
import EditTicketModal from "layouts/Tickets/components/EditTicketModal";
import {
  TicketsFilterBarSkeleton,
  TicketsHomixTableSkeleton,
  TicketsKpiRowSkeleton,
} from "layouts/Tickets/components/TicketsHomixSkeletons";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import NewTicketModal from "layouts/Tickets/components/NewTicketModal";
import TicketSettingsModal from "layouts/Tickets/components/TicketSettingsModal";
import {
  DEFAULT_QUICK_REPLIES,
  DEFAULT_TICKET_TYPES,
  MOCK_TICKETS,
  Ticket,
} from "layouts/Tickets/utils/constants";
import { ticketKeys } from "query/keys";
import {
  type TicketMetaOption,
  type TicketsListFilters,
  exportTickets,
  formatTicketMetaAssigneeName,
  useTicketsList,
  useTicketsMeta,
} from "query/ticketsList.api";
import {
  createTicket,
  resolveOrderForNewTicket,
  type CreateTicketPayload,
} from "query/ticketCreate.api";
import { usePatchTicketFromList, type TicketPatchPayload } from "query/ticketUpdate.api";

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const TICKET_PAGE_SIZE = 10;
  const [ticketTablePage, setTicketTablePage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const [ticketTypes, setTicketTypes] = useState<string[]>(DEFAULT_TICKET_TYPES);
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);

  const metaQuery = useTicketsMeta();

  // views
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  /** رقم عملية قادم من الرابط (?operationNumber=) لملء نافذة إنشاء التذكرة والبحث تلقائياً */
  const [prefillOperation, setPrefillOperation] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);

  const patchTicketListMutation = usePatchTicketFromList();

  // filters — مسودة في الشريط؛ تُطبَّق على الـ API فقط بعد «تطبيق»
  const [filterOp, setFilterOp] = useState("");
  const [filterOrder, setFilterOrder] = useState("");
  const [filterTypeKey, setFilterTypeKey] = useState("");
  const [filterStatusKey, setFilterStatusKey] = useState("");
  const [filterAssigneeId, setFilterAssigneeId] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<TicketsListFilters>({});

  const ticketsQuery = useTicketsList({
    page: ticketTablePage + 1,
    pageSize: TICKET_PAGE_SIZE,
    filters: appliedFilters,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTickets(appliedFilters);
      NotificationMeassage("success", "تم تصدير التذاكر");
    } catch {
      NotificationMeassage("error", "تعذّر تصدير التذاكر");
    } finally {
      setIsExporting(false);
    }
  };

  const tickets = useMemo((): Ticket[] => {
    if (ticketsQuery.isError) return MOCK_TICKETS;
    return ticketsQuery.data?.items ?? [];
  }, [ticketsQuery.isError, ticketsQuery.data?.items]);

  /** وضع الـ mock: نفس الفلاتر المطبّقة على السيرفر */
  const filteredMockTickets = useMemo(() => {
    const meta = metaQuery.data;
    const typeLabel =
      appliedFilters.type != null
        ? meta?.types?.find((x) => x.key === appliedFilters.type)?.label
        : undefined;
    const statusLabel =
      appliedFilters.status != null
        ? meta?.statuses?.find((x) => x.key === appliedFilters.status)?.label
        : undefined;
    const assignee =
      appliedFilters.assignedToUserId != null
        ? meta?.assignees?.find((a) => a.id === appliedFilters.assignedToUserId)
        : undefined;
    const assigneeDisplay = assignee ? formatTicketMetaAssigneeName(assignee) : "";
    const opQ = appliedFilters.operationNumber?.trim() ?? "";
    const ordQ = appliedFilters.orderNumber?.trim() ?? "";

    return tickets.filter((t) => {
      if (opQ && !t.op.toLowerCase().includes(opQ.toLowerCase())) return false;
      if (ordQ && !t.order.includes(ordQ)) return false;
      if (appliedFilters.type != null && typeLabel && t.type !== typeLabel) return false;
      if (appliedFilters.status != null && statusLabel && t.status !== statusLabel) return false;
      if (appliedFilters.assignedToUserId != null && assigneeDisplay && t.resp !== assigneeDisplay) {
        return false;
      }
      if (appliedFilters.startDate && t.openDate < appliedFilters.startDate) return false;
      if (appliedFilters.endDate && t.openDate > appliedFilters.endDate) return false;
      return true;
    });
  }, [tickets, metaQuery.data, appliedFilters]);

  const displayTickets = useMemo(() => {
    if (ticketsQuery.isError) return filteredMockTickets;
    return tickets;
  }, [ticketsQuery.isError, tickets, filteredMockTickets]);
  const listTotalCount = ticketsQuery.isError
    ? filteredMockTickets.length
    : (ticketsQuery.data?.totalCount ?? 0);

  /** أرقام البلاطات من `summary` في استجابة قائمة التذاكر */
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

  /** نصوص المساعدة تحت البلاطات؛ يمكن دمج عناوين اختيارية من الـ meta مع نسب من `summary` */
  const tileNotes = useMemo(() => {
    const meta = metaQuery.data;
    const openPassed3 = tickets.filter((t) => t.status === "مفتوحة" && t.days > 3).length;
    const summary = ticketsQuery.data?.summary;

    if (!ticketsQuery.isError && summary) {
      return {
        total:
          meta?.totalSubtitle ??
          (meta?.newTicketsWeekDelta != null
            ? `↑ ${meta.newTicketsWeekDelta} من الأسبوع الماضي`
            : "↑ 8 من الأسبوع الماضي"),
        open:
          meta?.openSubtitle ??
          `${meta?.openBeyond3Days ?? openPassed3} تجاوزت 3 أيام`,
        closed:
          meta?.closedSubtitle ??
          `↑ ${summary.total ? ((summary.closed / summary.total) * 100).toFixed(1) : 0}% معدل الإغلاق`,
        avg: meta?.averageSubtitle ?? "↑ أفضل من الشهر الماضي",
        overdue: meta?.overdueSubtitle ?? "تحتاج تدخل فوري",
      };
    }
    return {
      total: "↑ 8 من الأسبوع الماضي",
      open: `${openPassed3} تجاوزت 3 أيام`,
      closed: `↑ ${kpi.total ? ((kpi.closed / kpi.total) * 100).toFixed(1) : 0}% معدل الإغلاق`,
      avg: "↑ أفضل من الشهر الماضي",
      overdue: "تحتاج تدخل فوري",
    };
  }, [
    metaQuery.data,
    ticketsQuery.isError,
    ticketsQuery.data?.summary,
    tickets,
    kpi,
  ]);

  const filterTypeOptions = metaQuery.data?.types ?? [];
  const filterStatusOptions = metaQuery.data?.statuses ?? [];
  const filterAssigneeOptions = useMemo(
    () => metaQuery.data?.assignees ?? [],
    [metaQuery.data?.assignees]
  );

  const typeOptionsForModal = useMemo((): TicketMetaOption[] => {
    if (metaQuery.data?.types?.length) return metaQuery.data.types;
    return ticketTypes.map((label, i) => ({ key: i + 1, label }));
  }, [metaQuery.data?.types, ticketTypes]);

  const createTicketMutation = useMutation({
    mutationFn: (payload: CreateTicketPayload) => createTicket(navigate, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.all() });
      NotificationMeassage("success", "تم إنشاء التذكرة");
      setNewTicketOpen(false);
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر إنشاء التذكرة");
    },
  });

  const handleLookupOrder = useCallback(
    (input: { orderNumber?: string; operationNumber?: string }) =>
      resolveOrderForNewTicket(navigate, input),
    [navigate]
  );

  // إذا حمل الرابط ?operationNumber= افتح نافذة الإنشاء بهذا الرقم وابحث تلقائياً،
  // ثم أزل المعامل من الرابط حتى لا يتكرر الفتح عند الإغلاق/التحديث.
  useEffect(() => {
    const op = searchParams.get("operationNumber");
    if (!op) return;
    setPrefillOperation(op);
    setNewTicketOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("operationNumber");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const openTicket = useCallback(
    (ticketId: string) => {
      navigate(`/tickets/${encodeURIComponent(ticketId)}`);
    },
    [navigate]
  );

  function buildFiltersFromDraft(): TicketsListFilters {
    return {
      operationNumber: filterOp.trim() || undefined,
      orderNumber: filterOrder.trim() || undefined,
      startDate: filterFrom.trim() || undefined,
      endDate: filterTo.trim() || undefined,
      status: filterStatusKey ? Number(filterStatusKey) : undefined,
      type: filterTypeKey ? Number(filterTypeKey) : undefined,
      assignedToUserId: filterAssigneeId ? Number(filterAssigneeId) : undefined,
    };
  }

  function handleApplyFilters() {
    setAppliedFilters(buildFiltersFromDraft());
    setTicketTablePage(0);
  }

  // ── Handlers ──
  function resetFilters() {
    setFilterOp("");
    setFilterOrder("");
    setFilterTypeKey("");
    setFilterStatusKey("");
    setFilterAssigneeId("");
    setFilterFrom("");
    setFilterTo("");
    setAppliedFilters({});
    setTicketTablePage(0);
  }

  const handleCreateTicket = useCallback(
    async (payload: CreateTicketPayload) => {
      await createTicketMutation.mutateAsync(payload);
    },
    [createTicketMutation]
  );

  function handleDeleteConfirm() {
    if (!deleteTicketId) return;
    void queryClient.invalidateQueries({ queryKey: ticketKeys.all() });
    setDeleteTicketId(null);
  }

  const handleSaveEditTicket = useCallback(
    async (payload: Required<Pick<TicketPatchPayload, "status" | "assignedToUserId" | "notes">>) => {
      if (!editTicket) return;
      try {
        await patchTicketListMutation.mutateAsync({
          ticketId: editTicket.id,
          patch: payload,
        });
        setEditTicket(null);
      } catch {
        /* الإشعار من usePatchTicketFromList */
      }
    },
    [editTicket, patchTicketListMutation]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  const pageActions = (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: "14px !important" }} />}
        onClick={() => void handleExport()}
        disabled={isExporting}
        sx={BTN_G}
      >
        {isExporting ? "جارٍ التصدير..." : "تصدير"}
      </Button>
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

  const showKpiSkeleton = ticketsQuery.isLoading;
  const showFilterSkeleton = metaQuery.isLoading && !metaQuery.data;
  const showTableSkeleton = ticketsQuery.isLoading;

  return (
    <>
    <DashboardLayout
      pageTitle="التذاكر"
      pageSubtitle="متابعة وإدارة تذاكر الدعم والشكاوى"
      pageActions={pageActions}
    >
      <Box sx={{ maxWidth: 1680, mx: "auto", width: "100%", mt: 2.5 }}>
        {/* ── KPI Row ── */}
        {showKpiSkeleton ? (
          <TicketsKpiRowSkeleton />
        ) : (
        <Grid container spacing={1.5} mb={2.5}>
          <Grid item xs={6} sm={4} md={12 / 5}>
            <KpiCard
              icon={<ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />}
              iconBg={alpha(BRAND, 0.12)}
              iconColor={BRAND}
              label="إجمالي التذاكر"
              value={kpi.total}
              topLabel="الكل"
              change={tileNotes.total}
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
              change={tileNotes.open}
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
              change={tileNotes.closed}
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
              change={tileNotes.avg}
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
              change={tileNotes.overdue}
              changeUp={false}
            />
          </Grid>
        </Grid>
        )}

        {/* ── Content: list ── */}
        <>
            {showFilterSkeleton ? (
              <TicketsFilterBarSkeleton />
            ) : (
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
                value={filterTypeKey}
                onChange={(e) => setFilterTypeKey(e.target.value)}
                displayEmpty
                sx={FSEL_SX(128)}
              >
                <MenuItem value="" sx={FMENU_SX}>كل الأنواع</MenuItem>
                {filterTypeOptions.map((o) => (
                  <MenuItem key={o.key} value={String(o.key)} sx={FMENU_SX}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>

              {/* كل الحالات */}
              <Select
                value={filterStatusKey}
                onChange={(e) => setFilterStatusKey(e.target.value)}
                displayEmpty
                sx={FSEL_SX(112)}
              >
                <MenuItem value="" sx={FMENU_SX}>كل الحالات</MenuItem>
                {filterStatusOptions.map((o) => (
                  <MenuItem key={o.key} value={String(o.key)} sx={FMENU_SX}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>

              {/* كل المسئولين */}
              <Select
                value={filterAssigneeId}
                onChange={(e) => setFilterAssigneeId(e.target.value)}
                displayEmpty
                sx={FSEL_SX(130)}
              >
                <MenuItem value="" sx={FMENU_SX}>كل المسئولين</MenuItem>
                {filterAssigneeOptions.map((a) => (
                  <MenuItem key={a.id} value={String(a.id)} sx={FMENU_SX}>
                    {formatTicketMetaAssigneeName(a)}
                  </MenuItem>
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

              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                  flexWrap: "nowrap",
                  flexBasis: { xs: "100%", md: "auto" },
                  justifyContent: { xs: "flex-end", md: "flex-start" },
                  ml: { xs: 0, md: "auto" },
                }}
              >
                <Button variant="contained" disableElevation sx={BTN_P} onClick={handleApplyFilters}>
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
            </Box>
            )}

            {showTableSkeleton ? (
              <TicketsHomixTableSkeleton rows={10} />
            ) : (
            <TicketsHomixTable
              tickets={displayTickets}
              totalCount={listTotalCount}
              page={ticketTablePage}
              pageSize={TICKET_PAGE_SIZE}
              onPageChange={setTicketTablePage}
              onView={openTicket}
              onDelete={setDeleteTicketId}
              onEdit={(t) => setEditTicket(t)}
              isLoading={false}
              headerActions={
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
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
              }
            />
            )}
          </>
        </Box>
    </DashboardLayout>

      {/* مودالات خارج غلاف الصفحة لتفادي أي stacking / overflow من المحتوى */}
      <NewTicketModal
        open={newTicketOpen}
        onClose={() => {
          setNewTicketOpen(false);
          setPrefillOperation("");
        }}
        typeOptions={typeOptionsForModal}
        assignees={filterAssigneeOptions}
        onLookupOrder={handleLookupOrder}
        onCreateTicket={handleCreateTicket}
        createPending={createTicketMutation.isPending}
        initialOperationNumber={prefillOperation}
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

      <EditTicketModal
        open={editTicket != null}
        onClose={() => setEditTicket(null)}
        ticket={editTicket}
        assignees={filterAssigneeOptions}
        onSubmit={handleSaveEditTicket}
        isSubmitting={patchTicketListMutation.isPending}
      />
    </>
  );
}
