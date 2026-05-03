import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

export interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  valueColor?: string;
  change?: string;
  changeUp?: boolean;
  topLabel?: string;
}

export default function KpiCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  change,
  changeUp,
  topLabel,
}: KpiCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.75,
        borderRadius: 2.5,
        borderColor: "divider",
        cursor: "default",
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.25}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
        {topLabel && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
            {topLabel}
          </Typography>
        )}
      </Stack>

      <Typography
        fontWeight={800}
        sx={{ fontSize: "1.4rem", lineHeight: 1, mb: 0.4, color: valueColor ?? "text.primary" }}
      >
        {value}
      </Typography>

      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: "0.78rem" }}>
        {label}
      </Typography>

      {change && (
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{
            display: "block",
            mt: 0.75,
            fontSize: "0.72rem",
            color: changeUp ? "#10b981" : "#ef4444",
          }}
        >
          {change}
        </Typography>
      )}
    </Paper>
  );
}
