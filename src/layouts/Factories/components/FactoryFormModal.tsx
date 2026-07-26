/**
 * نموذج إضافة/تعديل مصنع — خمسة أقسام: بيانات المصنع، بيانات المسؤول،
 * مصاريف الشحن، التحويل البنكي، الأوراق الرسمية.
 *
 * RTL: الاتجاه عبر السمة dir="rtl" على <Dialog> لا عبر sx (المحوّل يقلب
 * `direction` فينقلب الحوار).
 */
import React, { useEffect, useState } from "react";
import { Box, Dialog, IconButton, MenuItem, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { CURRENCY, SPEC_OPTIONS, STATUS_OPTIONS } from "../utils/constants";
import {
  fieldLabelSx, filterBtnSx, formRowSx, modalDividerSx, modalFieldSx,
  modalFootSx, modalHeadSx, modalPaperSx, primaryBtnSx, sectionTitleSx, FONT,
} from "../utils/styles";
import {
  AttachmentKind, Factory, FactoryAttachment, FactoryFormValues, FactorySpec, FactoryStatus,
} from "../utils/types";
import AttachmentField from "./AttachmentField";

export interface FactoryFormModalProps {
  open: boolean;
  /** null = وضع الإضافة */
  factory: Factory | null;
  initialValues: FactoryFormValues;
  onClose: () => void;
  onSave: (values: FactoryFormValues) => void;
}

type AttachmentState = Record<AttachmentKind, FactoryAttachment[]>;
const EMPTY_ATTACHMENTS: AttachmentState = { commercial: [], tax: [] };

/** حقل بعنوان فوقه — نفس شكل .mfield في التصميم */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Box component="label" sx={fieldLabelSx}>{label}</Box>
      {children}
    </Box>
  );
}

