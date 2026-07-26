import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import moment from "moment";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import type { ShipmentsMetaOption } from "query/shipmentsMeta";
import {
  useUpdateCustomerReturnMutation,
  type ReturnItem,
} from "query/shipmentsReturns";

const FONT = "'Cairo', sans-serif";

/** نفس مظهر الحقول في ShipmentEdit: زوايا 10px، نص 12px، إطار يتحوّل للـ accent عند التركيز. */
const inputSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: FONT,
    fontSize: "12px",
    bgcolor: HX.surface,
    height: "44px",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-input": { fontSize: "12px", fontFamily: FONT, color: "#000" },
  "& .MuiSelect-select.MuiSelect-select": {
    minHeight: "unset",
    height: "100%",
    boxSizing: "border-box",
    paddingTop: 0,
    paddingBottom: 0,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputLabel-root": {
    fontFamily: FONT,
    fontSize: "12px",
    color: "#000",
    "&.MuiInputLabel-shrink": { fontSize: "11px" },
    "&.Mui-focused": { color: HX.accent },
  },
} as const;

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const m = moment(d).locale("en");
  return m.isValid() ? m.format("YYYY-MM-DD") : "—";
}

/** سطر بيانات للقراءة فقط داخل بطاقة السياق. */
function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px", minWidth: 0 }}>
      <Box component="span" sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3, flexShrink: 0, minWidth: 72 }}>
        {label}
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: mono ? "monospace" : FONT,
          fontSize: mono ? "11px" : "12px",
          fontWeight: 600,
          color: HX.tx,
          minWidth: 0,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Box>
    </Box>
  );
}

/**
 * الحالة الحالية تأتي من الـ API كـ `status` (معرّف) عند توفّره، وإلا نستنتجها
 * من `statusLabel` بمطابقتها مع خيارات الـ meta — نفس المصدر الذي وُلّد منه النص.
 */
function resolveCurrentStatus(item: ReturnItem | null, options: ShipmentsMetaOption[]): number | "" {
  if (!item) return "";
  if (item.status != null && Number.isFinite(Number(item.status))) return Number(item.status);
  const match = options.find((o) => o.label === item.statusLabel);
  return match ? Number(match.value) : "";
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: ReturnItem | null;
  /** meta.customerReturnStatuses من useShipmentsMetaQuery */
  statusOptions: ShipmentsMetaOption[];
}

export default function EditCustomerReturnModal({ open, onClose, item, statusOptions }: Props) {
  const [status, setStatus] = useState<number | "">("");
  const updateMutation = useUpdateCustomerReturnMutation();

  const initialStatus = useMemo(
    () => resolveCurrentStatus(item, statusOptions),
    [item, statusOptions]
  );

  useEffect(() => {
    if (!open) return;
    setStatus(initialStatus);
  }, [open, item?.id, initialStatus]);

  const isPending = updateMutation.isPending;
  const isDirty = status !== "" && status !== initialStatus;

  const handleSave = () => {
    if (isPending || !item) return;
    if (status === "") {
      NotificationMeassage("error", "اختر حالة المرتجع");
      return;
    }
    updateMutation.mutate(
      { returnId: item.id, body: { status: Number(status) } },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          direction: "rtl",
          borderRadius: HX.r,
          fontFamily: FONT,
          bgcolor: HX.surface,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          px: "18px",
          py: "14px",
          borderBottom: `1px solid ${HX.border}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "9px",
            bgcolor: HX.accentLight,
            color: HX.accent,
            flexShrink: 0,
          }}
        >
          <AssignmentReturnOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: HX.tx, lineHeight: 1.3 }}>
            تعديل مرتجع العميل
          </Box>
          <Box sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx3 }}>
            {item?.orderNumber ? `طلب #${item.orderNumber}` : "—"}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isPending}
          sx={{ color: HX.tx3, p: "5px", "&:hover": { color: HX.tx } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: "18px", py: "16px !important" }}>
        {/* سياق المرتجع — للقراءة فقط */}
        <Box
          sx={{
            display: "grid",
            gap: "9px",
            bgcolor: HX.surface2,
            border: `0.5px solid ${HX.border}`,
            borderRadius: "10px",
            p: "12px",
            mb: "16px",
          }}
        >
          <InfoRow label="رقم العملية" value={item?.operationNumber ?? ""} mono />
          <InfoRow label="البائع" value={item?.sellerName ?? ""} />
          <InfoRow label="نوع الإرجاع" value={item?.returnTypeLabel ?? ""} />
          <InfoRow label="تاريخ الإرجاع" value={fmtDate(item?.returnDate)} />
          <InfoRow label="السبب" value={item?.reason ?? ""} />
          <InfoRow label="الحالة الحالية" value={item?.statusLabel ?? ""} />
        </Box>

        <TextField
          select
          fullWidth
          size="small"
          label="حالة المرتجع"
          sx={inputSx}
          InputLabelProps={{ shrink: true }}
          disabled={isPending || statusOptions.length === 0}
          value={status === "" ? "" : Number(status)}
          onChange={(e) => setStatus(Number(e.target.value))}
        >
          {statusOptions.map((o) => (
            <MenuItem key={o.value} value={Number(o.value)} sx={{ fontFamily: FONT, fontSize: "12px" }}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions sx={{ px: "18px", py: "13px", gap: "9px", borderTop: `1px solid ${HX.border}` }}>
        <Box
          component="button"
          type="button"
          onClick={onClose}
          disabled={isPending}
          sx={{
            display: "flex",
            alignItems: "center",
            px: "15px",
            height: 36,
            borderRadius: "9px",
            border: `1px solid ${HX.border2}`,
            bgcolor: HX.surface,
            color: HX.tx2,
            cursor: isPending ? "default" : "pointer",
            fontSize: "13px",
            fontFamily: FONT,
            fontWeight: 600,
            transition: ".15s",
            "&:hover": { bgcolor: HX.surface3, color: HX.tx },
          }}
        >
          إلغاء
        </Box>
        <Box
          component="button"
          type="button"
          onClick={handleSave}
          disabled={isPending || !isDirty}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            px: "18px",
            height: 36,
            borderRadius: "9px",
            border: "none",
            bgcolor: HX.accent,
            color: "#fff",
            cursor: isPending || !isDirty ? "default" : "pointer",
            opacity: isPending || !isDirty ? 0.55 : 1,
            fontSize: "13px",
            fontFamily: FONT,
            fontWeight: 700,
            transition: ".2s",
            "&:hover": { bgcolor: isPending || !isDirty ? HX.accent : "#4f46e5" },
          }}
        >
          {isPending ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : "حفظ التعديلات"}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
