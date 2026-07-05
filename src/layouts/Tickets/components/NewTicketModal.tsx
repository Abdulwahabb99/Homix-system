import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import type { ResolvedOrderForTicket } from "query/ticketCreate.api";
import type { CreateTicketPayload } from "query/ticketCreate.api";
import type { TicketMetaAssignee, TicketMetaOption } from "query/ticketsList.api";
import { formatTicketMetaAssigneeName } from "query/ticketsList.api";

const BRAND = "#6366f1";

const assigneeAutocompleteSx = {
  direction: "rtl" as const,
  width: "100%",
  fontFamily: "'Cairo',sans-serif",
  "& .MuiAutocomplete-option": {
    fontSize: "0.875rem",
    fontFamily: "'Cairo',sans-serif",
  },
  "& .MuiAutocomplete-inputRoot": {
    minHeight: 48,
    py: "3px",
    fontSize: "0.875rem",
    fontFamily: "'Cairo',sans-serif",
  },
  "& .MuiAutocomplete-input": {
    py: "10px !important",
    textAlign: "start" as const,
    minWidth: "2.5rem !important",
  },
  "& .MuiAutocomplete-endAdornment": { top: "unset" },
} as const;

/** نفس ارتفاع/راحة حقل المسئول (Autocomplete) تقريبًا */
const ticketTypeSelectSx = {
  borderRadius: 2,
  fontFamily: "'Cairo',sans-serif",
  fontSize: "0.875rem",
  "& .MuiOutlinedInput-notchedOutline": { borderRadius: 2 },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    minHeight: 48,
    py: "11px",
    boxSizing: "border-box",
  },
} as const;

type Props = {
  open: boolean;
  onClose: () => void;
  /** أنواع التذكرة من الـ meta — المفتاح يُرسل للـ API كـ type */
  typeOptions: TicketMetaOption[];
  assignees: TicketMetaAssignee[];
  onLookupOrder: (input: {
    orderNumber?: string;
    operationNumber?: string;
  }) => Promise<ResolvedOrderForTicket | null>;
  onCreateTicket: (payload: CreateTicketPayload) => Promise<void>;
  createPending?: boolean;
};

