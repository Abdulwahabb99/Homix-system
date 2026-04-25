import React from "react";
import { Box, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";

/** Aligned to DateRangePicker in `index.css` (40px) */
const TOOLBAR_H = 40;

const SearchInput = ({ onClick }) => {
  return (
    <Paper
      component="div"
      elevation={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="فتح البحث"
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: TOOLBAR_H,
        minHeight: TOOLBAR_H,
        maxHeight: TOOLBAR_H,
        borderRadius: 1.5,
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.1)",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          flexShrink: 0,
          alignSelf: "stretch",
          background: (t) =>
            t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(99, 102, 241, 0.07)",
          borderInlineEnd: "1px solid",
          borderColor: "divider",
        }}
      >
        <SearchIcon sx={{ color: "primary.main", fontSize: 20 }} />
      </Box>
      <InputBase
        readOnly
        sx={{
          flex: 1,
          height: 1,
          px: 1.5,
          fontSize: "0.8125rem",
        }}
        placeholder="بحث سريع عن الطلبات…"
        inputProps={{ "aria-readonly": true }}
      />
    </Paper>
  );
};

export default SearchInput;
SearchInput.propTypes = {
  onClick: PropTypes.func.isRequired,
};
