/**
 * بطاقة «الأوراق الرسمية» — قسم لكل نوع مستند من الـ meta بزرّ رفع خاص به،
 * ثم منطقة سحب وإفلات عامة أسفل البطاقة.
 *
 * الرفع يحتاج نوع المستند دائماً (`attachmentTypes` في الـ multipart)، فأزرار
 * الأقسام ترسل نوعها، ومنطقة السحب العامة ترسل أول نوع في الـ meta.
 */
import React, { useMemo, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { FactoryMetaOption } from "query/factoriesMeta";
import { ATTACHMENT_ACCEPT } from "../../utils/constants";
import {
  documentIconBg, documentStatusLabel, documentStatusTone, fileEmoji, fmtLongDate,
} from "../utils/calc";
import {
  attAddBtnSx, attBtnSx, attIconSx, attItemSx, attListSx, attSectionLabelSx,
  attSeparatorSx, attStatusSx, attTypeChipSx, attUploadIconSx, attUploadZoneSx, FONT,
} from "../utils/styles";
import type { FactoryDocument } from "../../utils/types";
import DetailCard from "./DetailCard";

export interface DocumentsCardProps {
  documents: FactoryDocument[];
  documentTypes: FactoryMetaOption[];
  onUpload: (files: File[], attachmentType: number) => void;
  isUploading: boolean;
  onDelete: (documentId: number) => void;
  deletingId: number | null;
}

const FILE_CHIPS = ["PDF", "JPG", "PNG"];

/** عنصر مستند واحد */
function DocumentItem({
  doc, onDelete, deleting,
}: { doc: FactoryDocument; onDelete: () => void; deleting: boolean }) {
  const tone = documentStatusTone(doc);
  const name = doc.name || doc.description || "مستند";

  return (
    <Box sx={attItemSx}>
      <Box sx={attIconSx(documentIconBg(doc.type))}>{fileEmoji(name)}</Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontSize: "12.5px", fontWeight: 700, color: HX.tx, fontFamily: FONT,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          {name}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mt: "2px", flexWrap: "wrap" }}>
          <Box component="span" sx={attStatusSx(tone)}>{documentStatusLabel(doc)}</Box>
          {doc.createdAt ? (
            <Box component="span" sx={{ fontSize: "10.5px", color: HX.tx3, fontFamily: FONT }}>
              رُفع {fmtLongDate(doc.createdAt)}
            </Box>
          ) : null}
        </Box>

        {doc.expiresAt ? (
          <Box sx={{ fontSize: "10.5px", color: HX.tx3, mt: "2px", fontFamily: FONT }}>
            ينتهي: {fmtLongDate(doc.expiresAt)}
          </Box>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", gap: "4px", flexShrink: 0 }}>
        {doc.url ? (
          <>
            <Box
              component="a"
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              title="معاينة"
              sx={attBtnSx()}
            >
              <VisibilityOutlinedIcon />
            </Box>
            <Box
              component="a"
              href={doc.url}
              download
              title="تحميل"
              sx={attBtnSx()}
            >
              <FileDownloadOutlinedIcon />
            </Box>
          </>
        ) : null}
        <Box
          component="button"
          type="button"
          title="حذف"
          disabled={deleting}
          onClick={onDelete}
          sx={attBtnSx(true)}
        >
          {deleting ? <CircularProgress size={12} sx={{ color: HX.red }} /> : <DeleteOutlineIcon />}
        </Box>
      </Box>
    </Box>
  );
}

export default function DocumentsCard({
  documents, documentTypes, onUpload, isUploading, onDelete, deletingId,
}: DocumentsCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  /** نوع المستند المستهدَف بالنقرة الحالية على زر الرفع */
  const pendingTypeRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const byType = useMemo(() => {
    const map = new Map<number, FactoryDocument[]>();
    documents.forEach((d) => {
      const key = d.type ?? -1;
      const list = map.get(key) ?? [];
      list.push(d);
      map.set(key, list);
    });
    return map;
  }, [documents]);

  /** مستندات بأنواع غير موجودة في الـ meta — تُعرض تحت «أخرى» بدل أن تُخفى */
  const knownTypeIds = useMemo(() => new Set(documentTypes.map((t) => t.value)), [documentTypes]);
  const otherDocs = useMemo(
    () => documents.filter((d) => d.type == null || !knownTypeIds.has(d.type)),
    [documents, knownTypeIds]
  );

  const defaultType = documentTypes[0]?.value ?? null;

  const pick = (attachmentType: number | null) => {
    if (attachmentType == null) return;
    pendingTypeRef.current = attachmentType;
    inputRef.current?.click();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const type = pendingTypeRef.current;
    e.target.value = "";
    if (files.length && type != null) onUpload(files, type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length && defaultType != null) onUpload(files, defaultType);
  };

  return (
    <DetailCard
      icon={<AttachFileIcon />}
      title="الأوراق الرسمية"
      action={
        <Box
          component="span"
          sx={{
            px: "9px", py: "3px", borderRadius: "20px", fontSize: "10px", fontWeight: 700,
            bgcolor: HX.accentLight, color: HX.accent, fontFamily: FONT, whiteSpace: "nowrap",
          }}
        >
          {documents.length} مستند
        </Box>
      }
    >
      <Box
        component="input"
        type="file"
        multiple
        ref={inputRef}
        accept={ATTACHMENT_ACCEPT}
        onChange={handleInput}
        sx={{ display: "none" }}
      />

      {documentTypes.map((type, index) => {
        const list = byType.get(type.value) ?? [];
        return (
          <React.Fragment key={type.value}>
            {index > 0 ? <Box sx={attSeparatorSx} /> : null}

            <Box sx={attSectionLabelSx}>
              {type.label}
              <Box
                component="button"
                type="button"
                disabled={isUploading}
                onClick={() => pick(type.value)}
                sx={attAddBtnSx}
              >
                {isUploading ? <CircularProgress size={11} sx={{ color: HX.accent }} /> : <AddIcon />}
                رفع
              </Box>
            </Box>

            {list.length === 0 ? (
              <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT, pb: "4px" }}>
                لا يوجد مستند
              </Box>
            ) : (
              <Box sx={attListSx}>
                {list.map((doc) => (
                  <DocumentItem
                    key={doc.id}
                    doc={doc}
                    deleting={deletingId === doc.id}
                    onDelete={() => onDelete(doc.id)}
                  />
                ))}
              </Box>
            )}
          </React.Fragment>
        );
      })}

      {otherDocs.length > 0 ? (
        <>
          <Box sx={attSeparatorSx} />
          <Box sx={attSectionLabelSx}>مستندات أخرى</Box>
          <Box sx={attListSx}>
            {otherDocs.map((doc) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                deleting={deletingId === doc.id}
                onDelete={() => onDelete(doc.id)}
              />
            ))}
          </Box>
        </>
      ) : null}

      <Box sx={attSeparatorSx} />

      <Box
        onClick={() => pick(defaultType)}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        sx={attUploadZoneSx(dragOver)}
      >
        <Box sx={attUploadIconSx}>
          {isUploading ? <CircularProgress size={16} sx={{ color: HX.accent }} /> : <FileUploadOutlinedIcon />}
        </Box>
        <Box sx={{ fontSize: "12.5px", fontWeight: 700, color: HX.tx, mb: "3px", fontFamily: FONT }}>
          {isUploading ? "جارٍ الرفع…" : "رفع مستند جديد"}
        </Box>
        <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT }}>
          اسحب وأفلت الملف هنا أو اضغط للاختيار
        </Box>
        <Box sx={{ display: "flex", gap: "5px", justifyContent: "center", mt: "8px", flexWrap: "wrap" }}>
          {FILE_CHIPS.map((c) => (
            <Box key={c} component="span" sx={attTypeChipSx}>{c}</Box>
          ))}
          {defaultType != null ? (
            <Box component="span" sx={attTypeChipSx}>
              {documentTypes[0]?.label}
            </Box>
          ) : null}
        </Box>
      </Box>

      {defaultType == null ? (
        <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT, mt: "8px", textAlign: "center" }}>
          لا توجد أنواع مستندات في الإعدادات — لا يمكن الرفع
        </Box>
      ) : null}
    </DetailCard>
  );
}
