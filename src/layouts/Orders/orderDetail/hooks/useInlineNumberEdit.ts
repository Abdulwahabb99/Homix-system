/**
 * حالة تعديل رقمي inline قابلة لإعادة الاستخدام: يبدّل بين العرض والإدخال،
 * يتحقق من صحّة القيمة، ولا يستدعي onSave إلا عند تغيّر القيمة فعلاً.
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

export function useInlineNumberEdit(onSave: (value: number) => void): InlineNumberEdit {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const start = (current: number) => {
    setDraft(String(current));
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const save = (current: number) => {
    const n = Number(draft);
    if (!Number.isFinite(n) || n < 0) {
      NotificationMeassage("error", "أدخل رقماً صحيحاً");
      return;
    }
    if (n !== current) onSave(n);
    setEditing(false);
  };

  return { editing, draft, setDraft, start, cancel, save };
}
