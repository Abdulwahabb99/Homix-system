// components/StatsCard.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const StatsCard = ({ title, icon, value }) => {
  return (
    <Box
      sx={{
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#053B58",
          color: "#fff",
          px: 2,
          py: 2,
          gap: 1,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: "24.54px 24.54px 6.135px 6.135px",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Typography fontWeight="600" fontSize="20px" whiteSpace={"nowrap"}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 2, textAlign: "left" }}>
        <Typography textAlign={"left"} fontSize="20px" fontWeight="bold" color="#45464E">
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
