import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import type { TicketMetaOption } from "query/ticketsList.api";

const BRAND = "#6366f1";

type Props = {
  open: boolean;
  onClose: () => void;
  ticketTypes: TicketMetaOption[];
  quickReplies: TicketMetaOption[];
  saving?: boolean;
  onSave: (types: TicketMetaOption[], replies: TicketMetaOption[]) => void;
};

export default function TicketSettingsModal({
  open,
  onClose,
  ticketTypes: initialTypes,
  quickReplies: initialReplies,
  saving = false,
  onSave,
}: Props) {
  const [types, setTypes] = useState<TicketMetaOption[]>(initialTypes);
  const [replies, setReplies] = useState<TicketMetaOption[]>(initialReplies);
  const [newType, setNewType] = useState("");
  const [newReply, setNewReply] = useState("");
  const [editingType, setEditingType] = useState<number | null>(null);
  const [editingReply, setEditingReply] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setTypes(initialTypes);
    setReplies(initialReplies);
    setNewType("");
    setNewReply("");
    setEditingType(null);
    setEditingReply(null);
  }, [initialReplies, initialTypes, open]);

  function handleAddType() {
    const val = newType.trim();
    if (!val || types.some((option, index) => option.label === val && index !== editingType)) return;
    if (editingType !== null) {
      setTypes((prev) => prev.map((option, index) => index === editingType ? { ...option, label: val } : option));
    } else {
      setTypes((prev) => [...prev, { key: -(Date.now()), label: val }]);
    }
    setNewType("");
    setEditingType(null);
  }

  function handleRemoveType(i: number) {
    setTypes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleAddReply() {
    const val = newReply.trim();
    if (!val || replies.some((option, index) => option.label === val && index !== editingReply)) return;
    if (editingReply !== null) {
      setReplies((prev) => prev.map((option, index) => index === editingReply ? { ...option, label: val } : option));
    } else {
      setReplies((prev) => [...prev, { key: -(Date.now()), label: val }]);
    }
    setNewReply("");
    setEditingReply(null);
  }

  function handleRemoveReply(i: number) {
    setReplies((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSave() {
    onSave(types, replies);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          maxHeight: "85vh",
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
        إدارة الأنواع والردود
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        {/* Ticket Types */}
        <Typography variant="body2" fontWeight={700} color="text.primary" mb={1.25}>
          أنواع التذاكر
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
          {types.map((t, i) => (
            <Chip
              key={t.key}
              label={t.label}
              size="small"
              onClick={() => { setEditingType(i); setNewType(t.label); }}
              onDelete={() => handleRemoveType(i)}
              title="اضغط لتعديل الاسم"
              sx={{
                fontWeight: 500,
                fontSize: "0.78rem",
                bgcolor: alpha(BRAND, 0.08),
                color: BRAND,
                border: `1px solid ${alpha(BRAND, 0.2)}`,
                "& .MuiChip-deleteIcon": { color: alpha(BRAND, 0.6), "&:hover": { color: BRAND } },
              }}
            />
          ))}
        </Box>
        <Stack direction="row" spacing={1} mb={0.5}>
          <TextField
            fullWidth
            size="small"
            placeholder="اسم النوع الجديد..."
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddType()}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={handleAddType}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
              bgcolor: BRAND,
              "&:hover": { bgcolor: "#5254e0" },
            }}
          >
            {editingType !== null ? "حفظ" : "إضافة"}
          </Button>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {/* Quick Replies */}
        <Typography variant="body2" fontWeight={700} color="text.primary" mb={1.25}>
          الردود السريعة
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
          {replies.map((r, i) => (
            <Chip
              key={r.key}
              label={r.label}
              size="small"
              onClick={() => { setEditingReply(i); setNewReply(r.label); }}
              onDelete={() => handleRemoveReply(i)}
              title="اضغط لتعديل الرد"
              sx={{
                fontWeight: 500,
                fontSize: "0.75rem",
                bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                color: "text.secondary",
                "& .MuiChip-deleteIcon": { color: "error.main" },
              }}
            />
          ))}
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="رد سريع جديد..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddReply()}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={handleAddReply}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
              bgcolor: BRAND,
              "&:hover": { bgcolor: "#5254e0" },
            }}
          >
            {editingReply !== null ? "حفظ" : "إضافة"}
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={handleSave}
          disabled={saving || types.length === 0}
          variant="contained"
          disableElevation
          fullWidth
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: BRAND,
            "&:hover": { bgcolor: "#5254e0" },
          }}
        >
          {saving ? "جارٍ الحفظ..." : "حفظ وإغلاق"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
