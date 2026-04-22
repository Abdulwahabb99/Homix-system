import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import PropTypes from "prop-types";

const StatsCard = ({ title, icon, value }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06)",
        border: "1px solid",
        borderColor: "rgba(6, 49, 70, 0.08)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primary} 0%, ${
            theme.palette.primary.dark || primary
          } 100%)`,
          color: "common.white",
          px: 2.5,
          py: 2,
          gap: 1.5,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "common.white",
            borderRadius: "20px 20px 6px 6px",
            padding: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: primary,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            "& svg": { display: "block" },
          }}
        >
          {icon}
        </Box>

        <Typography
          component="div"
          fontWeight={600}
          fontSize="1.05rem"
          sx={{ lineHeight: 1.35, letterSpacing: "0.01em" }}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ px: 2.5, py: 2, textAlign: "right", backgroundColor: "background.paper" }}>
        <Typography
          textAlign="right"
          fontSize="1.25rem"
          fontWeight={700}
          color="text.primary"
          sx={{ letterSpacing: "0.02em" }}
        >
          {value}
        </Typography>
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