export default function NewTicketModal({
  open,
  onClose,
  typeOptions,
  assignees,
  onLookupOrder,
  onCreateTicket,
  createPending = false,
}: Props) {
  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [operationInput, setOperationInput] = useState("");
  const [foundOrder, setFoundOrder] = useState<ResolvedOrderForTicket | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searchPending, setSearchPending] = useState(false);
  const [typeKey, setTypeKey] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      setOrderNumberInput("");
      setOperationInput("");
      setFoundOrder(null);
      setSearchError("");
      setSearchPending(false);
      setTypeKey(typeOptions[0] ? String(typeOptions[0].key) : "");
      setAssigneeId("");
      setNotes("");
      return;
    }
    if (typeOptions[0]) {
      setTypeKey((k) => (k ? k : String(typeOptions[0].key)));
    }
  }, [open, typeOptions]);

  async function runSearch(params: { orderNumber?: string; operationNumber?: string }) {
    const value = (params.orderNumber ?? params.operationNumber ?? "").trim();
    setSearchError("");
    setFoundOrder(null);
    if (!value) {
      setSearchError("أدخل رقم الطلب أو رقم العملية");
      return;
    }
    setSearchPending(true);
    try {
      const res = await onLookupOrder(params);
      if (!res) {
        setSearchError("لم يتم العثور على الطلب. تأكد من رقم الطلب أو رقم العملية.");
        return;
      }
      setFoundOrder(res);
    } catch {
      setSearchError("تعذّر البحث عن الطلب");
    } finally {
      setSearchPending(false);
    }
  }

  async function handleCreate() {
    if (!foundOrder) {
      setSearchError("ابحث أولاً عن الطلب");
      return;
    }
    const tid = Number(typeKey);
    const aid = Number(assigneeId);
    if (!Number.isFinite(tid) || !Number.isFinite(aid)) {
      setSearchError("اختر نوع التذكرة والمسئول");
      return;
    }
    setSearchError("");
    try {
      await onCreateTicket({
        orderId: foundOrder.orderId,
        type: tid,
        assignedToUserId: aid,
        notes: notes.trim(),
      });
    } catch {
      /* الإشعار من الـ mutation */
    }
  }

  function handleDialogClose() {
    if (createPending || searchPending) return;
    onClose();
  }

  const firstTypeKey = typeOptions[0]?.key;
  const canSubmit =
    Boolean(foundOrder) &&
    assigneeId !== "" &&
    typeKey !== "" &&
    !createPending &&
    !searchPending;

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      BackdropProps={{ sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(15,23,42,0.45)" } }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha(BRAND, 0.12),
          boxShadow: `0 24px 48px -12px ${alpha(BRAND, 0.18)}, 0 8px 24px -8px rgba(15,23,42,0.12)`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1.5,
          pt: 2,
          px: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          fontWeight: 800,
          fontSize: "0.95rem",
        }}
      >
        إضافة تذكرة جديدة
        <IconButton size="small" onClick={handleDialogClose} disabled={createPending} sx={{ color: "text.secondary" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        {/* رقم الطلب — بحث عبر ?orderNumber= */}
        <Typography variant="caption" fontWeight={700} color="text.secondary" my={0.75} display="block">
          رقم الطلب
        </Typography>
        <Stack direction="row" spacing={1} mb={1.5}>
          <TextField
            fullWidth
            size="small"
            placeholder="مثال: 10773"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void runSearch({ orderNumber: orderNumberInput })}
            disabled={searchPending || createPending}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={() => void runSearch({ orderNumber: orderNumberInput })}
            disabled={searchPending || createPending}
            startIcon={<SearchIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              whiteSpace: "nowrap",
              bgcolor: BRAND,
              "&:hover": { bgcolor: "#5254e0" },
              flexShrink: 0,
            }}
          >
            بحث
          </Button>
        </Stack>

        {/* رقم العملية — بحث عبر ?operationNumber= */}
        <Typography variant="caption" fontWeight={700} color="text.secondary" my={0.75} display="block">
          رقم العملية
        </Typography>
        <Stack direction="row" spacing={1} mb={foundOrder ? 2 : 0}>
          <TextField
            fullWidth
            size="small"
            placeholder="مثال: 797"
            value={operationInput}
            onChange={(e) => setOperationInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void runSearch({ operationNumber: operationInput })}
            disabled={searchPending || createPending}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={() => void runSearch({ operationNumber: operationInput })}
            disabled={searchPending || createPending}
            startIcon={<SearchIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              whiteSpace: "nowrap",
              bgcolor: BRAND,
              "&:hover": { bgcolor: "#5254e0" },
              flexShrink: 0,
            }}
          >
            بحث
          </Button>
        </Stack>

        {searchError && (
          <Typography variant="caption" color="error" display="block" mt={1} mb={foundOrder ? 1 : 0}>
            {searchError}
          </Typography>
        )}

        {foundOrder && (
          <>
            <Paper
              variant="outlined"
              sx={{
                p: 1.75,
                mb: 2.5,
                borderRadius: 2,
                borderColor: alpha(BRAND, 0.25),
                bgcolor: alpha(BRAND, 0.04),
              }}
            >
              <Grid container spacing={1.5}>
                {[
                  { label: "رقم العملية", value: foundOrder.operationNumber || "—", accent: true },
                  { label: "رقم الطلب", value: `#${foundOrder.orderNumber}` },
                  ...(foundOrder.customerName
                    ? [{ label: "العميل", value: foundOrder.customerName } as const]
                    : []),
                  { label: "كود المنتج", value: foundOrder.code, mono: true },
                  { label: "البائع", value: foundOrder.seller },
                ].map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.25}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: item.accent ? BRAND : "text.primary",
                        fontFamily: item.mono ? "monospace" : "inherit",
                        fontSize: item.mono ? "0.78rem" : "0.85rem",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Stack spacing={2}>
              <FormControl fullWidth disabled={!typeOptions.length || createPending}>
                <InputLabel id="new-ticket-type-label">نوع التذكرة</InputLabel>
                <Select
                  labelId="new-ticket-type-label"
                  value={typeKey || (firstTypeKey != null ? String(firstTypeKey) : "")}
                  label="نوع التذكرة"
                  onChange={(e) => setTypeKey(String(e.target.value))}
                  sx={ticketTypeSelectSx}
                >
                  {typeOptions.map((t) => (
                    <MenuItem key={t.key} value={String(t.key)}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete<TicketMetaAssignee, false, false, false>
                options={assignees}
                value={assignees.find((a) => String(a.id) === assigneeId) ?? null}
                onChange={(_, v) => setAssigneeId(v ? String(v.id) : "")}
                getOptionLabel={(a) => formatTicketMetaAssigneeName(a)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                disabled={createPending || assignees.length === 0}
                noOptionsText="لا نتائج"
                openOnFocus
                clearOnEscape
                ListboxProps={{ style: { maxHeight: 280, overflow: "auto" } }}
                componentsProps={{
                  popper: {
                    sx: { zIndex: (t: Theme) => t.zIndex.modal + 2 },
                  },
                  paper: {
                    elevation: 8,
                    sx: { borderRadius: 2, mt: 0.5 },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="المسئول"
                    required
                    placeholder={assignees.length ? "ابحث بالاسم…" : "لا يوجد مسئولين"}
                    InputLabelProps={{ ...params.InputLabelProps, required: true }}
                  />
                )}
                sx={assigneeAutocompleteSx}
              />

              <TextField
                multiline
                rows={3}
                fullWidth
                size="small"
                label="ملاحظات"
                placeholder="أضف ملاحظاتك هنا…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={createPending}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={handleDialogClose}
          variant="outlined"
          disabled={createPending}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontFamily: "'Cairo',sans-serif",
            color: "#374151",
            borderColor: "rgba(15, 23, 42, 0.18)",
            "&:hover": {
              color: "#111827",
              borderColor: BRAND,
              backgroundColor: alpha(BRAND, 0.06),
            },
            "&:disabled": {
              color: "rgba(55, 65, 81, 0.45)",
              borderColor: "rgba(15, 23, 42, 0.12)",
            },
          }}
        >
          إلغاء
        </Button>
        <Button
          onClick={() => void handleCreate()}
          variant="contained"
          disableElevation
          disabled={!canSubmit || !typeOptions.length || assignees.length === 0}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: BRAND,
            "&:hover": { bgcolor: "#5254e0" },
          }}
        >
          {createPending ? "جارٍ الإنشاء…" : "إنشاء التذكرة"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
