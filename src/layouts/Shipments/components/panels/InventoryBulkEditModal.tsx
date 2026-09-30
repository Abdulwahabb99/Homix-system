/**
 * تعديل جماعي لأصناف المخزون المحدَّدة: الكمية، سعر التكلفة، الحالة، المقاس، اللون.
 * كل حقل اختياري — يُرسل فقط ما مُلئ فعلاً، والباقي يبقى كما هو في كل صنف.
 *
 * كود المنتج والمنتج نفسه ليسا هنا عمداً: كلاهما يخصّ صنفاً بعينه.
 */
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import type { InventoryBulkPayload } from "query/shipmentsInventory";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12.5px", fontFamily: FONT },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "12.5px" },
} as const;

const STATUS_OPTIONS = [
  { value: 1, label: "متوفر بالمخزون" },
  { value: 2, label: "نفذ بالمخزون" },
];

export interface InventoryBulkEditModalProps {
  open: boolean;
  selectedCount: number;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (payload: InventoryBulkPayload) => void;
}

export default function InventoryBulkEditModal({
  open,
  selectedCount,
  isSaving = false,
  onClose,
  onSubmit,
}: InventoryBulkEditModalProps) {
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [status, setStatus] = useState<number | "">("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  const handleClose = () => {
    setQuantity("");
    setCostPrice("");
    setStatus("");
    setSize("");
    setColor("");
    onClose();
  };

  const handleSave = () => {
    const payload: InventoryBulkPayload = {};

    if (quantity.trim() !== "") {
      const parsed = Number(quantity);
      if (!Number.isInteger(parsed) || parsed < 0) {
        NotificationMeassage("error", "الكمية لازم تكون رقمًا صحيحًا غير سالب");
        return;
      }
      payload.quantity = parsed;
    }

    if (costPrice.trim() !== "") {
      const parsed = Number(costPrice);
      if (!Number.isFinite(parsed) || parsed < 0) {
        NotificationMeassage("error", "سعر التكلفة لازم يكون رقمًا غير سالب");
        return;
      }
      payload.costPrice = parsed;
    }

    if (status !== "") payload.status = Number(status);
    if (size.trim() !== "") payload.size = size.trim();
    if (color.trim() !== "") payload.color = color.trim();

    if (Object.keys(payload).length === 0) {
      NotificationMeassage("error", "املأ حقلاً واحدًا على الأقل");
      return;
    }

    onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : handleClose}
      dir="rtl"
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 700 }}>
        تعديل الأصناف المحددة
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" display="block" mb={2} sx={{ fontFamily: FONT }}>
          سيُطبَّق التعديل على {selectedCount} صنف — الحقول الفارغة لا تتغيّر.
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="الكمية"
            type="number"
            size="small"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 0, step: 1 }}
            helperText="تُضبط الحالة تلقائياً على «نفذ» عند الكمية صفر"
            sx={fieldSx}
          />
          <TextField
            label="سعر التكلفة"
            type="number"
            size="small"
            fullWidth
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            inputProps={{ min: 0, step: "0.01" }}
            sx={fieldSx}
          />
          <TextField
            select
            label="حالة المخزون"
            size="small"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value === "" ? "" : Number(e.target.value))}
            sx={fieldSx}
          >
            <MenuItem value="" sx={{ fontSize: "12.5px" }}>بدون تغيير</MenuItem>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: "12.5px" }}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="المقاس"
            size="small"
            fullWidth
            value={size}
            onChange={(e) => setSize(e.target.value)}
            sx={fieldSx}
          />
          <TextField
            label="اللون"
            size="small"
            fullWidth
            value={color}
            onChange={(e) => setColor(e.target.value)}
            sx={fieldSx}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 2 }}>
        <Button onClick={handleClose} disabled={isSaving} sx={{ fontFamily: FONT }}>
          إلغاء
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving} sx={{ color: "#fff", fontFamily: FONT }}>
          {isSaving ? "جارٍ الحفظ..." : "تأكيد"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
