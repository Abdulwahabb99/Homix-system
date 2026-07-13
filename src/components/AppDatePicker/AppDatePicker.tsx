import React, { useState } from "react";
import moment from "moment";
// يضمن تسجيل اللغة العربية في moment (يُستخدم لتقويم المنتقي فقط)
import "shared/functions/momentLocale";
import { TextField } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

/** صيغة القيمة المتبادَلة مع بقية النظام (نفس عقد <input type="date">) */
const WIRE_FORMAT = "YYYY-MM-DD";

export interface AppDatePickerProps {
  /** القيمة بصيغة "YYYY-MM-DD" (فارغ = غير محدد) */
  value: string;
  /** يعيد "YYYY-MM-DD" بأرقام لاتينية (ASCII) أو "" عند المسح — لا يتغيّر منطق التكامل */
  onChange: (isoDate: string) => void;
  /** صيغة العرض داخل الحقل (الواجهة فقط) — الافتراضي يوم/شهر/سنة */
  inputFormat?: string;
  placeholder?: string;
  disabled?: boolean;
  /** حدّ أدنى/أقصى بصيغة "YYYY-MM-DD" */
  minDate?: string;
  maxDate?: string;
  /** تخصيص/تمديد تنسيق حقل الإدخال */
  sx?: SxProps<Theme>;
}

/** "YYYY-MM-DD" (أو ISO) → moment أو null */
function toMoment(v?: string): moment.Moment | null {
  if (!v) return null;
  const strict = moment(v, WIRE_FORMAT, true);
  if (strict.isValid()) return strict;
  const loose = moment(v);
  return loose.isValid() ? loose : null;
}

/** moment → "YYYY-MM-DD" بأرقام لاتينية دائماً (حتى لا يتأثر منطق التكامل بلغة التقويم) */
function toWire(m: moment.Moment | null): string {
  if (!m || !m.isValid()) return "";
  return moment(m).locale("en").format(WIRE_FORMAT);
}

const defaultFieldSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    height: 34,
    borderRadius: "8px",
    bgcolor: HX.surface,
    fontFamily: FONT,
    fontSize: "12.5px",
    cursor: "pointer",
  },
  "& .MuiOutlinedInput-input": {
    py: 0,
    color: HX.tx,
    fontFamily: FONT,
    fontSize: "12.5px",
    cursor: "pointer",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: HX.accent,
    borderWidth: 1,
    boxShadow: `0 0 0 3px ${HX.accentLight}`,
  },
  "& .MuiSvgIcon-root": { fontSize: 18, color: HX.tx3 },
} as const;

/**
 * منتقي تاريخ عربي مشترك: التقويم المنبثق يعرض الأشهر والأيام والأرقام بالعربية
 * (locale "ar")، بينما تبقى القيمة الصادرة "YYYY-MM-DD" بأرقام لاتينية — فلا يتغيّر
 * أي منطق تكامل. بديل مباشر لـ <input type="date"> بنفس عقد value/onChange النصّي.
 */
export default function AppDatePicker({
  value,
  onChange,
  inputFormat = "DD/MM/YYYY",
  placeholder = "يوم/شهر/سنة",
  disabled,
  minDate,
  maxDate,
  sx,
}: AppDatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
      <DatePicker
        value={toMoment(value)}
        onChange={(m) => onChange(toWire(m as moment.Moment | null))}
        inputFormat={inputFormat}
        disabled={disabled}
        minDate={minDate ? toMoment(minDate) : undefined}
        maxDate={maxDate ? toMoment(maxDate) : undefined}
        disableMaskedInput
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            fullWidth
            onClick={() => !disabled && setOpen(true)}
            inputProps={{ ...params.inputProps, placeholder }}
            sx={{ ...defaultFieldSx, ...(sx as object) }}
          />
        )}
      />
    </LocalizationProvider>
  );
}
