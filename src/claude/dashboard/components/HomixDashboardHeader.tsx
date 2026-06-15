import React, { useState } from "react";
import { Box, Button, IconButton, Icon, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController, setMiniSidenav } from "context";
import HomixNotificationsButton from "components/HomixPageHeader/HomixNotificationsButton";
import { HX } from "layouts/Orders/ordersHomixTheme";
import SearchModal from "claude/dashboard/components/SearchModal/SearchModal";

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

      {/* ── Search modal ── */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
