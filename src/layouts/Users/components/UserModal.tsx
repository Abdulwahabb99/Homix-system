/**
 * نافذة إضافة/تعديل مستخدم — بأسلوب modal التصميم (عناوين فوق الحقول، حقول native
 * مطابقة لـ .minput/.mselect). بالحقول التي يدعمها الـ API فقط: الاسم/البريد/كلمة المرور/الدور.
 */
import React, { useEffect, useState } from "react";
import { Box, Dialog, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { USER_TYPES_VALUES } from "shared/utils/constants";
import { userKeys } from "query/keys";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../utils/styles";
import { AppUser } from "../utils/types";

/* حقل مطابق لـ .minput / .mselect في التصميم */
const controlSx = {
  height: 34, px: "11px", width: "100%", boxSizing: "border-box",
  border: `0.5px solid ${HX.border}`, borderRadius: "9px",
  fontSize: "13px", fontFamily: FONT, color: HX.tx, bgcolor: HX.surface,
  outline: "none", transition: ".15s",
  "&:focus": { borderColor: HX.accent, boxShadow: "0 0 0 3px rgba(99,102,241,.08)" },
  "&::placeholder": { color: HX.tx3 },
} as const;

const labelSx = { fontSize: "11.5px", fontWeight: 600, color: HX.tx2, fontFamily: FONT } as const;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box component="label" sx={labelSx}>
        {label}{required && <Box component="span" sx={{ color: HX.red }}> *</Box>}
      </Box>
      {children}
    </Box>
  );
}

const rowSx = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "10px", mb: "12px" } as const;

interface UserModalProps {
  open: boolean;
  /** المستخدم عند التعديل، أو null عند الإضافة */
  editUser: AppUser | null;
  onClose: () => void;
}

export default function UserModal({ open, editUser, onClose }: UserModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(editUser);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // تعبئة الحقول عند الفتح (للتعديل نجلب السجل لأخذ كلمة المرور الحالية كما في السلوك السابق)
  useEffect(() => {
    if (!open) return;
    setShowPassword(false);
    if (editUser) {
      setFirstName(String(editUser.firstName ?? ""));
      setLastName(String(editUser.lastName ?? ""));
      setEmail(String(editUser.email ?? ""));
      setUserType(String(editUser.userType ?? ""));
      setPassword("");
      axiosRequest
        .get(`/users/${editUser.id}`)
        .then(({ data }) => { if (data?.data?.password != null) setPassword(String(data.data.password)); })
        .catch(() => { /* التعبئة الأساسية كافية */ });
    } else {
      setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setUserType("");
    }
  }, [open, editUser]);

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      isEdit
        ? axiosRequest.put(`/users/${editUser!.id}`, payload)
        : axiosRequest.post(`/users`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      NotificationMeassage("success", isEdit ? "تم تعديل المستخدم بنجاح" : "تم اضافة مستخدم بنجاح");
      onClose();
    },
    onError: () => NotificationMeassage("error", "حدث خطأ"),
  });

  const handleSave = () => {
    if (!firstName.trim()) { NotificationMeassage("error", "الاسم مطلوب"); return; }
    if (!email.trim()) { NotificationMeassage("error", "البريد الإلكتروني مطلوب"); return; }
    if (!userType) { NotificationMeassage("error", "الدور مطلوب"); return; }
    saveMutation.mutate({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, userType });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dir="rtl"
      PaperProps={{ sx: { borderRadius: "16px", width: 560, maxWidth: "94vw", fontFamily: FONT } }}
    >
      {/* Head */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Typography sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>
          {isEdit ? `تعديل: ${`${firstName} ${lastName}`.trim()}` : "إضافة مستخدم جديد"}
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
            <PersonOutlineIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: HX.tx3, letterSpacing: "1px", fontFamily: FONT }}>
            البيانات الأساسية
          </Typography>
        </Box>

        <Box sx={rowSx}>
          <Field label="الاسم الأول" required>
            <Box component="input" value={firstName} placeholder="الاسم الأول"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} sx={controlSx} />
          </Field>
          <Field label="اسم العائلة">
            <Box component="input" value={lastName} placeholder="اسم العائلة"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)} sx={controlSx} />
          </Field>
        </Box>

        <Box sx={rowSx}>
          <Field label="البريد الإلكتروني" required>
            <Box component="input" type="email" value={email} placeholder="user@homix.com"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} sx={controlSx} />
          </Field>
          <Field label="كلمة المرور" required>
            <Box sx={{ position: "relative" }}>
              <Box component="input" type={showPassword ? "text" : "password"} value={password} placeholder="••••••••"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                sx={{ ...controlSx, paddingInlineEnd: "38px" }} />
              <Box component="button" type="button" onClick={() => setShowPassword((p) => !p)} aria-label="إظهار كلمة المرور"
                sx={{ position: "absolute", insetInlineEnd: "8px", top: 0, height: "100%", display: "flex", alignItems: "center",
                  border: "none", background: "transparent", cursor: "pointer", color: HX.tx3, p: 0, "&:hover": { color: HX.accent } }}>
                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
              </Box>
            </Box>
          </Field>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "10px" }}>
          <Field label="الدور" required>
            <Box component="select" value={userType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserType(e.target.value)}
              sx={{ ...controlSx, cursor: "pointer", color: userType ? HX.tx : HX.tx3 }}>
              <option value="">اختر الدور</option>
              {USER_TYPES_VALUES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Box>
          </Field>
        </Box>
      </Box>

      {/* Foot */}
      <Box sx={{ p: "14px 20px", borderTop: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <Box component="button" type="button" onClick={onClose}
          sx={{ px: "14px", height: 32, border: `0.5px solid ${HX.border}`, borderRadius: "8px", fontSize: "12px", fontWeight: 600, fontFamily: FONT, cursor: "pointer", bgcolor: "transparent", color: HX.tx2, "&:hover": { borderColor: HX.red, color: HX.red } }}>
          إلغاء
        </Box>
        <Box component="button" type="button" onClick={handleSave}
          sx={{ display: "inline-flex", alignItems: "center", gap: "5px", px: "18px", height: 32, border: "none", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, fontFamily: FONT, cursor: "pointer", bgcolor: HX.accent, color: "#fff", opacity: saveMutation.isPending ? 0.7 : 1, "&:hover": { bgcolor: "#5254e0" }, "& svg": { fontSize: 15 } }}>
          <CheckIcon /> حفظ المستخدم
        </Box>
      </Box>
    </Dialog>
  );
}
