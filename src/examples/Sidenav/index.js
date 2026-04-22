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
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

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
      <MDBox pt={2} pb={1.5} px={2}>
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
          gap={1}
          width="100%"
        >
          <MDBox
            component={NavLink}
            to="/"
            onClick={isMobileOverlay ? closeSidenav : undefined}
            display="flex"
            alignItems="center"
            minWidth={0}
            sx={{ flex: 1, justifyContent: miniSidenav ? "center" : "flex-start" }}
          >
            {brand && (
              <MDBox
                sx={{ borderRadius: "12px" }}
                component="img"
                src={brand}
                alt="Brand"
                width={miniSidenav ? "2.25rem" : "2rem"}
                height={miniSidenav ? "2.25rem" : "2rem"}
              />
            )}
            <MDBox
              width={!brandName && "100%"}
              sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
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
      <List>{renderRoutes}</List>
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
