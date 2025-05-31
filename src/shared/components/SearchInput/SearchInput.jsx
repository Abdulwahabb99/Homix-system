import React from "react";
import { Box, InputBase, IconButton, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";

const SearchInput = ({ onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        borderRadius: "8px",
        border: "1px solid #E0E0E0",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": {
          borderColor: "#6B7280",
        },
      }}
    >
      <IconButton
        type="submit"
        sx={{
          px: "25px",
          backgroundColor: "#DDDFE2",
          borderRadius: 0,
          borderRight: "1px solid #E0E0E0",
        }}
        aria-label="search"
      >
        <SearchIcon sx={{ color: "#6B7280" }} />
      </IconButton>
      <Box sx={{ ml: 1, flex: 1, px: 2, fontSize: "14px" }}>بحث</Box>
    </Box>
  );
};

export default SearchInput;
SearchInput.propTypes = {
  onClick: PropTypes.func.isRequired,
};
