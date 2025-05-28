import React, { useState } from "react";
import {
  InputBase,
  IconButton,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const mockResults = ["طلب #12345", "طلب #54321", "منتج: شاحن سريع", "عميل: أحمد محمد"];

const SearchWithModal = () => {
  const [query, setQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      // Simulate search
      const filtered = mockResults.filter((item) => item.includes(value.trim()));
      setResults(filtered);
      setOpenModal(true);
    } else {
      setOpenModal(false);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    setQuery("");
    setResults([]);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: 400,
          border: "1px solid #E0E0E0",
          borderRadius: "8px",
          overflow: "hidden",
          direction: "rtl",
        }}
      >
        <InputBase
          sx={{ px: 2, flex: 1 }}
          placeholder="بحث"
          value={query}
          onChange={handleChange}
        />
        <IconButton
          sx={{
            p: 1.5,
            backgroundColor: "#E5E7EB",
            borderRadius: 0,
            borderRight: "1px solid #E0E0E0",
          }}
        >
          <SearchIcon sx={{ color: "#6B7280" }} />
        </IconButton>
      </Box>

      <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogContent sx={{ direction: "rtl" }}>
          <Typography variant="h6" mb={2}>
            نتائج البحث لـ: {query}
          </Typography>
          {results.length > 0 ? (
            <List>
              {results.map((item, index) => (
                <ListItem button key={index}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">لا توجد نتائج</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchWithModal;
