/**
 * حالة تعديل رقمي inline قابلة لإعادة الاستخدام: يبدّل بين العرض والإدخال،
 * يتحقق من صحّة القيمة، ولا يستدعي onSave إلا عند تغيّر القيمة فعلاً.
 * الإدخال الفارغ يُعامل كإلغاء (لا يُحفظ صفر).
 * يُستخدم في «المبلغ المطلوب تحصيله» ببطاقة التفاصيل المالية.
 */
import { useState } from "react";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";

export interface InlineNumberEdit {
  editing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  start: (current: number) => void;
  cancel: () => void;
  save: (current: number) => void;
}

/** blank = cancel (no change), never 0; otherwise a finite non-negative number or "invalid". */
export function parseInlineAmount(draft: string): { kind: "cancel" } | { kind: "invalid" } | { kind: "value"; value: number } {
  if (draft.trim() === "") return { kind: "cancel" };
  const n = Number(draft);
  if (!Number.isFinite(n) || n < 0) return { kind: "invalid" };
  return { kind: "value", value: n };
}

export function useInlineNumberEdit(onSave: (value: number) => void): InlineNumberEdit {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const start = (current: number) => {
    setDraft(String(current));
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const save = (current: number) => {
    /* مربع فارغ = لا تغيير (إلغاء)، وليس صفراً: Number("") === 0 كان يحفظ 0 بصمت. */
    const parsed = parseInlineAmount(draft);
    if (parsed.kind === "invalid") {
      NotificationMeassage("error", "أدخل رقماً صحيحاً");
      return;
    }
    if (parsed.kind === "value" && parsed.value !== current) onSave(parsed.value);
    setEditing(false);
  };

  return { editing, draft, setDraft, start, cancel, save };
}
