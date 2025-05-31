/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
} from "@mui/material";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";

function SearchModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent>
        <Box
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
          <InputBase
            sx={{ ml: 1, flex: 1, px: 2, fontSize: "14px" }}
            placeholder="بحث"
            value={"hh"}
            // onChange={onChange}
            inputProps={{ "aria-label": "بحث" }}
            // onFocus={onFocus}
          />
        </Box>{" "}
      </DialogContent>
      {/* <DialogActions style={{ display: "flex", justifyContent: "center" }}>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={handleConfirmDelete}
          variant="contained"
          style={{ color: "#fff", background: "red" }}
        >
          تأكيد
        </Button>
      </DialogActions> */}
    </Dialog>
  );
}

export default SearchModal;
