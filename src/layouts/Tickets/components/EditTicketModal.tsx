import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Theme } from "@mui/material/styles";
import type { Ticket } from "layouts/Tickets/utils/constants";
import type { TicketMetaAssignee } from "query/ticketsList.api";
import { formatTicketMetaAssigneeName } from "query/ticketsList.api";
import type { TicketPatchPayload } from "query/ticketUpdate.api";

const BRAND = "#6366f1";

/** ارتفاع أوضح لحقل «حالة التذكرة» */
const selectOutlinedSx = {
  minHeight: 48,
  borderRadius: 1,
  "& .MuiSelect-select": {
    py: "13px",
    px: 1.5,
    minHeight: 48,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
  },
} as const;

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

type Props = {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  assignees: TicketMetaAssignee[];
  onSubmit: (payload: Required<Pick<TicketPatchPayload, "status" | "assignedToUserId" | "notes">>) => Promise<void>;
  isSubmitting: boolean;
};

export default function EditTicketModal({
  open,
  onClose,
  ticket,
  assignees,
  onSubmit,
  isSubmitting,
}: Props) {
  const [statusApi, setStatusApi] = useState<number>(1);
  const [assigneeId, setAssigneeId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !ticket) return;
    setStatusApi(ticket.status === "مغلقة" ? 2 : 1);
    setNotes(ticket.notes ?? "");
    if (ticket.assignedToUserId != null && Number.isFinite(ticket.assignedToUserId)) {
      setAssigneeId(String(ticket.assignedToUserId));
    } else if (assignees.length === 1) {
      setAssigneeId(String(assignees[0].id));
    } else {
      setAssigneeId("");
    }
  }, [open, ticket?.id, ticket?.status, ticket?.notes, ticket?.assignedToUserId, assignees]);

  async function handleSave() {
    if (!ticket) return;
    const aid = Number(assigneeId);
    if (!Number.isFinite(aid)) {
      return;
    }
    await onSubmit({
      status: statusApi,
      assignedToUserId: aid,
      notes: notes.trim(),
    });
  }

  const canSave = Boolean(ticket) && assigneeId !== "" && !isSubmitting;

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          pb: 1,
          fontFamily: "'Cairo',sans-serif",
          fontWeight: 800,
          fontSize: "1rem",
        }}
      >
        <Box>
          تعديل التذكرة
          {ticket ? (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              العملية {ticket.op} · الطلب #{ticket.order}
            </Typography>
          ) : null}
        </Box>
        <IconButton aria-label="إغلاق" size="small" onClick={onClose} disabled={isSubmitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ fontFamily: "'Cairo',sans-serif" }}>
        {!ticket ? (
          <Typography color="text.secondary" fontSize="0.875rem">
            لم يتم اختيار تذكرة.
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <FormControl fullWidth>
              <InputLabel id="edit-ticket-status">حالة التذكرة</InputLabel>
              <Select
                labelId="edit-ticket-status"
                label="حالة التذكرة"
                value={statusApi}
                onChange={(e) => setStatusApi(Number(e.target.value))}
                disabled={isSubmitting}
                sx={selectOutlinedSx}
              >
                <MenuItem value={1}>مفتوحة</MenuItem>
                <MenuItem value={2}>مغلقة</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete<TicketMetaAssignee, false, false, false>
              options={assignees}
              value={assignees.find((a) => String(a.id) === assigneeId) ?? null}
              onChange={(_, v) => setAssigneeId(v ? String(v.id) : "")}
              getOptionLabel={(a) => formatTicketMetaAssigneeName(a)}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              disabled={isSubmitting || assignees.length === 0}
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
              label="ملاحظات"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              fullWidth
              multiline
              minRows={3}
              placeholder="مثال: تم حل المشكلة وإغلاق التذكرة"
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit" sx={{ fontFamily: "'Cairo',sans-serif" }}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!canSave || assignees.length === 0}
          onClick={() => void handleSave()}
          sx={{
            fontFamily: "'Cairo',sans-serif",
            fontWeight: 700,
            bgcolor: BRAND,
            "&:hover": { bgcolor: "#5254e0" },
          }}
        >
          حفظ التعديلات
        </Button>
      </DialogActions>
    </Dialog>
  );
}
