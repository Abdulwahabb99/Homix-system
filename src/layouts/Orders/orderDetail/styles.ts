/**
 * أنماط (sx) مشتركة لصفحة تفاصيل الطلب — مصدر واحد لهيكل البطاقات والحقول
 * حتى تبقى المكوّنات المقسّمة متطابقة بصرياً. تعتمد على رموز التصميم OD.
 */
import type { SxProps, Theme } from "@mui/material/styles";
import { OD } from "./odTheme";

/** غلاف البطاقة القياسي (خلفية + حدود + زوايا) */
export const cardSx: SxProps<Theme> = {
  bgcolor: OD.sur,
  borderRadius: `${OD.radius}px`,
  border: `0.5px solid ${OD.brd}`,
  overflow: "hidden",
};

/** ترويسة البطاقة: أيقونة + عنوان يمين، وإجراء اختياري يسار */
export const cardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 2,
  py: 1.6,
  borderBottom: `0.5px solid ${OD.brd}`,
};

/** عنوان البطاقة */
export const cardTitleSx: SxProps<Theme> = {
  fontSize: "0.81rem",
  fontWeight: 700,
  color: OD.tx,
};

/** عنوان حقل داخل بطاقة الحالة */
export const statusFieldLabelSx: SxProps<Theme> = {
  fontSize: "0.69rem",
  fontWeight: 700,
  color: OD.tx3,
  mb: 0.75,
};

/** حقل SelectComponent داخل بطاقة الحالة (حالة الطلب/التأخير/مكان التسليم/التصنيع) */
export const statusSelectSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 40,
    borderRadius: "9px",
    bgcolor: OD.sur,
    fontSize: "0.78rem",
    "& fieldset": { borderColor: OD.brd },
    "&:hover fieldset": { borderColor: OD.accent },
  },
  "& .MuiSelect-select": { py: 1, px: 1.5, textAlign: "start" },
} as const;

/** حقل Autocomplete «المسؤول» */
export const assigneeAutocompleteSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 40,
    borderRadius: "9px",
    bgcolor: OD.sur,
    fontSize: "0.78rem",
    py: "1px !important",
    "& fieldset": { borderColor: OD.brd },
    "&:hover fieldset": { borderColor: OD.accent },
    "&.Mui-focused fieldset": { borderColor: OD.accent },
  },
  "& .MuiAutocomplete-input": { fontSize: "0.78rem" },
} as const;
