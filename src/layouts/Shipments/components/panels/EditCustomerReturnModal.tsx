import React, { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Dialog, IconButton, MenuItem, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import moment from "moment";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import type { ShipmentsMetaOption } from "query/shipmentsMeta";
import {
  useUpdateCustomerReturnMutation,
  useUpdateVendorReturnMutation,
  type ReturnItem,
  type UpdateCustomerReturnPayload,
} from "query/shipmentsReturns";

const FONT = "'Cairo', sans-serif";

/**
 * ملاحظة RTL — مهمّة: كل ما يمرّ عبر `sx` يعبر stylis-plugin-rtl (cssjanus) فتُقلب
 * الخصائص الفيزيائية. لذلك:
 *   direction: "rtl"        -> يصبح ltr   (فينقلب الحوار كلّه)
 *   textAlign: "right"      -> يصبح left  (فتُحاذى الحقول يساراً)
 *   transformOrigin: "top right" -> top left
 * الاتجاه يُضبط عبر السمة dir="rtl" على <Dialog> (سمة HTML لا يمسّها المحوّل)،
 * و theme.direction = "rtl" يجعل MUI يُخرج CSS صحيحاً للـ RTL من نفسه — فلا
 * نضيف محاذاة يدوية هنا. عند الحاجة لمحاذاة صريحة استخدم "start"/"end" فقط،
 * أو inline style الذي لا يمرّ على emotion.
 */

/** نفس مظهر الحقول في ShipmentEdit: زوايا 10px، نص 12px، إطار يتحوّل للـ accent عند التركيز. */
const inputSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: FONT,
    fontSize: "12px",
    bgcolor: HX.surface,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-input": { fontSize: "12px", fontFamily: FONT, color: "#000" },
  // ارتفاع واحد لكل الحقول أحادية السطر (يستثني السبب متعدد الأسطر)
  "& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)": { height: "44px" },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
    height: "100%",
    boxSizing: "border-box",
    paddingTop: 0,
    paddingBottom: 0,
  },
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

/** يمنع محرّك الـ bidi من إعادة ترتيب الأرقام/الأكواد اللاتينية داخل نص عربي. */
const plainDigits = { unicodeBidi: "plaintext" } as const;

const fieldBaseProps = {
  fullWidth: true,
  size: "small" as const,
  sx: inputSx,
  InputLabelProps: { shrink: true },
} as const;

/** التاريخ يُخزَّن كمنتصف ليل UTC، فنقرأه ونكتبه بـ UTC حتى لا يزحف يوماً. */
function toYmd(raw: unknown): string {
  if (!raw) return "";
  const m = moment.utc(raw as string);
  return m.isValid() ? m.format("YYYY-MM-DD") : "";
}

/** "YYYY-MM-DD" -> "2026-05-18T00:00:00.000Z" */
function toIsoUtc(ymd: string): string | undefined {
  if (!ymd) return undefined;
  const m = moment.utc(ymd, "YYYY-MM-DD", true);
  return m.isValid() ? m.toISOString() : undefined;
}

/** سطر بيانات للقراءة فقط داخل بطاقة السياق. */
function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px", minWidth: 0 }}>
      <Box component="span" sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3, flexShrink: 0, minWidth: 78 }}>
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
          ...(mono ? plainDigits : {}),
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

/**
 * orderId يأتي من القائمة عند توفّره، وإلا نقبل orderNumber فقط إذا كان أرقاماً خالصة.
 * لا نستخرج أرقاماً من نص مثل "SH-2026-9802" — قد يُنتج معرّفاً لطلب آخر.
 */
function resolveOrderId(item: ReturnItem | null): number | undefined {
  if (!item) return undefined;
  if (item.orderId != null && Number.isFinite(Number(item.orderId))) return Number(item.orderId);
  const raw = String(item.orderNumber ?? "").trim();
  if (!/^\d+$/.test(raw)) return undefined;
  const n = Number(raw);
  return n > 0 ? n : undefined;
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: ReturnItem | null;
  /** meta.customerReturnStatuses أو meta.vendorReturnStatuses من useShipmentsMetaQuery */
  statusOptions: ShipmentsMetaOption[];
  /** أي قائمة مرتجعات نُحرّر — يحدّد نقطة النهاية المستخدمة */
  returnKind?: "customer" | "vendor";
}

