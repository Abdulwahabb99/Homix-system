/**
 * خلية مبلغ قابلة للتعديل المباشر — مشتركة بين نافذة الفاتورة (الأرشيف) والتقرير الحي.
 * نفس السلوك في الموضعين: نقر ← حقل رقمي، Enter أو فقدان التركيز = حفظ، Escape = إلغاء،
 * وقيمة معدّلة تُلوَّن مع زر ↺ للرجوع للحساب التلقائي. الحفظ نفسه يتولاه المستدعي عبر `onCommit`.
 */
import React, { useRef, useState } from "react";
import { Box } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { inputSx } from "./shared";

/** يقبل أرقاماً غير سالبة فقط — الحقل الفارغ أو النص ليس صفراً */
export function parseAmountInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export type AmountDraft = { kind: "cancel" } | { kind: "invalid" } | { kind: "value"; value: number };

/**
 * الصندوق الفارغ = إلغاء (النموذج الأصلي كان يحفظه صفراً — اعتُبر خطأً)، والقيم السالبة/النصية خطأ،
 * أما الصفر الصريح فيُحفظ.
 */
export function parseAmountDraft(raw: string): AmountDraft {
  if (raw.trim() === "") return { kind: "cancel" };
  const value = parseAmountInput(raw);
  return value === null ? { kind: "invalid" } : { kind: "value", value };
}

interface Props {
  /** القيمة الحالية (تدخل في الحقل عند التعديل) */
  value: number;
  /** العرض في حالة القراءة (مثلاً `<span>{money(value)}</span>`) */
  display: React.ReactNode;
  editable: boolean;
  /** سبب عدم القابلية للتعديل — يظهر كتلميح */
  disabledReason?: string;
  overridden?: boolean;
  /** تلميح القيمة المعدّلة (القيمة الأصلية + السبب) */
  overriddenTitle?: string;
  busy?: boolean;
  onCommit: (value: number) => void;
  /** يُمرَّر فقط حين يسمح الوضع بالرجوع للحساب التلقائي */
  onReset?: () => void;
}

export default function EditableAmountCell({
  value, display, editable, disabledReason, overridden = false, overriddenTitle, busy = false, onCommit, onReset,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const settled = useRef(false);

  const start = () => {
    settled.current = false;
    setDraft(String(value));
    setEditing(true);
  };

  const commit = () => {
    if (settled.current) return;
    settled.current = true;
    setEditing(false);
    const parsed = parseAmountDraft(draft);
    if (parsed.kind === "cancel") return;
    if (parsed.kind === "invalid") { NotificationMeassage("error", "قيمة غير صالحة"); return; }
    if (parsed.value === value) return;
    onCommit(parsed.value);
  };

  const cancel = () => { settled.current = true; setEditing(false); };

  if (editing) {
    return (
      <Box component="input" autoFocus type="number" min={0} value={draft}
        aria-label="قيمة جديدة"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
        onBlur={commit}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
        sx={{ ...inputSx, width: 90, height: 28 }} />
    );
  }

  const marker = overridden && (
    <Box component="span" title={overriddenTitle || "قيمة معدّلة"} aria-label="قيمة معدّلة"
      sx={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", bgcolor: HX.amber, marginInlineStart: "5px", verticalAlign: "middle" }} />
  );

  if (!editable) {
    return (
      <span title={disabledReason || (overridden ? overriddenTitle : undefined)}>
        <Box component="span" sx={overridden ? { color: HX.amber, fontWeight: 700 } : undefined}>{display}</Box>
        {marker}
      </span>
    );
  }

  return (
    <span style={{ opacity: busy ? 0.5 : 1 }}>
      <Box component="span" role="button" tabIndex={0} title={overridden && overriddenTitle ? overriddenTitle : "اضغط للتعديل"}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (!busy) start(); }}
        onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === "Enter" || e.key === " ") && !busy) { e.preventDefault(); start(); } }}
        sx={{
          cursor: busy ? "default" : "pointer", borderBottom: `1px dotted ${overridden ? HX.amber : HX.tx3}`,
          color: overridden ? HX.amber : "inherit", fontWeight: overridden ? 700 : undefined,
          "& .edit-pencil": { opacity: 0 }, "&:hover .edit-pencil, &:focus-visible .edit-pencil": { opacity: 0.7 },
        }}>
        {display}
        <EditOutlinedIcon className="edit-pencil" sx={{ fontSize: 11, marginInlineStart: "3px", verticalAlign: "middle", transition: ".15s" }} />
      </Box>
      {marker}
      {overridden && onReset && (
        <Box component="button" type="button" title="رجوع للحساب التلقائي" disabled={busy}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onReset(); }}
          sx={{ all: "unset", cursor: "pointer", marginInlineStart: "6px", color: HX.tx3, fontSize: "11px", "&:hover": { color: HX.red } }}>↺</Box>
      )}
    </span>
  );
}
