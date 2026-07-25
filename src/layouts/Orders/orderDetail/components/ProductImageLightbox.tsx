/**
 * نافذة تكبير صورة المنتج (lightbox) — تُغلق بالزر أو بالنقر خارج الصورة.
 */
import React from "react";
import { Box, IconButton, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ProductImageLightboxProps {
  image: string | null;
  onClose: () => void;
}

export default function ProductImageLightbox({ image, onClose }: ProductImageLightboxProps) {
  return (
    <Modal
      open={Boolean(image)}
      onClose={onClose}
      BackdropProps={{ sx: { bgcolor: "rgba(0,0,0,0.9)" } }}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2, sm: 3 } }}
    >
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          outline: "none",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="إغلاق"
          sx={{
            position: "absolute",
            top: 8,
            insetInlineEnd: 8,
            width: 40,
            height: 40,
            zIndex: 1,
            bgcolor: "rgba(0,0,0,0.55)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
          }}
        >
          <CloseIcon sx={{ fontSize: 22 }} />
        </IconButton>
        <Box
          component="img"
          src={image ?? ""}
          alt=""
          sx={{
            display: "block",
            width: "auto",
            height: "auto",
            maxWidth: { xs: "65vw", sm: "420px" },
            maxHeight: { xs: "60vh", sm: "80vh" },
            objectFit: "contain",
            borderRadius: "12px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
          }}
        />
      </Box>
    </Modal>
  );
}
