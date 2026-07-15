/**
 * نافذة تعديل المورد — الحقول التي يقبلها الـ API:
 * البريد (للعرض فقط) · مدة الشحن (daysToDeliver) · كلمة المرور · الأونيت مانجر (accountManager)
 * · الحالة (تبديل فوري عبر endpoint منفصل).
 * قائمة الأونيت مانجر = نفس مستخدمي «المسؤولين» (/users) مع تسمية «الأونيت مانجر».
 */
import React, { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Dialog, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { userKeys } from "query/keys";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { toggleSx, statusBadgeSx, FONT } from "../utils/styles";
import { Vendor } from "../utils/types";

const controlSx = {
  height: 34, px: "11px", width: "100%", boxSizing: "border-box",
  border: `0.5px solid ${HX.border}`, borderRadius: "9px",
  fontSize: "13px", fontFamily: FONT, color: HX.tx, bgcolor: HX.surface,
  outline: "none", transition: ".15s",
  "&:focus": { borderColor: HX.accent, boxShadow: "0 0 0 3px rgba(99,102,241,.08)" },
  "&::placeholder": { color: HX.tx3 },
} as const;

const labelSx = { fontSize: "11.5px", fontWeight: 600, color: HX.tx2, fontFamily: FONT } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box component="label" sx={labelSx}>{label}</Box>
      {children}
    </Box>
  );
}

const rowSx = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "10px", mb: "12px" } as const;

export interface VendorEditPayload {
  daysToDeliver: string;
  password: string;
  accountManager: string;
}

interface VendorEditModalProps {
  open: boolean;
  vendor: Vendor | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (values: VendorEditPayload) => Promise<unknown>;
  onToggleStatus: (v: Vendor) => void;
}

export default function VendorEditModal({ open, vendor, isSaving, onClose, onSave, onToggleStatus }: VendorEditModalProps) {
  const [daysToDeliver, setDaysToDeliver] = useState("");
  const [password, setPassword] = useState("");
  const [accountManager, setAccountManager] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [active, setActive] = useState(false);

  /* قائمة الأونيت مانجر = مستخدمو /users (نفس مصدر «المسؤولين») */
  const { data: users = [] } = useQuery({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const { data } = await axiosRequest.get("/users");
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 60_000,
    enabled: open,
  });
  const amOptions = useMemo(
    () => users.map((u: any) => ({ value: String(u.id), label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || String(u.id) })),
    [users]
  );

  useEffect(() => {
    if (!open || !vendor) return;
    setShowPassword(false);
    setDaysToDeliver(vendor.daysToDeliver != null ? String(vendor.daysToDeliver) : "");
    setPassword("");
    setAccountManager(vendor.accountManager != null ? String(vendor.accountManager) : "");
    setActive(Boolean(vendor.active));
  }, [open, vendor]);

  const handleSave = () => {
    onSave({ daysToDeliver, password, accountManager })
      .then(() => onClose())
      .catch(() => { /* الخطأ يُعرض من طبقة الحفظ */ });
  };

  const handleToggle = () => {
    if (!vendor) return;
    setActive((a) => !a);
    onToggleStatus(vendor);
  };

  return (
    <Dialog open={open} onClose={onClose} dir="rtl"
      PaperProps={{ sx: { borderRadius: "16px", width: 560, maxWidth: "94vw", fontFamily: FONT } }}>
      {/* Head */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Typography sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>
          {vendor ? `تعديل: ${vendor.name ?? ""}` : "تعديل المورد"}
        </Typography>
        <IconButton onClick={onClose} aria-label="إغلاق"
          sx={{ width: 28, height: 28, borderRadius: "7px", border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx2,
            "&:hover": { bgcolor: HX.redLight, borderColor: HX.red, color: HX.red } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ p: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "7px", mb: "14px" }}>
          <Box sx={{ width: 26, height: 26, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: HX.accentLight, color: HX.accent }}>
            <StorefrontOutlinedIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: HX.tx3, letterSpacing: "1px", fontFamily: FONT }}>بيانات المورد</Typography>
        </Box>

        <Box sx={rowSx}>
          <Field label="البريد الإلكتروني">
            <Box component="input" value={vendor?.user?.email ?? ""} readOnly
              sx={{ ...controlSx, bgcolor: HX.surface2, color: HX.tx2 }} />
          </Field>
          <Field label="مدة الشحن (بالأيام)">
            <Box component="input" type="number" value={daysToDeliver} placeholder="مثال: 3"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDaysToDeliver(e.target.value)} sx={controlSx} />
          </Field>
        </Box>

        <Box sx={rowSx}>
          <Field label="كلمة المرور">
            <Box sx={{ position: "relative" }}>
              <Box component="input" type={showPassword ? "text" : "password"} value={password} placeholder="اتركها فارغة لعدم التغيير"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                sx={{ ...controlSx, paddingInlineEnd: "38px" }} />
              <Box component="button" type="button" onClick={() => setShowPassword((p) => !p)} aria-label="إظهار كلمة المرور"
                sx={{ position: "absolute", insetInlineEnd: "8px", top: 0, height: "100%", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: HX.tx3, p: 0, "&:hover": { color: HX.accent } }}>
                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
              </Box>
            </Box>
          </Field>
          <Field label="الأونيت مانجر">
            <Box component="select" value={accountManager}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAccountManager(e.target.value)}
              sx={{ ...controlSx, cursor: "pointer", color: accountManager ? HX.tx : HX.tx3 }}>
              <option value="">اختر الأونيت مانجر</option>
              {amOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </Box>
          </Field>
        </Box>

        {/* الحالة */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "10px 12px", border: `0.5px solid ${HX.border}`, borderRadius: "9px", bgcolor: HX.surface2 }}>
          <Box component="span" sx={labelSx}>الحالة</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Box component="span" sx={statusBadgeSx(active)}>{active ? "نشط" : "غير نشط"}</Box>
            <Box component="button" type="button" aria-label="تبديل الحالة" onClick={handleToggle} sx={toggleSx(active)} />
          </Box>
        </Box>
      </Box>

      {/* Foot */}
      <Box sx={{ p: "14px 20px", borderTop: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <Box component="button" type="button" onClick={onClose}
          sx={{ px: "14px", height: 34, border: `0.5px solid ${HX.border}`, borderRadius: "8px", fontSize: "12px", fontWeight: 600, fontFamily: FONT, cursor: "pointer", bgcolor: "transparent", color: HX.tx2, "&:hover": { borderColor: HX.red, color: HX.red } }}>
          إلغاء
        </Box>
        <Box component="button" type="button" onClick={handleSave} disabled={isSaving}
          sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "18px", height: 34, border: "none", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, fontFamily: FONT, cursor: isSaving ? "default" : "pointer", bgcolor: HX.accent, color: "#fff", opacity: isSaving ? 0.7 : 1, "&:hover": { bgcolor: "#5254e0" }, "& svg": { fontSize: 16 } }}>
          {isSaving ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <CheckIcon />} حفظ المورد
        </Box>
      </Box>
    </Dialog>
  );
}
