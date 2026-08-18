/**
 * تعديل مصروف واحد — النوع، التكلفة، السبب، وحالة/تاريخ المحاسبة.
 * نافذة منفصلة عن الجدول حتى لا يتغيّر شيء بضغطة واحدة بالخطأ.
 */
import React, { useEffect, useState } from "react";
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
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { useUpdateExpenseMutation, type ExpenseItem } from "query/shipmentsAccounts";
import type { ShipmentsMetaOption } from "query/shipmentsMeta";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12px", fontFamily: FONT },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "12px" },
} as const;

function toYmd(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: ExpenseItem | null;
  typeOptions: ShipmentsMetaOption[];
  statusOptions: ShipmentsMetaOption[];
}

export default function EditExpenseModal({ open, onClose, item, typeOptions, statusOptions }: Props) {
  const [type, setType] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [accountingStatus, setAccountingStatus] = useState<number | "">("");
  const [accountingDate, setAccountingDate] = useState("");

  const updateMutation = useUpdateExpenseMutation();

  useEffect(() => {
    if (!open || !item) return;
    setType(item.type ?? "");
    setAmount(String(item.amount ?? ""));
    setReason(item.reason ?? "");
    setAccountingStatus(item.accountingStatus ?? "");
    setAccountingDate(toYmd(item.accountingDate));
  }, [open, item]);

  const handleSave = () => {
    if (!item) return;
    if (type === "") {
      NotificationMeassage("error", "اختر نوع المصروف");
      return;
    }
    if (!reason.trim()) {
      NotificationMeassage("error", "اكتب سبب المصروف");
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      NotificationMeassage("error", "أدخل تكلفة صحيحة");
      return;
    }

    updateMutation.mutate(
      {
        body: {
          accountingDate: accountingDate ? new Date(accountingDate).toISOString() : null,
          ...(accountingStatus !== "" ? { accountingStatus: Number(accountingStatus) } : {}),
          amount: numericAmount,
          reason: reason.trim(),
          type: Number(type),
        },
        expenseId: item.id,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={updateMutation.isPending ? undefined : onClose}
      dir="rtl"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 700 }}>
        تعديل المصروف
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          {item?.reason}
        </Typography>

        <TextField
          select
          label="نوع المصروف"
          size="small"
          fullWidth
          value={type}
          onChange={(e) => setType(Number(e.target.value))}
          sx={{ ...fieldSx, mb: 2 }}
        >
          {typeOptions.map((option) => (
            <MenuItem key={option.value} value={Number(option.value)} sx={{ fontSize: "12px" }}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="تكلفة المصروف (ج.م)"
          type="number"
          size="small"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{ min: 0, step: "0.01" }}
          sx={{ ...fieldSx, mb: 2 }}
        />

        <TextField
          label="سبب المصروف"
          size="small"
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ ...fieldSx, mb: 2 }}
        />

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
        <Button onClick={onClose} disabled={updateMutation.isPending}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          sx={{ color: "#fff" }}
        >
          {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