export default function FactoryFormModal({
  open, factory, initialValues, onClose, onSave,
}: FactoryFormModalProps) {
  const [values, setValues] = useState<FactoryFormValues>(initialValues);
  const [attachments, setAttachments] = useState<AttachmentState>(EMPTY_ATTACHMENTS);

  const isEdit = factory != null;

  /** يُعاد الضبط عند كل فتح (أو تغيير المصنع) حتى لا تتسرّب قيم الجلسة السابقة */
  useEffect(() => {
    if (!open) return;
    setValues(initialValues);
    setAttachments(EMPTY_ATTACHMENTS);
  }, [open, factory?.id, initialValues]);

  const set = <K extends keyof FactoryFormValues>(key: K) => (value: FactoryFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const addFiles = (kind: AttachmentKind) => (files: File[]) => {
    setAttachments((prev) => ({
      ...prev,
      [kind]: [
        ...prev[kind],
        ...files.map((f, i) => ({
          // الاسم + الحجم + الفهرس يكفيان لتمييز عناصر نفس الدفعة
          id: `${kind}-${f.name}-${f.size}-${prev[kind].length + i}`,
          name: f.name,
          size: f.size,
        })),
      ],
    }));
  };

  const removeFile = (kind: AttachmentKind) => (id: string) => {
    setAttachments((prev) => ({ ...prev, [kind]: prev[kind].filter((a) => a.id !== id) }));
  };

  const handleSave = () => {
    if (!values.name.trim()) {
      NotificationMeassage("error", "اسم المصنع مطلوب");
      return;
    }
    if (!values.spec) {
      NotificationMeassage("error", "التخصص مطلوب");
      return;
    }
    onSave(values);
  };

  return (
    <Dialog open={open} onClose={onClose} dir="rtl" fullWidth maxWidth="sm" PaperProps={{ sx: modalPaperSx }}>
      <Box sx={modalHeadSx}>
        <Typography sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>
          {isEdit ? "تعديل بيانات الصانع" : "إضافة صانع جديد"}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="إغلاق"
          sx={{
            width: 28, height: 28, borderRadius: "7px", bgcolor: HX.surface2,
            color: HX.tx2, flexShrink: 0,
            "&:hover": { bgcolor: HX.redLight, color: HX.red },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ p: "22px" }}>
        {/* ── بيانات المصنع ── */}
        <Box sx={sectionTitleSx}><FactoryOutlinedIcon /> بيانات المصنع</Box>
        <Box sx={formRowSx()}>
          <Field label="اسم المصنع *">
            <TextField
              fullWidth size="small" sx={modalFieldSx} placeholder="مثال: Light Square"
              value={values.name} onChange={(e) => set("name")(e.target.value)}
            />
          </Field>
          <Field label="التخصص *">
            <TextField
              select fullWidth size="small" sx={modalFieldSx}
              value={values.spec}
              onChange={(e) => set("spec")(e.target.value as FactorySpec)}
            >
              <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "13px" }}>اختر التخصص</MenuItem>
              {SPEC_OPTIONS.map((s) => (
                <MenuItem key={s} value={s} sx={{ fontFamily: FONT, fontSize: "13px" }}>{s}</MenuItem>
              ))}
            </TextField>
          </Field>
        </Box>
        <Box sx={formRowSx(true)}>
          <Field label="العنوان الكامل *">
            <TextField
              fullWidth size="small" sx={modalFieldSx} placeholder="مثال: حدائق أكتوبر، القاهرة"
              value={values.addr} onChange={(e) => set("addr")(e.target.value)}
            />
          </Field>
        </Box>
        <Box sx={formRowSx()}>
          <Field label="الحالة">
            <TextField
              select fullWidth size="small" sx={modalFieldSx}
              value={String(values.status)}
              onChange={(e) => set("status")(Number(e.target.value) as FactoryStatus)}
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={String(o.value)} sx={{ fontFamily: FONT, fontSize: "13px" }}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Field>
          <Field label="الويب سايت">
            <TextField
              fullWidth size="small" sx={modalFieldSx} placeholder="https://..."
              value={values.website} onChange={(e) => set("website")(e.target.value)}
              inputProps={{ dir: "ltr" }}
            />
          </Field>
        </Box>

        <Box component="hr" sx={modalDividerSx} />

        {/* ── بيانات المسؤول ── */}
        <Box sx={sectionTitleSx}><PersonOutlineIcon /> بيانات المسؤول</Box>
        <Box sx={formRowSx()}>
          <Field label="اسم المسؤول *">
            <TextField
              fullWidth size="small" sx={modalFieldSx} placeholder="الاسم الكامل"
              value={values.resp} onChange={(e) => set("resp")(e.target.value)}
            />
          </Field>
          <Field label="رقم الهاتف *">
            <TextField
              fullWidth size="small" type="tel" sx={modalFieldSx} placeholder="01xxxxxxxxx"
              value={values.phone} onChange={(e) => set("phone")(e.target.value)}
              inputProps={{ dir: "ltr" }}
            />
          </Field>
        </Box>

        <Box component="hr" sx={modalDividerSx} />

        {/* ── مصاريف الشحن ── */}
        <Box sx={sectionTitleSx}>
          <LocalShippingOutlinedIcon /> مصاريف الشحن ({CURRENCY})
        </Box>
        <Box sx={formRowSx()}>
          <Field label="القاهرة والجيزة">
            <TextField
              fullWidth size="small" type="number" sx={modalFieldSx} placeholder="0"
              value={values.shipCairo} onChange={(e) => set("shipCairo")(e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Field>
          <Field label="باقي المحافظات">
            <TextField
              fullWidth size="small" type="number" sx={modalFieldSx} placeholder="0"
              value={values.shipOther} onChange={(e) => set("shipOther")(e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Field>
        </Box>

        <Box component="hr" sx={modalDividerSx} />

        {/* ── التحويل البنكي ── */}
        <Box sx={sectionTitleSx}><CreditCardOutlinedIcon /> بيانات التحويل البنكي</Box>
        <Box sx={formRowSx()}>
          <Field label="اسم البنك">
            <TextField
              fullWidth size="small" sx={modalFieldSx} placeholder="مثال: بنك مصر"
              value={values.bankName} onChange={(e) => set("bankName")(e.target.value)}
            />
          </Field>
          <Field label="اسم صاحب الحساب">
            <TextField
              fullWidth size="small" sx={modalFieldSx} placeholder="الاسم كما في البنك"
              value={values.bankHolder} onChange={(e) => set("bankHolder")(e.target.value)}
            />
          </Field>
        </Box>
        <Box sx={formRowSx()}>
          <Field label="رقم الحساب">
            <TextField
              fullWidth size="small" placeholder="XXXX XXXX XXXX XXXX"
              value={values.bankAccount} onChange={(e) => set("bankAccount")(e.target.value)}
              inputProps={{ dir: "ltr" }}
              sx={{
                ...modalFieldSx,
                "& .MuiOutlinedInput-input": {
                  fontFamily: "monospace", fontSize: "13px", letterSpacing: ".5px", py: 0,
                },
              }}
            />
          </Field>
          <Field label="رقم المحفظة / الفودافون كاش">
            <TextField
              fullWidth size="small" type="tel" sx={modalFieldSx} placeholder="01xxxxxxxxx"
              value={values.bankWallet} onChange={(e) => set("bankWallet")(e.target.value)}
              inputProps={{ dir: "ltr" }}
            />
          </Field>
        </Box>
        <Box sx={formRowSx(true)}>
          <Field label="رقم InstaPay">
            <TextField
              fullWidth size="small" type="tel" sx={modalFieldSx} placeholder="01xxxxxxxxx"
              value={values.bankInstapay} onChange={(e) => set("bankInstapay")(e.target.value)}
              inputProps={{ dir: "ltr" }}
            />
          </Field>
        </Box>

        <Box component="hr" sx={modalDividerSx} />

        {/* ── الأوراق الرسمية ── */}
        <Box sx={sectionTitleSx}><AttachFileIcon /> الأوراق الرسمية</Box>
        <AttachmentField
          label="السجل التجاري"
          emoji="📄"
          items={attachments.commercial}
          onAdd={addFiles("commercial")}
          onRemove={removeFile("commercial")}
        />
        <AttachmentField
          label="البطاقة الضريبية"
          emoji="🧾"
          items={attachments.tax}
          onAdd={addFiles("tax")}
          onRemove={removeFile("tax")}
        />
      </Box>

      <Box sx={modalFootSx}>
        <Box component="button" type="button" onClick={onClose} sx={{ ...filterBtnSx(false), height: 34 }}>
          إلغاء
        </Box>
        <Box component="button" type="button" onClick={handleSave} sx={primaryBtnSx}>
          <CheckIcon /> حفظ الصانع
        </Box>
      </Box>
    </Dialog>
  );
}
