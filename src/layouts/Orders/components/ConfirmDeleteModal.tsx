/* eslint-disable react/prop-types */
import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GppMaybeRoundedIcon from "@mui/icons-material/GppMaybeRounded";

type Tone = "danger" | "primary";

export type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  handleConfirmDelete: () => void;
  title: string;
  message?: string;
  tone?: Tone;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

const BRAND = "#063146";

/**
 * تأكيد — تصميم بطاقة حديث: أيقونة دائرية، ظل لطيف، خلفية ضبابية
 */
function ConfirmDeleteModal({
  open,
  onClose,
  handleConfirmDelete,
  title,
  message,
  tone = "danger",
  confirmButtonText,
  cancelButtonText,
}: ConfirmDeleteModalProps) {
  const theme = useTheme();
  const isDanger = tone === "danger";
  const body =
    message ??
    (isDanger
      ? `هل أنت متأكد من حذف ${title}؟ لا يمكن التراجع عن هذا الإجراء.`
      : "هل تريد المتابعة؟");

  const headTitle = isDanger ? `تأكيد حذف ${title}` : title || "تأكيد";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      transitionDuration={220}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(6px)",
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          position: "relative",
          maxWidth: 400,
          borderRadius: 3.5,
          overflow: "visible",
          border: "1px solid",
          borderColor: alpha(BRAND, 0.1),
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, ${alpha("#fff", 0.06)} 0%, ${theme.palette.background.paper} 100%)`
              : `linear-gradient(180deg, #ffffff 0%, ${alpha(BRAND, 0.02)} 100%)`,
          boxShadow: `0 24px 48px -12px ${alpha(BRAND, 0.2)}, 0 12px 24px -8px ${alpha(
            "#0f172a",
            0.12
          )}`,
        },
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="إغلاق"
        size="small"
        sx={{
          position: "absolute",
          top: 10,
          insetInlineEnd: 10,
          zIndex: 2,
          color: "text.secondary",
          bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
          "&:hover": { bgcolor: (t) => alpha(t.palette.text.primary, 0.1), color: "primary.main" },
        }}
      >
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <DialogContent
        sx={{
          pt: 4.5,
          px: 3,
          pb: 2,
          textAlign: "center",
        }}
      >
        <Stack alignItems="center" spacing={2.5}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (t) =>
                isDanger
                  ? alpha(t.palette.error.main, 0.12)
                  : alpha(t.palette.primary.main, 0.1),
              boxShadow: (t) =>
                `inset 0 1px 0 ${alpha("#fff", 0.2)}, 0 8px 20px -4px ${
                  isDanger ? alpha(t.palette.error.main, 0.3) : alpha(t.palette.primary.main, 0.2)
                }`,
            }}
          >
            {isDanger ? (
              <GppMaybeRoundedIcon sx={{ fontSize: 40, color: "error.main" }} />
            ) : (
              <CheckCircleRoundedIcon sx={{ fontSize: 40, color: "primary.main" }} />
            )}
          </Box>
          <Box sx={{ maxWidth: 300, mx: "auto" }}>
            <Typography
              component="h2"
              fontWeight={800}
              color="text.primary"
              sx={{ fontSize: "1.12rem", lineHeight: 1.4, letterSpacing: "-0.02em" }}
            >
              {headTitle}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.25,
                lineHeight: 1.7,
                fontSize: "0.9rem",
              }}
            >
              {body}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          pb: 2.5,
          pt: 0,
          gap: 1.5,
          flexDirection: { xs: "column-reverse", sm: "row" },
          justifyContent: "center",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          fullWidth
          disableElevation
          sx={(t) => ({
            minHeight: 48,
            maxWidth: { sm: 170 },
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.9rem",
            color: t.palette.text.primary,
            bgcolor: t.palette.mode === "dark" ? alpha(t.palette.common.white, 0.08) : "#f1f5f9",
            border: "1px solid",
            borderColor: t.palette.mode === "dark" ? "divider" : "#e2e8f0",
            "&:hover": {
              bgcolor: t.palette.mode === "dark" ? alpha(t.palette.common.white, 0.12) : "#e2e8f0",
              borderColor: t.palette.mode === "dark" ? "divider" : "#cbd5e1",
            },
          })}
        >
          {cancelButtonText ?? "إلغاء"}
        </Button>
        <Button
          onClick={handleConfirmDelete}
          variant="contained"
          size="large"
          fullWidth
          disableElevation
          sx={{
            minHeight: 48,
            maxWidth: { sm: 200 },
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.9rem",
            ...(isDanger
              ? {
                  color: "#fff",
                  bgcolor: "#b91c1c",
                  "&:hover": { bgcolor: "#991b1b" },
                  "&:active": { bgcolor: "#7f1d1d" },
                }
              : {
                  color: "#fff",
                  bgcolor: BRAND,
                  "&:hover": { bgcolor: "#042433" },
                  "&:active": { bgcolor: "#021a24" },
                }),
          }}
        >
          {confirmButtonText ?? (isDanger ? "تأكيد الحذف" : "تأكيد")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteModal;
