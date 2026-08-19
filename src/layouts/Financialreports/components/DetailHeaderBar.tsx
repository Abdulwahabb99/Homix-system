/**
 * شريط أعلى لوحة التفاصيل: العنوان + أزرار (طباعة/تصدير).
 * الأزرار جاهزة للربط لاحقاً — تستقبل معالِجات اختيارية.
 */
import React from "react";
import { Box } from "@mui/material";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { detailHeaderBarSx, detailTitleSx, dactBtnSx } from "../utils/styles";

interface DetailHeaderBarProps {
  title: string;
  onPrint?: () => void;
  onExport?: () => void;
  exporting?: boolean;
}

export default function DetailHeaderBar({ title, onPrint, onExport, exporting }: DetailHeaderBarProps) {
  return (
    <Box sx={detailHeaderBarSx}>
      <Box sx={detailTitleSx}>{title}</Box>
      <Box sx={{ display: "flex", gap: "6px" }}>
        {onPrint && (
          <Box component="button" type="button" onClick={onPrint} sx={dactBtnSx}>
            <PrintOutlinedIcon /> طباعة
          </Box>
        )}
        {onExport && (
          <Box
            component="button"
            type="button"
            onClick={onExport}
            disabled={exporting}
            sx={{ ...dactBtnSx, opacity: exporting ? 0.6 : 1, cursor: exporting ? "default" : "pointer" }}
          >
            <FileDownloadOutlinedIcon /> {exporting ? "جارٍ التصدير..." : "تصدير"}
          </Box>
        )}
      </Box>
    </Box>
  );
}
