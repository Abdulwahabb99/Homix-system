import React from "react";
import { Box, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";

interface SearchCardProps {
  /** رقم الطلب — wired to existing server-side ?orderNumber param */
  orderNumber: string;
  onOrderNumberChange: (v: string) => void;

  /** رقم العملية — client-side filter on current page */
  operationCode: string;
  onOperationCodeChange: (v: string) => void;

  /** كود المنتج — client-side filter on items[0].code */
  productCode: string;
  onProductCodeChange: (v: string) => void;

  /** اسم العميل — client-side filter on customerName */
  customerName: string;
  onCustomerNameChange: (v: string) => void;
}

const fieldSx = {
  "& .MuiInputLabel-root": { display: "none" },
  "& .MuiOutlinedInput-root": {
    height: 34,
    borderRadius: "8px",
    fontSize: "12.5px",
    fontFamily: "'Cairo',sans-serif",
    bgcolor: HX.surface,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: HX.accent,
      borderWidth: 1,
      boxShadow: `0 0 0 3px ${HX.accentLight}`,
    },
  },
  "& .MuiOutlinedInput-input": { px: "12px", py: 0, fontFamily: "'Cairo',sans-serif" },
} as const;

function SearchField({
  label, placeholder, value, onChange,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Typography component="label"
        sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2, fontFamily: "'Cairo',sans-serif" }}>
        {label}
      </Typography>
      <TextField
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="outlined"
        InputLabelProps={{ shrink: false }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon sx={{ fontSize: 13, color: HX.tx3 }} />
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />
    </Box>
  );
}

export default function OrdersHomixSearchCard({
  orderNumber, onOrderNumberChange,
  operationCode, onOperationCodeChange,
  productCode, onProductCodeChange,
  customerName, onCustomerNameChange,
}: SearchCardProps) {
  return (
    <Box sx={{ ...cardSx, p: "14px 18px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "12px" }}>
        <Box component="svg" viewBox="0 0 24 24"
          sx={{ width: 14, height: 14, stroke: HX.accent, fill: "none", strokeWidth: 2, flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: "'Cairo',sans-serif" }}>
          البحث
        </Typography>
      </Box>

      {/* 4-column grid */}
      <Grid container spacing="10px">
        <Grid item xs={12} sm={6} md={3}>
          <SearchField label="رقم العملية" placeholder="OP-3001..." value={operationCode} onChange={onOperationCodeChange} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SearchField label="رقم الطلب"   placeholder="#31668..."  value={orderNumber}    onChange={onOrderNumberChange}    />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SearchField label="كود المنتج"  placeholder="RKA-001..."  value={productCode}   onChange={onProductCodeChange}    />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SearchField label="اسم العميل"  placeholder="اسم العميل..." value={customerName} onChange={onCustomerNameChange}  />
        </Grid>
      </Grid>
    </Box>
  );
}
