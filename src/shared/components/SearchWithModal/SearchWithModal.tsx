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

interface SearchWithModalProps {
  /** Controlled mode: pass open + onClose to drive the dialog from outside */
  open?: boolean;
  onClose?: () => void;
}

const SearchWithModal = ({ open: controlledOpen, onClose: controlledClose }: SearchWithModalProps = {}) => {
  const isControlled = controlledOpen !== undefined;

  const [query, setQuery] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [results, setResults] = useState([]);

  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      const filtered = mockResults.filter((item) => item.includes(value.trim()));
      setResults(filtered);
      if (!isControlled) setInternalOpen(true);
    } else {
      setResults([]);
      if (!isControlled) setInternalOpen(false);
    }
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    if (isControlled) {
      controlledClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  return (
    <>
      {/* Only render the trigger bar in uncontrolled mode */}
      {!isControlled && (
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
      )}

      {/* In controlled mode, render a search input inside the dialog */}
      <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogContent sx={{ direction: "rtl" }}>
          <Typography variant="h6" mb={2}>
            البحث
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              overflow: "hidden",
              mb: 2,
            }}
          >
            <InputBase
              autoFocus
              sx={{ px: 2, flex: 1, fontFamily: "'Cairo',sans-serif" }}
              placeholder="ابحث عن طلب، منتج، عميل..."
              value={query}
              onChange={handleChange}
            />
            <Box
              sx={{
                p: 1.5,
                backgroundColor: "#E5E7EB",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SearchIcon sx={{ color: "#6B7280" }} />
            </Box>
          </Box>

          {query.trim() ? (
            results.length > 0 ? (
              <List>
                {results.map((item, index) => (
                  <ListItem button key={index}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ fontFamily: "'Cairo',sans-serif" }}>
                لا توجد نتائج
              </Typography>
            )
          ) : (
            <Typography
              color="text.secondary"
              sx={{ fontFamily: "'Cairo',sans-serif", textAlign: "center", py: 2 }}
            >
              اكتب للبدء في البحث
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchWithModal;
