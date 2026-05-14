import React from "react";
import { Box, Icon, IconButton, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "examples/Breadcrumbs";
import { useMaterialUIController, setMiniSidenav } from "context";
import HomixNotificationsButton from "components/HomixPageHeader/HomixNotificationsButton";
import { HX } from "layouts/Orders/ordersHomixTheme";

export interface HomixPageHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** يستبدل مسار التنقل الافتراضي (مثلاً تفاصيل طلب بعناوين عربية واضحة) */
  breadcrumb?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * الشريط العلوي الموحّد: breadcrumbs أو عنوان، + مجموعة نهاية السطر: إشعارات ثم الإجراءات (ثم قائمة الجوال).
 */
export default function HomixPageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  sx: sxOuter,
}: HomixPageHeaderProps) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const route = pathname.split("/").slice(1).filter(Boolean);

  const [muiController, dispatch] = useMaterialUIController();
  const { miniSidenav } = muiController;

  const useAutoBreadcrumbs =
    breadcrumb == null && (title === undefined || title === null);
  const hasActions = actions != null && actions !== false;

  return (
    <Box
      sx={{
        alignSelf: "stretch",
        position: "sticky",
        top: 0,
        display: "flex",
        alignItems: "center",
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
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
        flexShrink: 0,
        zIndex: theme.zIndex.appBar,
        ...sxOuter,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
          minWidth: 0,
          gap: 1.5,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
          {breadcrumb != null ? (
            <Box sx={{ "& *": { fontFamily: "'Cairo',sans-serif" } }}>{breadcrumb}</Box>
          ) : useAutoBreadcrumbs ? (
            <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={false} />
          ) : typeof title === "string" ? (
            <Typography
              sx={{
                fontSize: "17px",
                fontWeight: 800,
                color: HX.tx,
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              {title}
            </Typography>
          ) : (
            <Box sx={{ "& *": { fontFamily: "'Cairo',sans-serif" } }}>{title}</Box>
          )}

          {!useAutoBreadcrumbs && subtitle != null && (
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              {typeof subtitle === "string" ? (
                <Typography
                  sx={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: HX.tx2,
                    mt: "2px",
                    fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  {subtitle}
                </Typography>
              ) : (
                <Box sx={{ mt: "2px", fontFamily: "'Cairo',sans-serif" }}>{subtitle}</Box>
              )}
            </Box>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}
        >
          <HomixNotificationsButton />
          {hasActions && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ flexShrink: 0, flexWrap: "wrap" }}
            >
              {actions}
            </Stack>
          )}
          <IconButton
            size="small"
            aria-label="فتح القائمة"
            onClick={() => setMiniSidenav(dispatch, !miniSidenav)}
            sx={{
              display: { xs: "inline-flex", xl: "none" },
              width: 40,
              height: 40,
              border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
              bgcolor: HX.surface,
              color: HX.tx2,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
            }}
          >
            <Icon sx={{ fontSize: 22 }}>{miniSidenav ? "menu_open" : "menu"}</Icon>
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
