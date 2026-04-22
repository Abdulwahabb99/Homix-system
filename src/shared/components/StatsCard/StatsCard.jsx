import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import PropTypes from "prop-types";

const StatsCard = ({ title, icon, value }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderInlineStart: `3px solid ${primary}`,
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 1px 0 rgba(255,255,255,0.04) inset, 0 1px 3px rgba(0,0,0,0.2)"
            : "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: "rgba(6, 49, 70, 0.18)",
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 28px rgba(0,0,0,0.25)"
              : "0 4px 16px rgba(6, 49, 70, 0.1), 0 2px 8px rgba(15, 23, 42, 0.06)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          px: 2.25,
          py: 2.25,
          minHeight: 108,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(145deg, rgba(6, 49, 70, 0.35) 0%, rgba(6, 49, 70, 0.15) 100%)"
                : "linear-gradient(145deg, rgba(6, 49, 70, 0.12) 0%, rgba(6, 49, 70, 0.05) 100%)",
            border: "1px solid",
            borderColor: "rgba(6, 49, 70, 0.12)",
            boxShadow: "0 1px 2px rgba(6, 49, 70, 0.06) inset",
            "& svg": {
              display: "block",
              width: 28,
              height: 28,
              maxWidth: "100%",
              maxHeight: "100%",
            },
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            textAlign: "start",
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              lineHeight: 1.2,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
            component="div"
          >
            {title}
          </Typography>
          <Typography
            component="div"
            fontWeight={800}
            color="text.primary"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.35rem" },
              lineHeight: 1.25,
              fontFeatureSettings: '"tnum"',
              fontVariantNumeric: "tabular-nums",
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
};

export default StatsCard;
