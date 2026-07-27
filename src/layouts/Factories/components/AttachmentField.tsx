/**
 * حقل مستندات من نوع واحد (نوع المستند يأتي من `meta.documentTypes`):
 *   - المستندات المرفوعة فعلاً (من `GET /factories/{id}`) بزرّ حذف يستدعي
 *     `DELETE /factories/{factoryId}/attachments/{attachmentId}`
 *   - الملفات المنتظرة محلياً قبل الرفع
 *   - زر رفع + منطقة سحب وإفلات
 */
import React, { useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { fileSizeLabel } from "../utils/calc";
import { ATTACHMENT_ACCEPT, ATTACHMENT_PENDING_LABEL } from "../utils/constants";
import {
  attDeleteBtnSx, attDropZoneSx, attItemSx, attUploadTriggerSx, fieldLabelSx, FONT,
} from "../utils/styles";
import { FactoryDocument, PendingDocument } from "../utils/types";

export interface AttachmentFieldProps {
  label: string;
  /** رمز تعبيري يُعرض بجانب كل ملف (كما في التصميم) */
  emoji: string;
  /** مستندات محفوظة على السيرفر لهذا النوع */
  uploaded: FactoryDocument[];
  /** ملفات محلّية لم تُرفع بعد */
  pending: PendingDocument[];
  onAdd: (files: File[]) => void;
  onRemovePending: (key: string) => void;
  onRemoveUploaded?: (documentId: number) => void;
  /** معرّف المستند الجاري حذفه (لإظهار مؤشّر التحميل) */
  deletingId?: number | null;
}

/** سطر ملف موحّد الشكل بين المرفوع والمنتظر */
function FileRow({
  emoji, name, meta, url, onRemove, busy,
}: {
  emoji: string;
  name: string;
  meta: string;
  url?: string;
  onRemove?: () => void;
  busy?: boolean;
}) {
  return (
    <Box sx={attItemSx}>
      <Box component="span" sx={{ fontSize: "18px", flexShrink: 0, lineHeight: 1 }}>{emoji}</Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{
          fontSize: "12px", fontWeight: 700, color: HX.tx, fontFamily: FONT,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {name}
        </Box>
        <Box sx={{ fontSize: "10.5px", color: HX.tx3, mt: "1px", fontFamily: FONT }}>{meta}</Box>
      </Box>

      {url ? (
        <Box
          component="a"
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label="فتح المستند"
          sx={{ ...attDeleteBtnSx, color: HX.tx3, "&:hover": { borderColor: HX.accent, color: HX.accent } }}
        >
          <OpenInNewIcon />
        </Box>
      ) : null}

      {onRemove ? (
        <Box
          component="button"
          type="button"
          aria-label="حذف المستند"
          disabled={busy}
          onClick={onRemove}
          sx={attDeleteBtnSx}
        >
          {busy ? <CircularProgress size={11} sx={{ color: HX.red }} /> : <CloseIcon />}
        </Box>
      ) : null}
    </Box>
  );
}

export default function AttachmentField({
  label, emoji, uploaded, pending, onAdd, onRemovePending, onRemoveUploaded, deletingId,
}: AttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    // تصفير القيمة يسمح باختيار نفس الملف مرّة أخرى
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) onAdd(files);
  };

  const hasAny = uploaded.length > 0 || pending.length > 0;

  return (
    <Box sx={{ mb: "10px" }}>
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "8px", mb: "7px",
      }}>
        <Box component="label" sx={{ ...fieldLabelSx, mb: 0, fontSize: "12px" }}>{label}</Box>
        <Box component="span" onClick={pick} sx={attUploadTriggerSx}>
          <AddIcon /> رفع ملف
        </Box>
      </Box>

      <Box
        component="input"
        type="file"
        multiple
        ref={inputRef}
        accept={ATTACHMENT_ACCEPT}
        onChange={handleInput}
        sx={{ display: "none" }}
      />

      {hasAny ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {uploaded.map((d) => (
            <FileRow
              key={`up-${d.id}`}
              emoji={emoji}
              name={d.name || d.description || "مستند"}
              meta={d.verificationStatusLabel || d.typeLabel || ""}
              url={d.url}
              busy={deletingId === d.id}
              onRemove={onRemoveUploaded ? () => onRemoveUploaded(d.id) : undefined}
            />
          ))}
          {pending.map((p) => (
            <FileRow
              key={p.key}
              emoji={emoji}
              name={p.file.name}
              meta={`${fileSizeLabel(p.file.size)} · ${ATTACHMENT_PENDING_LABEL}`}
              onRemove={() => onRemovePending(p.key)}
            />
          ))}
        </Box>
      ) : null}

      <Box
        onClick={pick}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        sx={attDropZoneSx(dragOver)}
      >
        <FileUploadOutlinedIcon />
        <Box component="span">اسحب ملف PDF أو صورة هنا</Box>
      </Box>
    </Box>
  );
}
