/**
 * تعديل حالة المحاسبة لتسليم واحد.
 * التعديل داخل نافذة وليس داخل الجدول حتى لا يتغيّر شيء بضغطة واحدة بالخطأ.
 */
import React, { useEffect, useState } from "react";
import {
  Box,
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
import {
  useUpdateDeliveryAccountMutation,
  type DeliveryAccountItem,
} from "query/shipmentsAccounts";
import type { ShipmentsMetaOption } from "query/shipmentsMeta";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12px", fontFamily: FONT },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "12px" },
} as const;

/** "2026-04-14T..." -> "2026-04-14" لحقل التاريخ */
function toYmd(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: DeliveryAccountItem | null;
  statusOptions: ShipmentsMetaOption[];
}

export default function EditDeliveryAccountModal({ open, onClose, item, statusOptions }: Props) {
  const [accountingStatus, setAccountingStatus] = useState<number | "">("");
  const [accountingDate, setAccountingDate] = useState("");
  const [accountingReference, setAccountingReference] = useState("");

  const updateMutation = useUpdateDeliveryAccountMutation();

  useEffect(() => {
    if (!open || !item) return;
    setAccountingStatus(item.accountingStatus ?? "");
    setAccountingDate(toYmd(item.accountingDate));
    setAccountingReference(item.reference ?? "");
  }, [open, item]);

  const handleSave = () => {
    if (!item) return;
    if (accountingStatus === "") {
      NotificationMeassage("error", "اختر حالة المحاسبة");
      return;
    }

    updateMutation.mutate(
      {
        orderId: item.id,
        body: {
          accountingDate: accountingDate ? new Date(accountingDate).toISOString() : null,
          accountingReference: accountingReference.trim(),
          accountingStatus: Number(accountingStatus),
        },
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
        تعديل حالة المحاسبة
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          طلب #{item?.orderNumber} · عملية {item?.operationNumber}
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
