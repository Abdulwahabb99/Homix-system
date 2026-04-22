import React from "react";
import { CircularProgress, Box } from "@mui/material";

function Spinner() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Adjust based on your needs
      }}
    >
      <CircularProgress color="primary" thickness={4} size={48} />
    </Box>
  );
}

export default Spinner;
