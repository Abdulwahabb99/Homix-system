/* eslint-disable react/prop-types */
import React from "react";
import { TextField, Button, Box } from "@mui/material";

const SearchComponent = ({ searchText, setSearchText, handleSearch }) => {
  return (
    <form onSubmit={handleSearch}>
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          label=".."
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit" style={{ color: "#fff" }}>
          بحث
        </Button>
      </Box>
    </form>
  );
};

export default SearchComponent;
