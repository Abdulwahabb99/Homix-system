/**
 * تعديل حالة المحاسبة لعدة تسليمات محددة دفعة واحدة.
 * نافذة منفصلة عن EditDeliveryAccountModal (تعديل واحد) حتى لا يتغيّر شيء
 * بضغطة واحدة بالخطأ، ولتوضيح أن التعديل سيطال كل السجلات المحددة.
 */
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useBulkUpdateDeliveryAccountsMutation } from "query/shipmentsAccounts";
import type { ShipmentsMetaOption } from "query/shipmentsMeta";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12px", fontFamily: FONT },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "12px" },
} as const;

interface Props {
  open: boolean;
  onClose: () => void;
  orderIds: number[];
  statusOptions: ShipmentsMetaOption[];
}

export default function BulkEditDeliveryAccountModal({ open, onClose, orderIds, statusOptions }: Props) {
  const [accountingStatus, setAccountingStatus] = useState<number | "">("");
  const [accountingDate, setAccountingDate] = useState("");
  const [accountingReference, setAccountingReference] = useState("");

  const bulkUpdateMutation = useBulkUpdateDeliveryAccountsMutation();

  const reset = () => {
    setAccountingStatus("");
    setAccountingDate("");
    setAccountingReference("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (accountingStatus === "") return;

    const body = {
      accountingReference: accountingReference.trim(),
      accountingStatus: Number(accountingStatus),
      ...(accountingDate ? { accountingDate: new Date(accountingDate).toISOString() } : {}),
    };

    bulkUpdateMutation.mutate(
      {
        body,
        orderIds,
      },
      { onSuccess: handleClose }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={bulkUpdateMutation.isPending ? undefined : handleClose}
      dir="rtl"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 700 }}>
        تعديل حالة المحاسبة للسجلات المحددة
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          سيُطبَّق التعديل على {orderIds.length} سجل محدد.
        </Typography>

        <TextField
          select
          label="حالة المحاسبة"
          size="small"
          fullWidth
          value={accountingStatus}
          onChange={(e) => setAccountingStatus(Number(e.target.value))}
          sx={{ ...fieldSx, mb: 2 }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={Number(option.value)} sx={{ fontSize: "12px" }}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="تاريخ المحاسبة (اختياري)"
          type="date"
          size="small"
          fullWidth
          value={accountingDate}
          onChange={(e) => setAccountingDate(e.target.value)}
          helperText="اتركه فارغًا لاستخدام تاريخ التحويل تلقائيًا"
          InputLabelProps={{ shrink: true }}
          sx={{ ...fieldSx, mb: 2 }}
        />

        <TextField
          label="المرجع"
          size="small"
          fullWidth
          value={accountingReference}
          onChange={(e) => setAccountingReference(e.target.value)}
          sx={fieldSx}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={bulkUpdateMutation.isPending}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={bulkUpdateMutation.isPending || accountingStatus === ""}
          sx={{ color: "#fff" }}
        >
          {bulkUpdateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
