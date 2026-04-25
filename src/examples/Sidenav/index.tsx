import { useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Avatar from "@mui/material/Avatar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRootImport from "examples/Sidenav/SidenavRoot";

const SidenavRoot = SidenavRootImport as any;
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";
import { getUserType } from "shared/utils/constants";
import { alpha } from "@mui/material/styles";

function getLoggedInUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return { displayName: "", userType: "" as string | undefined };
    const u = JSON.parse(raw) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      userType?: string;
    };
    const name = [u.firstName, u.lastName]
      .map((p) => (p || "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    return {
      displayName: name || (u.email || "").trim() || "",
      userType: u.userType,
    };
  } catch {
    return { displayName: "", userType: "" as string | undefined };
  }
}

/** أحرف أولية للعرض في الـ avatar: كلمتان → حرف من كلٍ، كلمة واحدة → أول حرفين، بريد فقط → من الجزء قبل @ */
function getDisplayNameInitials(name: string): string {
  const s = (name || "").trim();
  if (!s) return "؟";
  if (s.includes("@")) {
    const local = (s.split("@")[0] || "").replace(/[._-]+/g, " ").trim();
    const p = local.split(/\s+/).filter(Boolean);
    if (p.length >= 2) {
      return (p[0].charAt(0) + p[1].charAt(0)).toUpperCase();
    }
    return (local.slice(0, 2) || "?").toUpperCase();
  }
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  const w = words[0] || s;
  if (w.length >= 2) return w.slice(0, 2).toUpperCase();
  return w.charAt(0).toUpperCase();
}

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const theme = useTheme();
  // يطابق useEffect: شاشة ضيقة أقل من 1200 (قيمة xl في الثيم)
  const isMobileOverlay = useMediaQuery(theme.breakpoints.down("xl"));
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");
  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);
  const toggleSidenavWidth = () => setMiniSidenav(dispatch, !miniSidenav);
  const { displayName: userDisplayName, userType: loggedInUserType } = getLoggedInUser();
  const userTypeLabel = getUserType(String(loggedInUserType || ""));
  const userTooltipText =
    [userDisplayName, userTypeLabel].filter(Boolean).join(" — ") || "المستخدم";
  /** عند الـ overlay (أقل من 1200px): خلفية الـ side nav داكنة — نلزم لون المستخدم أبيض ثابت مثل باقي النصوص */
  const userRowUsesSolidWhite = isMobileOverlay;
  /* عند الشاشة الضيقة: mini فقط. لا نعيّن expanded عند التنقل أو عند الشاشة العريضة — اختيار المستخدم يبقى. */
  useEffect(() => {
    function applyViewportSidenav() {
      const narrow = window.innerWidth < 1200;
      if (narrow) {
        setMiniSidenav(dispatch, true);
      }
      setTransparentSidenav(dispatch, narrow ? false : transparentSidenav);
      setWhiteSidenav(dispatch, narrow ? false : whiteSidenav);
    }
    applyViewportSidenav();
    window.addEventListener("resize", applyViewportSidenav);
    return () => window.removeEventListener("resize", applyViewportSidenav);
  }, [dispatch, transparentSidenav, whiteSidenav]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map(({ type, name, icon, title, noCollapse, key, href, route }) => {
    let returnValue;

    if (type === "collapse") {
      returnValue = href ? (
        <Link
          href={href}
          key={key}
          target="_blank"
          rel="noreferrer"
          onClick={isMobileOverlay ? closeSidenav : undefined}
          sx={{ textDecoration: "none" }}
        >
          <SidenavCollapse
            name={name}
            icon={icon}
            active={key === collapseName}
            noCollapse={noCollapse}
          />
        </Link>
      ) : (
        <NavLink key={key} to={route} onClick={isMobileOverlay ? closeSidenav : undefined}>
          <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
        </NavLink>
      );
    } else if (type === "title") {
      returnValue = (
        <MDTypography
          key={key}
          color={textColor}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </MDTypography>
      );
    } else if (type === "divider") {
      returnValue = (
        <Divider
          key={key}
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
      );
    }

    return returnValue;
  });

  return (
    <SidenavRoot
      {...rest}
      variant={isMobileOverlay ? "temporary" : "permanent"}
      {...(isMobileOverlay
        ? {
            open: !miniSidenav,
            onClose: closeSidenav,
            ModalProps: {
              keepMounted: true,
              BackdropProps: { sx: { backgroundColor: "rgba(0,0,0,0.45)" } },
            },
          }
        : {})}
      ownerState={{
        transparentSidenav,
        whiteSidenav,
        miniSidenav,
        darkMode,
        isMobileOverlay,
      }}
    >
      <MDBox
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          maxWidth: "100%",
          overflow: "hidden",
          overflowX: "hidden",
        }}
      >
        <MDBox
          pt={2}
          pb={1.5}
          px={{ xs: 2, lg: miniSidenav ? 0.75 : 2 }}
          flexShrink={0}
          sx={{ maxWidth: "100%", minWidth: 0 }}
        >
          <MDBox
            display={{ xs: "block", lg: "none" }}
            position="absolute"
            top={0}
            right={0}
            p={1.625}
            onClick={closeSidenav}
            sx={{ cursor: "pointer" }}
          >
            <MDTypography variant="h6" color="secondary">
              <Icon sx={{ fontWeight: "bold" }}>close</Icon>
            </MDTypography>
          </MDBox>
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={0.5}
            width="100%"
            minWidth={0}
            maxWidth="100%"
            sx={{ overflow: "hidden" }}
          >
            <MDBox
              component={NavLink}
              to="/"
              onClick={isMobileOverlay ? closeSidenav : undefined}
              display="flex"
              alignItems="center"
              minWidth={0}
              maxWidth="100%"
              sx={{ flex: 1, minWidth: 0, justifyContent: miniSidenav ? "center" : "flex-start" }}
            >
              {brand && (
                <MDBox
                  sx={{ borderRadius: "12px", flexShrink: 0 }}
                  component="img"
                  src={brand}
                  alt="Brand"
                  width={miniSidenav ? "1.75rem" : "2rem"}
                  height={miniSidenav ? "1.75rem" : "2rem"}
                />
              )}
              <MDBox
                width={!brandName && "100%"}
                sx={(theme) => ({
                  ...sidenavLogoLabel(theme, { miniSidenav }),
                  ...(miniSidenav
                    ? { width: 0, minWidth: 0, maxWidth: 0, overflow: "hidden", ml: 0 }
                    : {}),
                })}
              >
                <MDTypography
                  component="h6"
                  variant="button"
                  fontWeight="700"
                  color={textColor}
                  noWrap
                  sx={{ fontSize: "0.95rem" }}
                >
                  {brandName}
                </MDTypography>
              </MDBox>
            </MDBox>
            <IconButton
              size="small"
              onClick={toggleSidenavWidth}
              aria-label={miniSidenav ? "توسيع القائمة" : "تصغير القائمة"}
              sx={{
                display: { xs: "none", lg: "inline-flex" },
                color: "text.secondary",
                flexShrink: 0,
                minWidth: 0,
                p: miniSidenav ? 0.35 : 0.5,
                "&:hover": { color: "primary.main", bgcolor: "rgba(6, 49, 70, 0.06)" },
              }}
            >
              {miniSidenav ? <MenuOpenIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
            </IconButton>
          </MDBox>
        </MDBox>
        <Divider
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
        <List
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            maxWidth: "100%",
            overflow: "auto",
            overflowX: "hidden",
            py: 0.5,
          }}
        >
          {renderRoutes}
        </List>
        <Divider
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
        <MDBox
          flexShrink={0}
          width="100%"
          maxWidth="100%"
          minWidth={0}
          sx={{ overflow: "hidden", overflowX: "hidden", marginTop: -0.75 }}
        >
          <Tooltip
            title={userTooltipText}
            placement="right"
            disableHoverListener={!miniSidenav}
          >
            <MDBox
              px={{ xs: 2, lg: miniSidenav ? 0.5 : 2 }}
              pt={0.25}
              pb={1.25}
              width="100%"
              minWidth={0}
              maxWidth="100%"
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent={miniSidenav ? "center" : "flex-start"}
              gap={miniSidenav ? 0.75 : 1}
              sx={{ cursor: "default", boxSizing: "border-box" }}
            >
              <Avatar
                alt={userDisplayName || "المستخدم"}
                sx={(t) => {
                  /* نفس وضع أيقونة الشخص: نص/حد أبيض على خلفية القائمة الداكنة */
                  const frostedOnDarkNav = userRowUsesSolidWhite || textColor === "white";
                  return {
                    width: miniSidenav ? 36 : 40,
                    height: miniSidenav ? 36 : 40,
                    flexShrink: 0,
                    fontSize: miniSidenav ? "0.75rem" : "0.8125rem",
                    fontWeight: 700,
                    ...(frostedOnDarkNav
                      ? {
                          bgcolor: alpha(t.palette.common.white, 0.2),
                          color: t.palette.common.white,
                          border: `1px solid ${alpha(t.palette.common.white, 0.35)}`,
                        }
                      : {
                          bgcolor: t.palette.primary.main,
                          color: t.palette.primary.contrastText,
                        }),
                  };
                }}
              >
                {getDisplayNameInitials(userDisplayName)}
              </Avatar>
              {!miniSidenav && (
                <MDBox
                  minWidth={0}
                  flex={1}
                  sx={{
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: 0.25,
                  }}
                >
                  <MDTypography
                    component="p"
                    variant="caption"
                    color={userRowUsesSolidWhite ? "white" : textColor}
                    noWrap
                    display="block"
                    textAlign="start"
                    width="100%"
                    sx={(t) => ({
                      fontSize: "0.95rem",
                      lineHeight: 1.45,
                      fontWeight: 800,
                      ...(userRowUsesSolidWhite && { color: t.palette.common.white }),
                    })}
                  >
                    {userDisplayName || "—"}
                  </MDTypography>
                  {userTypeLabel ? (
                    <MDTypography
                      component="p"
                      variant="caption"
                      noWrap
                      display="block"
                      textAlign="start"
                      width="100%"
                      color="inherit"
                      sx={(t) => {
                        const base = {
                          fontSize: "0.875rem",
                          lineHeight: 1.45,
                          fontWeight: 600,
                        };
                        if (userRowUsesSolidWhite || textColor === "white") {
                          return { ...base, color: alpha(t.palette.common.white, 0.78) };
                        }
                        if (textColor === "dark") {
                          return { ...base, color: t.palette.primary.main };
                        }
                        return { ...base, color: t.palette.text.secondary };
                      }}
                    >
                      {userTypeLabel}
                    </MDTypography>
                  ) : null}
                </MDBox>
              )}
            </MDBox>
          </Tooltip>
        </MDBox>
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "primary",
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
