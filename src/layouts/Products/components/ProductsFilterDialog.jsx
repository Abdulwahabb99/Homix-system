import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  IconButton,
  Box,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";

/** Brand primary — matches theme; explicit for focus rings */
const PRIMARY = "primary.main";

const selectMenuProps = {
  PaperProps: {
    elevation: 8,
    sx: { borderRadius: 2, mt: 0.5, maxHeight: 360 },
  },
};

/** Comfortable multi-select: visible height + padding, primary focus/label */
const formControlSx = {
  width: "100%",
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    color: PRIMARY,
    "&.Mui-focused": {
      color: PRIMARY,
    },
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 2,
    backgroundColor: "background.paper",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(6, 49, 70, 0.28)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(6, 49, 70, 0.45)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: 2,
      borderColor: PRIMARY,
    },
  },
  "& .MuiSelect-select": {
    py: 1.75,
    px: 1.5,
    minHeight: 24,
    display: "flex",
    alignItems: "center",
    fontSize: "0.875rem",
    lineHeight: 1.4,
  },
};

/**
 * Filter icon that opens a centered dialog: vendors + categories (apply / reset).
 */
function ProductsFilterDialog({
  open,
  onClose,
  isAdmin,
  vendors,
  categories,
  selectedVendors,
  selectedCategories,
  onApply,
  onReset,
}) {
  const [draftVendors, setDraftVendors] = useState(selectedVendors);
  const [draftCategories, setDraftCategories] = useState(selectedCategories);

  useEffect(() => {
    if (open) {
      setDraftVendors(selectedVendors);
      setDraftCategories(selectedCategories);
    }
  }, [open, selectedVendors, selectedCategories]);

  const handleApply = () => {
    onApply(draftVendors, draftCategories);
    onClose();
  };

  const handleReset = () => {
    setDraftVendors([]);
    setDraftCategories([]);
    onReset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      BackdropProps={{ sx: { backgroundColor: "rgba(15, 23, 42, 0.45)" } }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 2.5,
          mb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: PRIMARY,
        }}
      >
        تصفية المنتجات
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="إغلاق"
          sx={{
            color: "text.secondary",
            "&:hover": { color: "primary.main", bgcolor: "action.hover" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          pt: 3,
          px: 2.5,
          pb: 2,
          overflow: "visible",
        }}
      >
        <Stack spacing={2.5}>
          {isAdmin && (
            <FormControl fullWidth sx={{ ...formControlSx, mt: 0.5 }}>
              <InputLabel id="filter-vendors" shrink>
                الموردون
              </InputLabel>
              <Select
                labelId="filter-vendors"
                notched
                label="الموردون"
                displayEmpty
                multiple
                value={draftVendors}
                onChange={(e) => setDraftVendors(e.target.value)}
                MenuProps={selectMenuProps}
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) {
                    return (
                      <Box component="span" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                        اختر الموردين
                      </Box>
                    );
                  }
                  return selected
                    .map((value) => vendors.find((o) => o.value === value)?.label)
                    .filter(Boolean)
                    .join("، ");
                }}
              >
                {vendors.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{ fontSize: "0.875rem", py: 1 }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth sx={formControlSx}>
            <InputLabel id="filter-categories" shrink>
              التصنيفات
            </InputLabel>
            <Select
              labelId="filter-categories"
              notched
              label="التصنيفات"
              displayEmpty
              multiple
              value={draftCategories}
              onChange={(e) => setDraftCategories(e.target.value)}
              MenuProps={selectMenuProps}
              renderValue={(selected) => {
                if (!selected || selected.length === 0) {
                  return (
                    <Box component="span" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                      اختر التصنيفات
                    </Box>
                  );
                }
                return selected
                  .map((value) => categories.find((o) => o.value === value)?.label)
                  .filter(Boolean)
                  .join("، ");
              }}
            >
              {categories.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{ fontSize: "0.875rem", py: 1 }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 2.5,
          py: 2.5,
          gap: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          flexDirection: { xs: "column-reverse", sm: "row" },
          justifyContent: "flex-end",
          backgroundColor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50"),
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
          sx={{
            minHeight: 44,
            fontWeight: 700,
            fontSize: "0.875rem",
            color: PRIMARY,
            borderColor: PRIMARY,
            borderWidth: 2,
            backgroundColor: "background.paper",
            "&:hover": {
              borderColor: PRIMARY,
              backgroundColor: "rgba(6, 49, 70, 0.06)",
            },
          }}
        >
          إعادة التعيين
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          disableElevation
          onClick={handleApply}
          sx={{ minHeight: 44, fontWeight: 700, fontSize: "0.875rem" }}
        >
          تطبيق
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ProductsFilterDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  vendors: PropTypes.array,
  categories: PropTypes.array,
  selectedVendors: PropTypes.array,
  selectedCategories: PropTypes.array,
  onApply: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

function ProductsFilterTriggerButton({ onClick, activeCount }) {
  return (
    <Box sx={{ position: "relative" }}>
      <Button
        variant="outlined"
        onClick={onClick}
        aria-label="فتح التصفية"
        sx={{
          minWidth: 48,
          width: 48,
          height: 40,
          minHeight: 40,
          maxHeight: 40,
          p: 0,
          borderRadius: 1.5,
          borderColor: "primary.main",
          borderWidth: 2,
          color: "primary.main",
          backgroundColor: "rgba(6, 49, 70, 0.06)",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "rgba(6, 49, 70, 0.12)",
          },
        }}
      >
        <FilterListIcon sx={{ fontSize: 22, color: "primary.main" }} />
      </Button>
      {activeCount > 0 && (
        <Box
          component="span"
          sx={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            px: 0.5,
            borderRadius: 99,
            fontSize: "0.65rem",
            fontWeight: 800,
            bgcolor: "primary.main",
            color: "common.white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid",
            borderColor: "background.paper",
          }}
        >
          {activeCount > 9 ? "9+" : activeCount}
        </Box>
      )}
    </Box>
  );
}

ProductsFilterTriggerButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  activeCount: PropTypes.number,
};

ProductsFilterTriggerButton.defaultProps = {
  activeCount: 0,
};

export { ProductsFilterDialog, ProductsFilterTriggerButton };
