/**
 * تعديل حالة المحاسبة لتسليم واحد.
 * التعديل داخل نافذة وليس داخل الجدول حتى لا يتغيّر شيء بضغطة واحدة بالخطأ.
 */
import React, { useEffect, useRef, useState } from "react";
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
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import {
  useUpdateDeliveryAccountMutation,
  useUploadDeliveryAccountReferenceMutation,
  type DeliveryAccountItem,
} from "query/shipmentsAccounts";
import type { ShipmentsMetaOption } from "query/shipmentsMeta";
import {
  deliveryAccountReferenceHref,
  isDeliveryAccountAttachment,
} from "./deliveryAccountReference";

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
  const [reference, setReference] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateMutation = useUpdateDeliveryAccountMutation();
  const uploadReferenceMutation = useUploadDeliveryAccountReferenceMutation();

  useEffect(() => {
    if (!open || !item) return;
    setAccountingStatus(item.accountingStatus ?? "");
    setAccountingDate(toYmd(item.accountingDate));
    setReference(item.reference ?? "");
  }, [open, item]);

  const handleSave = () => {
    if (!item) return;
    if (accountingStatus === "") {
      NotificationMeassage("error", "اختر حالة المحاسبة");
      return;
    }

    const body = { accountingStatus: Number(accountingStatus) } as {
      accountingDate?: string | null;
      accountingStatus: number;
    };
    const initialAccountingDate = toYmd(item.accountingDate);
    if (accountingDate !== initialAccountingDate) {
      body.accountingDate = accountingDate ? new Date(accountingDate).toISOString() : null;
    }

    updateMutation.mutate(
      {
        orderId: item.id,
        body,
      },
      { onSuccess: onClose }
    );
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!item || !file) return;
    uploadReferenceMutation.mutate(
      { orderId: item.id, file },
      { onSuccess: (path) => setReference(path) }
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
          helperText="يُسجَّل تلقائيًا عند التحويل إلى تمت التصفية، ويمكن تعديله يدويًا"
          InputLabelProps={{ shrink: true }}
          sx={{ ...fieldSx, mb: 2 }}
        />

        <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: "text.secondary", mb: "6px" }}>
          المرجع
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: 1 }}>
          {reference ? (
            isDeliveryAccountAttachment(reference) ? (
              <Button
                size="small"
                variant="outlined"
                href={deliveryAccountReferenceHref(reference)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontFamily: FONT, fontSize: "11.5px", textTransform: "none" }}
              >
                فتح المرفق الحالي
              </Button>
            ) : (
              <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: "text.secondary" }}>
                {reference}
              </Typography>
            )
          ) : (
            <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: "text.disabled" }}>
              لا يوجد مرفق
            </Typography>
          )}
          <Button
            size="small"
            variant="text"
            startIcon={<AttachFileOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadReferenceMutation.isPending}
            sx={{ fontFamily: FONT, fontSize: "11.5px", textTransform: "none", mr: "auto" }}
          >
            {uploadReferenceMutation.isPending ? "جارٍ الرفع..." : reference ? "استبدال المرفق" : "رفع مرفق"}
          </Button>
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          hidden
          onChange={handleFileSelected}
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
