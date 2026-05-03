/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
 */

import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import MDBox from "components/MDBox";

function formatSegment(segment: string) {
  if (!segment) return "";
  return String(segment).replace(/-/g, " ");
}

/**
 * Breadcrumb: الرئيسية + الروابط الوسط + الصفحة الحالية — كلها داخل نفس الـ pill.
 */
function Breadcrumbs({
  title,
  route,
  light,
}: {
  title?: string;
  route: string | string[];
  light?: boolean;
  icon?: string;
}) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const routeList = (Array.isArray(route) ? route : []).filter((s) => s !== "" && s != null);
  const lastSegment = routeList.length > 0 ? routeList[routeList.length - 1] : "";
  /** آباء فقط (روابط)؛ المقطع الأخير يُعرض كـ crumb حالي */
  const parents = routeList.length > 1 ? routeList.slice(0, -1) : [];
  const currentText = formatSegment((title && String(title)) || lastSegment || "الرئيسية");

  const isLight = Boolean(light);
  // الألوان الذهبية/الكريمية الموحّدة للـ pill
  const GOLD = "#b8932a";
  const GOLD_BORDER = "rgba(185, 152, 60, 0.40)";
  const CREAM_BG = "#fef9ef";

  const pillSx = {
    display: "inline-flex",
    alignItems: "center",
    maxWidth: "100%",
    px: { xs: 1.25, sm: 1.75 },
    py: 0.65,
    borderRadius: 2.5,
    border: "1px solid",
    borderColor: isLight ? alpha("#fff", 0.22) : GOLD_BORDER,
    bgcolor: isLight ? alpha("#fff", 0.1) : CREAM_BG,
    backdropFilter: isLight ? "blur(8px)" : "none",
    "& .MuiBreadcrumbs-ol": {
      flexWrap: isSm ? "wrap" : "nowrap",
      alignItems: "center",
    },
  } as const;

  const crumbTextSx = {
    display: "block",
    maxWidth: { xs: 120, sm: 200, md: 280 },
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "0.8125rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
    lineHeight: 1.4,
    textTransform: "lowercase" as const,
    color: isLight ? theme.palette.common.white : alpha(GOLD, 0.75),
  };

  const currentTextSx = {
    ...crumbTextSx,
    fontWeight: 700,
    maxWidth: { xs: 160, sm: 240, md: 360 },
    textTransform: "none" as const,
    color: isLight ? theme.palette.common.white : GOLD,
    fontVariantNumeric: "tabular-nums" as const,
  };

  const sep = (
    <NavigateNextIcon
      sx={{
        fontSize: 16,
        color: isLight ? alpha("#fff", 0.5) : alpha(GOLD, 0.5),
        display: "block",
        mx: 0.15,
        flexShrink: 0,
        transform: theme.direction === "rtl" ? "scaleX(-1)" : "none",
      }}
    />
  );

  const breadcrumbsSx = {
    width: "100%",
    minWidth: 0,
    "& .MuiBreadcrumbs-separator": { m: 0, flexShrink: 0 },
    "& .MuiBreadcrumbs-ol": {
      rowGap: 0.5,
      columnGap: 0.25,
    },
    "& .MuiBreadcrumbs-li": {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      width: "auto",
      minWidth: "min-content",
    },
    "& .MuiBreadcrumbs-li a": {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      minWidth: "min-content",
      borderRadius: 1,
      px: 0.4,
      py: 0.1,
      textDecoration: "none",
      color: "inherit",
      transition: "background-color 0.2s",
      "&:hover": {
            bgcolor: isLight ? alpha("#fff", 0.1) : alpha(GOLD, 0.08),
          },
    },
  };

  return (
    <MDBox mr={{ xs: 0, xl: 6 }} sx={{ minWidth: 0 }}>
      <Box component="nav" aria-label="مسار التنقل" sx={pillSx}>
        <MuiBreadcrumbs separator={sep} sx={breadcrumbsSx}>
          <Link to="/" style={{ textDecoration: "none" }} aria-label="الرئيسية">
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: isLight ? theme.palette.common.white : GOLD,
                p: 0.25,
                borderRadius: 1,
                transition: "background-color 0.2s",
                "&:hover": {
                  bgcolor: isLight ? alpha("#fff", 0.12) : alpha(GOLD, 0.1),
                },
              }}
            >
              <HomeOutlinedIcon sx={{ fontSize: 18, display: "block" }} />
            </Box>
          </Link>
          {parents.map((el, i) => {
            const to = `/${routeList.slice(0, i + 1).join("/")}`;
            const label = formatSegment(el);
            return (
              <Link key={to} to={to} style={{ textDecoration: "none" }}>
                <Typography component="span" variant="body2" sx={crumbTextSx}>
                  {label}
                </Typography>
              </Link>
            );
          })}
          {routeList.length > 0 && (
            <Typography
              component="h1"
              variant="body2"
              id="app-page-breadcrumb-title"
              sx={currentTextSx}
            >
              {currentText}
            </Typography>
          )}
        </MuiBreadcrumbs>
      </Box>
    </MDBox>
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
