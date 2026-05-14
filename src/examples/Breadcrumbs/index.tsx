/**
 * Breadcrumb مسطّح (Homix): أيقونة الرئيسية، فاصل / ، روابط رمادية، الصفحة الحالية بالعريض.
 */

import React from "react";
import { Link as RouterLink } from "react-router-dom";
import PropTypes from "prop-types";
import { Box, Link, Typography } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";

const ROUTE_LABELS: Record<string, string> = {
  orders: "الطلبات",
  tickets: "التذاكر",
  dashboard: "لوحة التحكم",
  products: "المنتجات",
  users: "المستخدمين",
  shipments: "الشحن",
  edit: "تعديل",
  login: "تسجيل الدخول",
};

function formatSegment(segment: string) {
  if (!segment) return "";
  const key = String(segment).toLowerCase();
  if (ROUTE_LABELS[key]) return ROUTE_LABELS[key];
  return String(segment).replace(/-/g, " ");
}

function Breadcrumbs({
  title,
  route,
  light: _light,
}: {
  title?: string;
  route: string | string[];
  light?: boolean;
  icon?: string;
}) {
  const routeList = (Array.isArray(route) ? route : []).filter((s) => s !== "" && s != null);
  const lastSegment = routeList.length > 0 ? routeList[routeList.length - 1] : "";
  const parents = routeList.length > 1 ? routeList.slice(0, -1) : [];
  const currentText = formatSegment((title && String(title)) || lastSegment || "الرئيسية");

  const sep = (
    <Typography component="span" sx={{ fontSize: "0.75rem", color: HX.tx3, flexShrink: 0, px: 0.15 }}>
      /
    </Typography>
  );

  const linkSx = {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: HX.tx2,
    textDecoration: "none",
    "&:hover": { color: HX.accent },
  };

  return (
    <Box
      component="nav"
      aria-label="مسار التنقل"
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0.25,
        rowGap: 0.5,
        minWidth: 0,
        fontFamily: "'Cairo',sans-serif",
      }}
    >
      <Link
        component={RouterLink}
        to="/"
        aria-label="الرئيسية"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          border: `0.5px solid ${HX.border}`,
          borderRadius: "9px",
          bgcolor: HX.surface,
          color: HX.tx2,
          flexShrink: 0,
          transition: "0.15s",
          "&:hover": { color: HX.accent, borderColor: HX.accentBorder },
        }}
      >
        <HomeOutlinedIcon sx={{ fontSize: 18 }} />
      </Link>

      {routeList.length > 0 && (
        <>
          {sep}
          {parents.map((el, i) => {
            const to = `/${routeList.slice(0, i + 1).join("/")}`;
            const label = formatSegment(el);
            return (
              <React.Fragment key={to}>
                <Link component={RouterLink} to={to} sx={linkSx}>
                  {label}
                </Link>
                {sep}
              </React.Fragment>
            );
          })}
          <Typography
            component="h1"
            id="app-page-breadcrumb-title"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: HX.tx,
              maxWidth: { xs: 200, sm: 360 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentText}
          </Typography>
        </>
      )}
    </Box>
  );
}

Breadcrumbs.defaultProps = {
  light: false,
};

Breadcrumbs.propTypes = {
  title: PropTypes.string,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  light: PropTypes.bool,
  icon: PropTypes.string,
};

export default Breadcrumbs;
