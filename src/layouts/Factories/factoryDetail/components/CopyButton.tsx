/**
 * زر نسخ قيمة إلى الحافظة — يتحوّل لعلامة صح خضراء لثانية ونصف بعد النسخ
 * (نفس سلوك copyText في التصميم).
 */
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { copyBtnSx } from "../utils/styles";

const FEEDBACK_MS = 1500;

export default function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // الحافظة غير متاحة (سياق غير آمن) — نتجاهل بصمت كما في التصميم
      return;
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), FEEDBACK_MS);
  };

  if (!value) return null;

  return (
    <Box
      component="button"
      type="button"
      onClick={handleCopy}
      aria-label={label ? `نسخ ${label}` : "نسخ"}
      title={copied ? "تم النسخ" : "نسخ"}
      sx={copyBtnSx(copied)}
    >
      {copied ? <CheckIcon /> : <ContentCopyIcon />}
    </Box>
  );
}
