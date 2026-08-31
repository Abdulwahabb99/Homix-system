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

interface Props {
  open: boolean;
  onClose: () => void;
  item: DeliveryAccountItem | null;
  statusOptions: ShipmentsMetaOption[];
  /** تغيير حالة المحاسبة مقصور على الأدمن — الباقي (المرجع) متاح للجميع. */
  isAdmin: boolean;
}

export default function EditDeliveryAccountModal({ open, onClose, item, statusOptions, isAdmin }: Props) {
  const [accountingStatus, setAccountingStatus] = useState<number | "">("");
  const [reference, setReference] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateMutation = useUpdateDeliveryAccountMutation();
  const uploadReferenceMutation = useUploadDeliveryAccountReferenceMutation();

  useEffect(() => {
    if (!open || !item) return;
    setAccountingStatus(item.accountingStatus ?? "");
    setReference(item.reference ?? "");
  }, [open, item]);

  const currentStatusLabel = statusOptions.find((o) => Number(o.value) === Number(accountingStatus))?.label
    ?? item?.accountingStatusLabel
    ?? "—";

  const handleSave = () => {
    if (!item) return;
    if (accountingStatus === "") {
      NotificationMeassage("error", "اختر حالة المحاسبة");
      return;
    }

    // تاريخ المحاسبة بيتحدد أوتوماتيك مع تغيير الحالة في الباك إند — مفيش إدخال يدوي له.
    updateMutation.mutate(
      { orderId: item.id, body: { accountingStatus: Number(accountingStatus) } },
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

        {isAdmin ? (
          <TextField
            select
            label="حالة المحاسبة"
            size="small"
            fullWidth
            value={accountingStatus}
            onChange={(e) => setAccountingStatus(Number(e.target.value))}
            helperText="تاريخ المحاسبة يُسجَّل أوتوماتيك مع تغيير الحالة"
            sx={{ ...fieldSx, mb: 2 }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={Number(option.value)} sx={{ fontSize: "12px" }}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: "text.secondary", mb: "4px" }}>
              حالة المحاسبة
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700 }}>
              {currentStatusLabel}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: "text.disabled", mt: "2px" }}>
              تغيير الحالة متاح للأدمن فقط
            </Typography>
          </Box>
        )}

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
          {isAdmin ? "إلغاء" : "إغلاق"}
        </Button>
        {isAdmin && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            sx={{ color: "#fff" }}
          >
            {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
