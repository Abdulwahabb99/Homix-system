import React from "react";
import { Box, InputBase, IconButton, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";

const SearchInput = ({ value, onChange, onSearch }) => {
  return (
    <Paper
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        borderRadius: "8px",
        border: "1px solid #E0E0E0",
        overflow: "hidden",
        // direction: "rtl",
      }}
    >
      <IconButton
        type="submit"
        sx={{
          p: "10px 25px",
          backgroundColor: "#DDDFE2",
          borderRadius: 0,
          borderRight: "1px solid #E0E0E0",
        }}
        aria-label="search"
      >
        <SearchIcon sx={{ color: "#6B7280" }} />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1, px: 2 }}
        placeholder="بحث"
        value={value}
        onChange={onChange}
        inputProps={{ "aria-label": "بحث" }}
      />
    </Paper>
  );
};

export default SearchInput;
SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};
