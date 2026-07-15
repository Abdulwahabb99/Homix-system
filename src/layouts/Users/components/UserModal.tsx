/**
 * نافذة إضافة/تعديل مستخدم — بأسلوب modal التصميم، لكن بالحقول التي يدعمها الـ API فقط
 * (الاسم/البريد/كلمة المرور/الدور). لا مصفوفة صلاحيات (غير مدعومة من الـ BE).
 */
import React, { useEffect, useState } from "react";
import {
  Box, Dialog, FormControl, Grid, IconButton, InputAdornment, InputLabel,
  MenuItem, Select, TextField, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { USER_TYPES_VALUES } from "shared/utils/constants";
import { userKeys } from "query/keys";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../utils/styles";
import { AppUser } from "../utils/types";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9px", fontFamily: FONT, fontSize: "13px", bgcolor: HX.surface,
    "& fieldset": { borderColor: HX.border },
    "&:hover fieldset": { borderColor: HX.accent },
    "&.Mui-focused fieldset": { borderColor: HX.accent, borderWidth: "1px" },
  },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "13px", color: HX.tx2 },
  "& .MuiInputLabel-root.Mui-focused": { color: HX.accent },
  "& .MuiInputBase-input": { fontFamily: FONT, color: HX.tx },
} as const;

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

  // تعبئة الحقول عند الفتح (للتعديل نجلب السجل لأخذ كلمة المرور الحالية كما في الصفحة القديمة)
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
        <Box sx={{ display: "flex", alignItems: "center", gap: "7px", mb: "12px" }}>
          <Box sx={{ width: 26, height: 26, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: HX.accentLight, color: HX.accent }}>
            <PersonOutlineIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: HX.tx3, letterSpacing: "1px", fontFamily: FONT }}>
            البيانات الأساسية
          </Typography>
        </Box>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="الاسم الأول" value={firstName} onChange={(e) => setFirstName(e.target.value)} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="اسم العائلة" value={lastName} onChange={(e) => setLastName(e.target.value)} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small" label="كلمة المرور" type={showPassword ? "text" : "password"}
              value={password} onChange={(e) => setPassword(e.target.value)} sx={fieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" aria-label="إظهار كلمة المرور" size="small">
                      {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel id="m-role">الدور</InputLabel>
              <Select labelId="m-role" label="الدور" value={userType} onChange={(e) => setUserType(String(e.target.value))}
                MenuProps={{ PaperProps: { sx: { fontFamily: FONT } } }}>
                {USER_TYPES_VALUES.map((r) => (
                  <MenuItem key={r.value} value={r.value} sx={{ fontFamily: FONT, fontSize: "13px" }}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
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
