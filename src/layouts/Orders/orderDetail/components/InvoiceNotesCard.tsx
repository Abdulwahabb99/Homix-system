/**
 * بطاقة «مسودة ملاحظات»: نص حر يكتبه الموظفون ويُطبع في فاتورة الطلب
 * («طباعة الفاتورة»). الحفظ على الطلب نفسه (حقل invoiceNotes) وتُسجَّل
 * التعديلات في سجل الأحداث. لا تُعرض للبائع.
 */
import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { OD } from "../odTheme";
import {
  INVOICE_NOTES_MAX_LENGTH,
  getInvoiceNotes,
  isInvoiceNotesDirty,
  normalizeInvoiceNotesDraft,
} from "../../orderInvoice/invoiceNotes";
import SectionCard from "./SectionCard";

interface InvoiceNotesCardProps {
  orderDetails: any;
  /** يحفظ النص (فارغ = مسح الملاحظة) */
  changeInvoiceNotes: (invoiceNotes: string) => void;
}

export default function InvoiceNotesCard({ orderDetails, changeInvoiceNotes }: InvoiceNotesCardProps) {
  const saved = getInvoiceNotes(orderDetails);
  const [draft, setDraft] = useState(saved);

  /* تحديث المسودة عند تغيّر الطلب أو القيمة المحفوظة (بعد الحفظ/الرجوع عند الفشل). */
  useEffect(() => {
    setDraft(saved);
  }, [orderDetails?.id, saved]);

  const dirty = isInvoiceNotesDirty(draft, saved);

  return (
    <SectionCard
      icon={<EditNoteOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="مسودة ملاحظات"
      bodySx={{ p: "14px 16px" }}
    >
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        size="small"
        value={draft}
        placeholder="اكتب ملاحظات تُطبع في الفاتورة…"
        onChange={(e) => setDraft(e.target.value.slice(0, INVOICE_NOTES_MAX_LENGTH))}
        inputProps={{ "aria-label": "مسودة ملاحظات", maxLength: INVOICE_NOTES_MAX_LENGTH }}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: "0.78rem" } }}
      />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
        <Typography sx={{ fontSize: "0.69rem", color: OD.tx3 }}>
          {draft.length} / {INVOICE_NOTES_MAX_LENGTH} · تظهر في الفاتورة المطبوعة
        </Typography>
        <Button
          size="small"
          variant="contained"
          disabled={!dirty}
          onClick={() => changeInvoiceNotes(normalizeInvoiceNotesDraft(draft))}
          sx={{ textTransform: "none", fontSize: "0.72rem", borderRadius: "8px", boxShadow: "none" }}
        >
          حفظ
        </Button>
      </Box>
    </SectionCard>
  );
}
