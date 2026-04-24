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
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
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

function getLoggedInUserDisplayName() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const u = JSON.parse(raw) as { firstName?: string; lastName?: string; email?: string };
    const name = [u.firstName, u.lastName]
      .map((p) => (p || "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || (u.email || "").trim() || "";
  } catch {
    return "";
  }
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
  const userDisplayName = getLoggedInUserDisplayName();
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
            title={userDisplayName || "المستخدم"}
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
              gap={miniSidenav ? 0 : 1}
              sx={{ cursor: "default", boxSizing: "border-box" }}
            >
              <PersonOutlineIcon
                sx={{
                  fontSize: 22,
                  flexShrink: 0,
                  opacity: 0.9,
                  color: textColor,
                  display: "block",
                }}
              />
              {!miniSidenav && (
                <MDBox
                  minWidth={0}
                  flex={1}
                  sx={{ overflow: "hidden", display: "flex", alignItems: "center" }}
                >
                  <MDTypography
                    component="p"
                    variant="caption"
                    color={textColor}
                    noWrap
                    display="block"
                    textAlign="start"
                    fontWeight={600}
                    width="100%"
                    sx={{ fontSize: "0.8125rem", lineHeight: 1.3 }}
                  >
                    {userDisplayName || "—"}
                  </MDTypography>
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
