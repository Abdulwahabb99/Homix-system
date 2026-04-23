/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
 */
function collapseItem(theme, ownerState) {
  const { palette, transitions, breakpoints, boxShadows, borders, functions } = theme;
  const { active, transparentSidenav, whiteSidenav, darkMode, sidenavColor, miniSidenav } =
    ownerState;

  const { white, dark, transparent, grey, gradients, primary } = palette;
  const { md } = boxShadows;
  const { borderRadius } = borders;
  const { pxToRem, rgba, linearGradient } = functions;

  const isLightNav = whiteSidenav && !darkMode;
  const lightActive = isLightNav && active;

  let textColor;
  if (lightActive) {
    textColor = primary.main;
  } else if ((transparentSidenav && !darkMode && !active) || (whiteSidenav && !active)) {
    textColor = dark.main;
  } else {
    textColor = white.main;
  }

  let bg;
  if (lightActive) {
    bg = "rgba(6, 49, 70, 0.1)";
  } else if (active) {
    bg = linearGradient(gradients[sidenavColor].main, gradients[sidenavColor].state);
  } else {
    bg = transparent.main;
  }

  return {
    background: bg,
    color: textColor,
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: `${pxToRem(8)} ${pxToRem(10)}`,
    margin: `${pxToRem(6)} ${pxToRem(12)}`,
    borderRadius: borderRadius.lg,
    ...(lightActive && {
      borderInlineStart: `3px solid ${primary.main}`,
      boxShadow: "none",
    }),
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    boxShadow: lightActive
      ? "none"
      : active && !whiteSidenav && !darkMode && !transparentSidenav
      ? md
      : "none",
    [breakpoints.up("lg")]: {
      ...(miniSidenav && {
        justifyContent: "center",
        paddingLeft: pxToRem(4),
        paddingRight: pxToRem(4),
        marginLeft: pxToRem(8),
        marginRight: pxToRem(8),
      }),
      transition: transitions.create(["box-shadow", "background-color", "width"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.shorter,
      }),
    },

    "&:hover, &:focus": {
      backgroundColor: () => {
        let backgroundValue;

        if (!active) {
          if (isLightNav) {
            backgroundValue = rgba(primary.main, 0.06);
          } else {
            backgroundValue =
              transparentSidenav && !darkMode
                ? grey[300]
                : rgba(whiteSidenav ? grey[400] : white.main, 0.2);
          }
        }

        return backgroundValue;
      },
    },
  };
}

function collapseIconBox(theme, ownerState) {
  const { palette, transitions, borders, functions } = theme;
  const { transparentSidenav, whiteSidenav, darkMode, active } = ownerState;

  const { white, dark, primary } = palette;
  const { borderRadius } = borders;
  const { pxToRem, rgba } = functions;

  const isLightNav = whiteSidenav && !darkMode;

  let mainColor;
  if (isLightNav) {
    mainColor = active ? primary.main : rgba(dark.main, 0.65);
  } else if ((transparentSidenav && !darkMode && !active) || (whiteSidenav && !active)) {
    mainColor = dark.main;
  } else {
    mainColor = white.main;
  }

  let svgColor;
  if (isLightNav) {
    svgColor = active ? primary.main : rgba(dark.main, 0.65);
  } else if (active) {
    svgColor = white.main;
  } else if (transparentSidenav || whiteSidenav) {
    svgColor = dark.main;
  } else {
    svgColor = white.main;
  }

  return {
    minWidth: pxToRem(32),
    minHeight: pxToRem(32),
    color: mainColor,
    borderRadius: borderRadius.md,
    display: "grid",
    placeItems: "center",
    transition: transitions.create("margin", {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.standard,
    }),

    "& svg, svg g": {
      color: svgColor,
    },
  };
}

const collapseIcon = (theme, { active, whiteSidenav, darkMode }) => {
  const { palette } = theme;
  const { white, gradients, primary, grey } = palette;
  const isLightNav = whiteSidenav && !darkMode;
  if (isLightNav) {
    return { color: active ? primary.main : grey[600] };
  }
  return { color: active ? white.main : gradients.dark.state };
};

function collapseText(theme, ownerState) {
  const { typography, transitions, breakpoints, functions } = theme;
  const { miniSidenav, transparentSidenav, active } = ownerState;

  const { size, fontWeightRegular, fontWeightLight } = typography;
  const { pxToRem } = functions;

  return {
    marginLeft: pxToRem(10),

    [breakpoints.up("lg")]: {
      opacity: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1,
      maxWidth: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : "100%",
      marginLeft: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : pxToRem(10),
      transition: transitions.create(["opacity", "margin"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
    },

    "& span": {
      fontWeight: active ? fontWeightRegular : fontWeightLight,
      fontSize: size.sm,
      lineHeight: 0,
    },
  };
}

export { collapseItem, collapseIconBox, collapseIcon, collapseText };
