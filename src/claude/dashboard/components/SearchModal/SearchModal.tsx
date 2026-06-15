/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axiosRequest from "shared/functions/axiosRequest";
import OrderList from "./OrderList";

const TOOLBAR_H = 48;

function SearchModal({ open, onClose }) {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearchValue("");
      setOrders([]);
      setHasSearched(false);
    }
  }, [open]);

  const fetchOrders = (e) => {
    e?.preventDefault();
    const q = searchValue.trim();
    if (!q) return;

    setIsLoading(true);
    setHasSearched(false);
    setOrders([]);

    axiosRequest
      .get(`/orders?orderNumber=${encodeURIComponent(q)}`)
      .then(({ data }) => {
        setOrders(data?.data?.items ?? data?.data?.orders ?? []);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
        setOrders([]);
      })
      .finally(() => {
        setIsLoading(false);
        setHasSearched(true);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      transitionDuration={220}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(8px)",
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 24px 48px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)",
        },
      }}
    >
      <Stack>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1.5}
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.03)
                : theme.palette.grey[50],
          }}
        >
          <Stack spacing={0.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} letterSpacing="0.02em" color="text.primary">
              بحث سريع عن طلب
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              أدخل رقم الطلب ثم اضغط «بحث» للانتقال للنتائج أو فتح تفاصيل الطلب
            </Typography>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="إغلاق"
            sx={{ color: "text.secondary", mt: -0.5, "&:hover": { bgcolor: "action.hover" } }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        {/* Search input */}
        <Box component="form" onSubmit={fetchOrders} sx={{ px: 2.5, pb: 2.5, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="رقم الطلب"
            placeholder="مثال: 10042"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            autoFocus
            inputProps={{ "aria-label": "رقم الطلب" }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: TOOLBAR_H,
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ m: 0 }}>
                  {isLoading ? (
                    <CircularProgress size={22} color="primary" />
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      disableElevation
                      disabled={!searchValue.trim()}
                      sx={{ minWidth: 72, borderRadius: 1.5 }}
                    >
                      بحث
                    </Button>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Results area */}
        <Box
          sx={{
            minHeight: 280,
            maxHeight: 400,
            overflow: "auto",
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? alpha("#fff", 0.02)
                : alpha(t.palette.primary.main, 0.02),
            px: 2.5,
            py: 2,
          }}
        >
          {isLoading && !orders?.length ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 220 }}>
              <CircularProgress size={32} color="primary" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                جارٍ البحث…
              </Typography>
            </Stack>
          ) : hasSearched && !orders?.length ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.25}
              sx={{ minHeight: 220, px: 2 }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (t) => alpha(t.palette.text.secondary, 0.08),
                }}
              >
                <SearchOffOutlinedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" textAlign="center">
                لا توجد نتائج
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 360 }}>
                لم نجد طلبًا يطابق الرقم. تحقق من الكتابة أو جرّب رقمًا آخر.
              </Typography>
            </Stack>
          ) : !hasSearched && !isLoading ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.25}
              sx={{ minHeight: 220, px: 2 }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                }}
              >
                <FindInPageOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" textAlign="center">
                ابدأ بالبحث
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 360 }}>
                اكتب رقم الطلب في الحقل أعلاه واضغط «بحث» لعرض النتائج هنا
              </Typography>
            </Stack>
          ) : (
            <OrderList orders={orders} />
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            size="medium"
            sx={(t) => ({
              color: t.palette.text.primary,
              borderColor: alpha(t.palette.text.primary, t.palette.mode === "dark" ? 0.35 : 0.22),
              bgcolor: t.palette.background.paper,
              "&:hover": {
                borderColor: t.palette.text.secondary,
                bgcolor: t.palette.action.hover,
              },
            })}
          >
            إغلاق
          </Button>
        </Box>
      </Stack>
    </Dialog>
  );
}

export default SearchModal;
