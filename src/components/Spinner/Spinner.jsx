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
      <CircularProgress />
    </Box>
  );
}

export default Spinner;
