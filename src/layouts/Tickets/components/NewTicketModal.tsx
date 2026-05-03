import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Stack,
  Grid,
  IconButton,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { MOCK_OPS, RESPONSIBLE_OPTIONS, MockOp } from "layouts/Tickets/utils/constants";

const BRAND = "#6366f1";

type Props = {
  open: boolean;
  onClose: () => void;
  ticketTypes: string[];
  onCreateTicket: (data: {
    op: MockOp;
    type: string;
    resp: string;
    notes: string;
  }) => void;
};

export default function NewTicketModal({ open, onClose, ticketTypes, onCreateTicket }: Props) {
  const [opInput, setOpInput] = useState("");
  const [foundOp, setFoundOp] = useState<MockOp | null>(null);
  const [opError, setOpError] = useState("");
  const [type, setType] = useState(ticketTypes[0] ?? "");
  const [resp, setResp] = useState(RESPONSIBLE_OPTIONS[0]);
  const [notes, setNotes] = useState("");

  function handleSearch() {
    const val = opInput.trim().toUpperCase();
    const found = MOCK_OPS[val];
    if (!found) {
      setOpError("رقم العملية غير موجود، جرب: OP-3001 أو OP-3002");
      setFoundOp(null);
    } else {
      setOpError("");
      setFoundOp(found);
    }
  }

  function handleCreate() {
    if (!foundOp) {
      setOpError("ابحث أولاً عن رقم العملية");
      return;
    }
    onCreateTicket({ op: foundOp, type, resp, notes });
    handleClose();
  }

  function handleClose() {
    setOpInput("");
    setFoundOp(null);
    setOpError("");
    setType(ticketTypes[0] ?? "");
    setResp(RESPONSIBLE_OPTIONS[0]);
    setNotes("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        {/* Search OP */}
        <Typography variant="caption" fontWeight={700} color="text.secondary" mb={0.75} display="block">
          ابحث برقم العملية
        </Typography>
        <Stack direction="row" spacing={1} mb={foundOp ? 2 : 0}>
          <TextField
            fullWidth
            size="small"
            placeholder="مثال: OP-3001"
            value={opInput}
            onChange={(e) => setOpInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            error={Boolean(opError)}
            helperText={opError}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={handleSearch}
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

        {/* Found OP result */}
        {foundOp && (
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
                  { label: "رقم العملية", value: foundOp.op, accent: true },
                  { label: "رقم الطلب", value: `#${foundOp.order}` },
                  { label: "كود المنتج", value: foundOp.code, mono: true },
                  { label: "البائع", value: foundOp.seller },
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
              <FormControl size="small" fullWidth>
                <InputLabel>نوع التذكرة</InputLabel>
                <Select
                  value={type}
                  label="نوع التذكرة"
                  onChange={(e) => setType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {ticketTypes.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>المسئول</InputLabel>
                <Select
                  value={resp}
                  label="المسئول"
                  onChange={(e) => setResp(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {RESPONSIBLE_OPTIONS.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                multiline
                rows={3}
                fullWidth
                size="small"
                label="ملاحظات"
                placeholder="أضف ملاحظاتك هنا..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disableElevation
          disabled={!foundOp}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: BRAND,
            "&:hover": { bgcolor: "#5254e0" },
          }}
        >
          إنشاء التذكرة
        </Button>
      </DialogActions>
    </Dialog>
  );
}
