/**
 * تعديل بيانات المحاسبة لتسليم واحد: الحالة، المبلغ المستلم، سعر التكلفة، والمرجع.
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

/** رقم غير سالب، أو `null` حين لا تصلح القيمة. */
function parseAmount(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

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
  const [receivedAmount, setReceivedAmount] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [reference, setReference] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateMutation = useUpdateDeliveryAccountMutation();
  const uploadReferenceMutation = useUploadDeliveryAccountReferenceMutation();

  useEffect(() => {
    if (!open || !item) return;
    setAccountingStatus(item.accountingStatus ?? "");
    setReceivedAmount(item.receivedAmount != null ? String(item.receivedAmount) : "");
    setCostPrice(item.costPrice != null ? String(item.costPrice) : "");
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

    const parsedReceivedAmount = parseAmount(receivedAmount);
    if (receivedAmount.trim() !== "" && parsedReceivedAmount === null) {
      NotificationMeassage("error", "المبلغ المستلم لازم يكون رقمًا صحيحًا غير سالب");
      return;
    }

    const parsedCostPrice = parseAmount(costPrice);
    if (costPrice.trim() !== "" && parsedCostPrice === null) {
      NotificationMeassage("error", "سعر التكلفة لازم يكون رقمًا صحيحًا غير سالب");
      return;
    }

    // تاريخ المحاسبة بيتحدد أوتوماتيك مع تغيير الحالة في الباك إند — مفيش إدخال يدوي له.
    updateMutation.mutate(
      {
        orderId: item.id,
        body: {
          accountingStatus: Number(accountingStatus),
          /* تُرسل فقط عند تغيّرها فعلاً — إرسال نفس الرقم يعلّم الحقل «معدَّل يدوياً»
             في الباك إند بلا سبب. */
          ...(parsedReceivedAmount !== null && parsedReceivedAmount !== item.receivedAmount
            ? { receivedAmount: parsedReceivedAmount }
            : {}),
          ...(parsedCostPrice !== null && parsedCostPrice !== item.costPrice
            ? { costPrice: parsedCostPrice }
            : {}),
        },
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
        تعديل بيانات المحاسبة
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

        {isAdmin && (
          <Box sx={{ display: "flex", gap: "10px", mb: 2 }}>
            <TextField
              label="المبلغ المستلم"
              size="small"
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              helperText={`المطلوب تحصيله ${Number(item?.amountToCollect ?? 0).toLocaleString("en-US")} ج.م`}
              sx={fieldSx}
            />
            <TextField
              label="سعر التكلفة"
              size="small"
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              sx={fieldSx}
            />
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
