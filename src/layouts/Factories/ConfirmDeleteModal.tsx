/**
 * تأكيد حذف مصنع — حوار إجراء تدميري بلغة تصميم Homix:
 * أيقونة تحذير + عنوان صريح بالإجراء + تنويه بعدم الرجوع + زر حذف أحمر
 * وإلغاء محايد هو الخيار الآمن (يأخذ التركيز عند الفتح).
 *
 * RTL: الاتجاه عبر السمة dir="rtl" لا عبر sx — المحوّل يقلب `direction`.
 */
import React from "react";
import { Box, CircularProgress, Dialog, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

export interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  handleConfirmDelete: () => void;
  /** اسم العنصر — يُبرز داخل النص ليعرف المستخدم ما سيُحذف بالضبط */
  itemName?: string;
  /** يمنع الإغلاق ويُظهر مؤشّر تحميل أثناء تنفيذ الحذف */
  isDeleting?: boolean;
}

const ghostBtnSx = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 38, px: "18px", borderRadius: "10px",
  border: `1px solid ${HX.border2}`, bgcolor: HX.surface, color: HX.tx2,
  fontSize: "13px", fontWeight: 600, fontFamily: FONT, cursor: "pointer",
  transition: ".15s", "&:hover": { bgcolor: HX.surface3, color: HX.tx },
} as const;

const dangerBtnSx = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
  height: 38, px: "20px", borderRadius: "10px", border: "none",
  bgcolor: HX.red, color: "#fff",
  fontSize: "13px", fontWeight: 700, fontFamily: FONT, cursor: "pointer",
  transition: ".15s", "&:hover": { bgcolor: "#dc2626" },
  "& svg": { fontSize: 16 },
} as const;

export default function ConfirmDeleteModal({
  open,
  onClose,
  handleConfirmDelete,
  itemName,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      dir="rtl"
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          width: 420,
          maxWidth: "94vw",
          borderRadius: "16px",
          bgcolor: HX.surface,
          fontFamily: FONT,
        },
      }}
    >
      <Box sx={{ display: "flex", gap: "14px", p: "24px 24px 20px" }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: HX.redLight, color: HX.red,
            "& svg": { fontSize: 22 },
          }}
        >
          <WarningAmberRoundedIcon />
        </Box>

        <Box sx={{ minWidth: 0, pt: "2px" }}>
          <Typography sx={{ fontSize: "15px", fontWeight: 800, color: HX.tx, fontFamily: FONT, mb: "6px" }}>
            حذف المصنع
          </Typography>
          <Typography sx={{ fontSize: "12.5px", color: HX.tx2, fontFamily: FONT, lineHeight: 1.75 }}>
            {itemName ? (
              <>
                سيتم حذف{" "}
                <Box component="span" sx={{ fontWeight: 700, color: HX.tx }}>
                  {itemName}
                </Box>{" "}
                نهائياً. لا يمكن التراجع عن هذا الإجراء.
              </>
            ) : (
              "سيتم حذف هذا المصنع نهائياً. لا يمكن التراجع عن هذا الإجراء."
            )}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex", justifyContent: "flex-end", gap: "8px",
          p: "14px 24px", borderTop: `0.5px solid ${HX.border}`, bgcolor: HX.surface2,
        }}
      >
        <Box
          component="button"
          type="button"
          autoFocus
          disabled={isDeleting}
          onClick={onClose}
          sx={{ ...ghostBtnSx, opacity: isDeleting ? 0.6 : 1 }}
        >
          إلغاء
        </Box>
        <Box
          component="button"
          type="button"
          disabled={isDeleting}
          onClick={handleConfirmDelete}
          sx={{ ...dangerBtnSx, opacity: isDeleting ? 0.7 : 1 }}
        >
          {isDeleting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <DeleteOutlineIcon />}
          حذف
        </Box>
      </Box>
    </Dialog>
  );
}
