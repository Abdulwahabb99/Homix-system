import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController, setMiniSidenav } from "context";
import { Icon } from "@mui/material";
import HomixNotificationsButton from "components/HomixPageHeader/HomixNotificationsButton";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

interface Props {
  greeting: string;
  firstName: string;
  todayAr: string;
  isVendor: boolean;
  onAddOrder: () => void;
}

export default function HomixDashboardHeader({
  greeting,
  firstName,
  todayAr,
  isVendor,
  onAddOrder,
}: Props) {
  const theme = useTheme();
  const [muiController, dispatch] = useMaterialUIController();
  const { miniSidenav } = muiController;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const iconBtnSx = {
    width: 34,
    height: 34,
    border: `0.5px solid rgba(0,0,0,0.1)`,
    borderRadius: "9px",
    bgcolor: HX.surface,
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    color: HX.tx2,
    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
  };

  return (
    <>
      {/* ── Top bar ── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: theme.zIndex.appBar,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mt: theme.spacing(-3),
          mx: theme.spacing(-3),
          pb: "10px",
          pt: "10px",
          minHeight: 56,
          paddingInlineStart: { xs: 2, xl: "22px" },
          paddingInlineEnd: { xs: 2, xl: "22px" },
          bgcolor: HX.surface,
          borderBottom: `1px solid ${HX.border2}`,
          boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        {/* Right side — greeting */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 800,
              color: HX.tx,
              fontFamily: FONT,
              lineHeight: 1.3,
            }}
          >
            {greeting}، {firstName} 👋
          </Typography>
          <Typography
            sx={{
              fontSize: "12.5px",
              fontWeight: 600,
              color: HX.tx2,
              fontFamily: FONT,
              mt: "1px",
              display: { xs: "none", md: "block" },
            }}
          >
            إليك ملخص أداء اليوم
          </Typography>
        </Box>

        {/* Left side — actions */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {/* Date pill */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              height: 34,
              px: "12px",
              border: `0.5px solid rgba(0,0,0,0.1)`,
              borderRadius: "9px",
              bgcolor: HX.surface,
              boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
              fontFamily: FONT,
              fontSize: "12px",
              fontWeight: 600,
              color: HX.tx2,
              whiteSpace: "nowrap",
            }}
          >
            {todayAr}
          </Box>

          {/* Search icon */}
          <IconButton
            size="small"
            aria-label="بحث"
            onClick={() => setSearchOpen(true)}
            sx={iconBtnSx}
          >
            <SearchIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Notifications bell */}
          <HomixNotificationsButton />

          {/* New order button */}
          {!isVendor && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: "15px !important" }} />}
              onClick={onAddOrder}
              sx={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "12.5px",
                borderRadius: "9px",
                px: "14px",
                py: "7px",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              }}
            >
              طلب جديد
            </Button>
          )}

          {/* Mobile menu toggle */}
          <IconButton
            size="small"
            aria-label="فتح القائمة"
            onClick={() => setMiniSidenav(dispatch, !miniSidenav)}
            sx={{
              display: { xs: "inline-flex", xl: "none" },
              ...iconBtnSx,
            }}
          >
            <Icon sx={{ fontSize: 22 }}>{miniSidenav ? "menu_open" : "menu"}</Icon>
          </IconButton>
        </Stack>
      </Box>

      {/* ── Search dialog ── */}
      <Dialog
        open={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchQuery(""); }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "14px",
            overflow: "hidden",
            fontFamily: FONT,
          },
        }}
      >
        <DialogContent sx={{ p: "20px 20px 24px", direction: "rtl" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontSize: "15px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>
              البحث
            </Typography>
            <IconButton
              size="small"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              sx={{ color: HX.tx3, "&:hover": { color: HX.tx } }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <TextField
            autoFocus
            fullWidth
            placeholder="ابحث عن طلب، منتج، عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: HX.tx3 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": {
                fontFamily: FONT,
                fontSize: "13.5px",
                borderRadius: "10px",
                bgcolor: HX.surface2,
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: HX.accent,
                boxShadow: `0 0 0 3px ${HX.accentLight}`,
              },
            }}
          />

          {!searchQuery && (
            <Typography sx={{ mt: 3, fontSize: "12px", color: HX.tx3, fontFamily: FONT, textAlign: "center" }}>
              اكتب للبدء في البحث
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
