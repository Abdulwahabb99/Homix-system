/**
 * زر نسخ نصّ إلى الحافظة مع تغذية راجعة (علامة صح مؤقتة).
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { copyBtnSx } from "../utils/styles";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box component="button" type="button" onClick={handleCopy} aria-label="نسخ" sx={copyBtnSx(copied)}>
      {copied ? <CheckIcon /> : <ContentCopyIcon />}
    </Box>
  );
}
