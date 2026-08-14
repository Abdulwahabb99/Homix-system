import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import type { ShipmentsMetaOption } from "query/shipmentsMeta";
import type { ManagedExpenseType } from "query/shipmentsAccounts";

const FONT = "'Cairo', sans-serif";

type Props = {
  open: boolean;
  options: ShipmentsMetaOption[];
  saving: boolean;
  onClose: () => void;
  onSave: (options: ManagedExpenseType[]) => void;
};

type EditableOption = ManagedExpenseType & { localKey: string };

export default function ExpenseTypesModal({ open, options, saving, onClose, onSave }: Props) {
  const [items, setItems] = useState<EditableOption[]>([]);
  const [label, setLabel] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setItems(options.map((option) => ({
      id: Number(option.value),
      label: option.label,
      localKey: `saved-${option.value}`,
    })));
    setLabel("");
    setEditingIndex(null);
  }, [open, options]);

  const submitLabel = () => {
    const value = label.trim();
    if (!value || items.some((item, index) => item.label === value && index !== editingIndex)) return;

    if (editingIndex !== null) {
      setItems((current) => current.map((item, index) => index === editingIndex ? { ...item, label: value } : item));
    } else {
      setItems((current) => [...current, {
        label: value,
        localKey: `new-${Date.now()}-${current.length}`,
      }]);
    }
    setLabel("");
    setEditingIndex(null);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} dir="rtl" fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        إدارة أنواع المصروفات
        <IconButton size="small" onClick={onClose} disabled={saving}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: "text.secondary", mb: 1.5 }}>
          اضغط على النوع لتعديل اسمه، أو على علامة الحذف لإزالته من الاختيارات الجديدة.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
          {items.map((item, index) => (
            <Chip
              key={item.localKey}
              label={item.label}
              size="small"
              onClick={() => { setEditingIndex(index); setLabel(item.label); }}
              onDelete={() => {
                setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
                if (editingIndex === index) { setEditingIndex(null); setLabel(""); }
              }}
              sx={{ fontFamily: FONT }}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label={editingIndex === null ? "نوع مصروف جديد" : "تعديل اسم النوع"}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") submitLabel(); }}
            inputProps={{ maxLength: 100 }}
            sx={{ "& input, & label": { fontFamily: FONT, fontSize: "12px" } }}
          />
          <Button variant="contained" onClick={submitLabel} startIcon={<AddIcon />} sx={{ fontFamily: FONT, whiteSpace: "nowrap" }}>
            {editingIndex === null ? "إضافة" : "حفظ"}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={saving || items.length === 0}
          onClick={() => onSave(items.map(({ id, label: itemLabel }) => ({ id, label: itemLabel })))}
          sx={{ fontFamily: FONT }}
        >
          {saving ? "جارٍ الحفظ..." : "حفظ وإغلاق"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