export default function EditCustomerReturnModal({
  open,
  onClose,
  item,
  statusOptions,
  returnKind = "customer",
}: Props) {
  const [status, setStatus] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // كلا الـ hookين يُستدعى دائماً (قواعد الـ hooks) ونستخدم المناسب منهما فقط.
  const customerMutation = useUpdateCustomerReturnMutation();
  const vendorMutation = useUpdateVendorReturnMutation();
  const updateMutation = returnKind === "vendor" ? vendorMutation : customerMutation;

  const initial = useMemo(
    () => ({
      status: resolveCurrentStatus(item, statusOptions),
      reason: item?.reason ?? "",
      returnDate: toYmd(item?.returnDate),
    }),
    [item, statusOptions]
  );

  // التبعيات قيم أوّلية لا كائن `initial` — هويّة الكائن تتغيّر كل render
  // (statusOptions يصل كمصفوفة جديدة أثناء تحميل الـ meta) فيُعاد ضبط ما كتبه المستخدم.
  useEffect(() => {
    if (!open) return;
    setStatus(initial.status);
    setReason(initial.reason);
    setReturnDate(initial.returnDate);
  }, [open, item?.id, initial.status, initial.reason, initial.returnDate]);

  const isPending = updateMutation.isPending;
  const isDirty =
    status !== initial.status ||
    reason.trim() !== initial.reason.trim() ||
    returnDate !== initial.returnDate;

  const handleSave = () => {
    if (isPending || !item) return;
    if (status === "") {
      NotificationMeassage("error", "اختر حالة المرتجع");
      return;
    }

    // نرسل السبب دائماً — تفريغه من المستخدم نيّة مقصودة لمحوه
    const body: UpdateCustomerReturnPayload = { status: Number(status), reason: reason.trim() };
    const orderId = resolveOrderId(item);
    if (orderId != null) body.orderId = orderId;
    const iso = toIsoUtc(returnDate);
    if (iso) body.returnDate = iso;

    updateMutation.mutate({ returnId: item.id, body }, { onSuccess: onClose });
  };

  const canSave = !isPending && isDirty && status !== "";

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      dir="rtl"
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: HX.r, fontFamily: FONT, bgcolor: HX.surface } }}
    >
      {/* الرأس — العنوان يمين، زر الإغلاق يسار */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          p: "14px 18px",
          borderBottom: `1px solid ${HX.border}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
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
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: HX.tx, lineHeight: 1.3 }}>
              {returnKind === "vendor" ? "تعديل مرتجع المورد" : "تعديل مرتجع العميل"}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx3, ...plainDigits }}>
              {item?.orderNumber ? `طلب #${item.orderNumber}` : "—"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isPending}
          aria-label="إغلاق"
          sx={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            border: `0.5px solid ${HX.border2}`,
            bgcolor: HX.surface2,
            color: HX.tx2,
            flexShrink: 0,
            "&:hover": { bgcolor: HX.redLight, borderColor: HX.red, color: HX.red },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* الجسم */}
      <Box sx={{ p: "16px 18px" }}>
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
          <InfoRow label="الحالة الحالية" value={item?.statusLabel ?? ""} />
        </Box>

        <Box sx={{ display: "grid", gap: "14px" }}>
          <TextField
            {...fieldBaseProps}
            select
            label="حالة المرتجع"
            disabled={isPending || statusOptions.length === 0}
            value={status === "" ? "" : Number(status)}
            onChange={(e) => setStatus(Number(e.target.value))}
            // القائمة تُعرض في portal على <body> — dir سمة HTML لا يقلبها المحوّل
            SelectProps={{ MenuProps: { PaperProps: { dir: "rtl", sx: { fontFamily: FONT } } } }}
          >
            {statusOptions.map((o) => (
              <MenuItem key={o.value} value={Number(o.value)} sx={{ fontFamily: FONT, fontSize: "12px", justifyContent: "flex-start" }}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            {...fieldBaseProps}
            type="date"
            label="تاريخ الإرجاع"
            disabled={isPending}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />

          <TextField
            {...fieldBaseProps}
            multiline
            minRows={3}
            label="سبب الإرجاع"
            placeholder="مثال: منتج تالف"
            disabled={isPending}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Box>
      </Box>

      {/* التذييل — الأزرار يسار */}
      <Box
        sx={{
          p: "13px 18px",
          borderTop: `1px solid ${HX.border}`,
          bgcolor: HX.surface2,
          display: "flex",
          justifyContent: "flex-end",
          gap: "9px",
        }}
      >
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
            "&:hover": { borderColor: HX.red, color: HX.red },
          }}
        >
          إلغاء
        </Box>
        <Box
          component="button"
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            px: "18px",
            height: 36,
            borderRadius: "9px",
            border: "none",
            bgcolor: HX.accent,
            color: "#fff",
            cursor: canSave ? "pointer" : "default",
            opacity: canSave ? 1 : 0.55,
            fontSize: "13px",
            fontFamily: FONT,
            fontWeight: 700,
            transition: ".2s",
            "&:hover": { bgcolor: canSave ? "#4f46e5" : HX.accent },
            "& svg": { fontSize: 16 },
          }}
        >
          {isPending ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <CheckIcon />}
          حفظ التعديلات
        </Box>
      </Box>
    </Dialog>
  );
}
