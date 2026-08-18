/**
 * تعديل حالة المحاسبة لعدة مصروفات محددة دفعة واحدة.
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
import { useBulkUpdateExpensesMutation } from "query/shipmentsAccounts";
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
  expenseIds: number[];
  statusOptions: ShipmentsMetaOption[];
}

export default function BulkEditExpenseModal({ open, onClose, expenseIds, statusOptions }: Props) {
  const [accountingStatus, setAccountingStatus] = useState<number | "">("");
  const [accountingDate, setAccountingDate] = useState("");

  const bulkUpdateMutation = useBulkUpdateExpensesMutation();

  const reset = () => {
    setAccountingStatus("");
    setAccountingDate("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (accountingStatus === "") return;

    bulkUpdateMutation.mutate(
      {
        body: {
          ...(accountingDate ? { accountingDate: new Date(accountingDate).toISOString() } : {}),
          accountingStatus: Number(accountingStatus),
        },
        expenseIds,
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
        تعديل حالة المحاسبة للمصروفات المحددة
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          سيُطبَّق التعديل على {expenseIds.length} مصروف محدد.
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
          label="تاريخ المحاسبة"
          type="date"
          size="small"
          fullWidth
          value={accountingDate}
          onChange={(e) => setAccountingDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
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
