/**
 * نافذة تعديل بيانات العميل (من صفحة تفاصيل الطلب).
 * الحفظ عبر PUT /customers/{customerId} — يمرَّر عبر onSave (يعيد Promise).
 */
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Dialog, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { OD } from "./odTheme";

const FONT = "'Cairo', sans-serif";

export interface CustomerFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  email: string;
}

const controlSx = {
  height: 38, px: "11px", width: "100%", boxSizing: "border-box",
  border: `0.5px solid ${OD.brd}`, borderRadius: "9px",
  fontSize: "0.82rem", fontFamily: FONT, color: OD.tx, bgcolor: OD.sur,
  outline: "none", transition: ".15s",
  "&:focus": { borderColor: OD.accent, boxShadow: `0 0 0 3px ${OD.al}` },
  "&::placeholder": { color: OD.tx3 },
} as const;

const labelSx = { fontSize: "0.69rem", fontWeight: 700, color: OD.tx3, fontFamily: FONT } as const;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <Box component="label" sx={labelSx}>
        {label}{required && <Box component="span" sx={{ color: OD.red }}> *</Box>}
      </Box>
      {children}
    </Box>
  );
}

const rowSx = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "12px", mb: "12px" } as const;

interface CustomerEditModalProps {
  open: boolean;
  customer: any;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (values: CustomerFormValues) => Promise<unknown>;
}

export default function CustomerEditModal({ open, customer, isSaving, onClose, onSave }: CustomerEditModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) return;
    setFirstName(String(customer?.firstName ?? ""));
    setLastName(String(customer?.lastName ?? ""));
    setPhoneNumber(String(customer?.phoneNumber ?? ""));
    setAddress(String(customer?.address ?? customer?.address2 ?? ""));
    setEmail(String(customer?.email ?? ""));
  }, [open, customer]);

  const handleSave = () => {
    if (!firstName.trim()) { NotificationMeassage("error", "الاسم الأول مطلوب"); return; }
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      email: email.trim(),
    })
      .then(() => onClose())
      .catch(() => { /* الخطأ يُعرض من طبقة الحفظ */ });
  };

  const ltrInput = { unicodeBidi: "plaintext", textAlign: "start" } as const;

  return (
    <Dialog open={open} onClose={onClose} dir="rtl"
      PaperProps={{ sx: { borderRadius: "16px", width: 560, maxWidth: "94vw", fontFamily: FONT } }}>
      {/* Head */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px", borderBottom: `0.5px solid ${OD.brd}` }}>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: OD.tx, fontFamily: FONT }}>تعديل بيانات العميل</Typography>
        <IconButton onClick={onClose} aria-label="إغلاق"
          sx={{ width: 28, height: 28, borderRadius: "7px", border: `0.5px solid ${OD.brd}`, bgcolor: OD.sur2, color: OD.tx2,
            "&:hover": { bgcolor: "rgba(239,68,68,0.1)", borderColor: OD.red, color: OD.red } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ p: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "7px", mb: "14px" }}>
          <Box sx={{ width: 26, height: 26, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: OD.al, color: OD.accent }}>
            <PersonOutlineIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: OD.tx3, letterSpacing: "1px", fontFamily: FONT }}>
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
          <Field label="رقم الهاتف">
            <Box component="input" type="tel" value={phoneNumber} placeholder="01xxxxxxxxx"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)} sx={{ ...controlSx, ...ltrInput }} />
          </Field>
          <Field label="البريد الإلكتروني">
            <Box component="input" type="email" value={email} placeholder="customer@example.com"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} sx={{ ...controlSx, ...ltrInput }} />
          </Field>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
          <Field label="العنوان">
            <Box component="input" value={address} placeholder="العنوان بالتفصيل"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} sx={controlSx} />
          </Field>
        </Box>
      </Box>

      {/* Foot */}
      <Box sx={{ p: "14px 20px", borderTop: `0.5px solid ${OD.brd}`, bgcolor: OD.sur2, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <Box component="button" type="button" onClick={onClose}
          sx={{ px: "14px", height: 34, border: `0.5px solid ${OD.brd}`, borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600, fontFamily: FONT, cursor: "pointer", bgcolor: "transparent", color: OD.tx2, "&:hover": { borderColor: OD.red, color: OD.red } }}>
          إلغاء
        </Box>
        <Box component="button" type="button" onClick={handleSave} disabled={isSaving}
          sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "18px", height: 34, border: "none", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, fontFamily: FONT, cursor: isSaving ? "default" : "pointer", bgcolor: OD.accent, color: "#fff", opacity: isSaving ? 0.7 : 1, "&:hover": { bgcolor: OD.accentHover }, "& svg": { fontSize: 16 } }}>
          {isSaving ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <CheckIcon />} حفظ التعديلات
        </Box>
      </Box>
    </Dialog>
  );
}
