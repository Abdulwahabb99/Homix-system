/**
 * حقل أوراق رسمية: زر «رفع ملف» + منطقة سحب وإفلات + قائمة المرفقات المحلية.
 * الملفات لا تُرسل بعد — تُحفظ في حالة النموذج فقط.
 * TODO(BE): الرفع الفعلي عبر multipart عند توفّر نقطة النهاية.
 */
import React, { useRef, useState } from "react";
import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { fileSizeLabel } from "../utils/calc";
import { ATTACHMENT_ACCEPT, ATTACHMENT_PENDING_LABEL } from "../utils/constants";
import {
  attDeleteBtnSx, attDropZoneSx, attItemSx, attUploadTriggerSx, fieldLabelSx, FONT,
} from "../utils/styles";
import { FactoryAttachment } from "../utils/types";

export interface AttachmentFieldProps {
  label: string;
  /** رمز تعبيري يُعرض بجانب كل ملف (كما في التصميم) */
  emoji: string;
  items: FactoryAttachment[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export default function AttachmentField({
  label, emoji, items, onAdd, onRemove,
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
        ref={inputRef}
        accept={ATTACHMENT_ACCEPT}
        onChange={handleInput}
        sx={{ display: "none" }}
      />

      {items.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {items.map((a) => (
            <Box key={a.id} sx={attItemSx}>
              <Box component="span" sx={{ fontSize: "18px", flexShrink: 0, lineHeight: 1 }}>
                {emoji}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{
                  fontSize: "12px", fontWeight: 700, color: HX.tx, fontFamily: FONT,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {a.name}
                </Box>
                <Box sx={{ fontSize: "10.5px", color: HX.tx3, mt: "1px", fontFamily: FONT }}>
                  {fileSizeLabel(a.size)} · {ATTACHMENT_PENDING_LABEL}
                </Box>
              </Box>
              <Box
                component="button"
                type="button"
                aria-label="حذف المرفق"
                onClick={() => onRemove(a.id)}
                sx={attDeleteBtnSx}
              >
                <CloseIcon />
              </Box>
            </Box>
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
