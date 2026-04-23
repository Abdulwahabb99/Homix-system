/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }: any) => {
  const { palette, boxShadows, transitions, breakpoints, functions } = theme;
  const {
    transparentSidenav,
    whiteSidenav,
    miniSidenav,
    darkMode,
    isMobileOverlay = false,
  } = ownerState;

  const expandedWidth = 260;
  const miniWidth = 80;
  const { transparent, gradients, white, background } = palette;
  const { xxl } = boxShadows;
  const { pxToRem, linearGradient } = functions;

  let backgroundValue = darkMode
    ? background.sidenav
    : linearGradient(gradients.dark.main, gradients.dark.state);

  if (transparentSidenav) {
    backgroundValue = transparent.main;
  } else if (whiteSidenav) {
    backgroundValue = white.main;
  }

  // styles for the sidenav when miniSidenav={false}
  const drawerOpenStyles = () => ({
    background: backgroundValue,
    transform: "translateX(0)",
    height: "100vh",
    maxHeight: "100vh",
    margin: 0,
    borderRadius: 0,
    top: 0,
    boxSizing: "border-box",
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),

    [breakpoints.up("lg")]: {
      boxShadow: transparentSidenav ? "none" : xxl,
      left: 0,
      right: 0,
      width: expandedWidth,
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
    },
  });

  // styles for the sidenav when miniSidenav={true} (أيقونات فقط)
  const drawerCloseStyles = () => ({
    background: backgroundValue,
    height: "100vh",
    maxHeight: "100vh",
    margin: 0,
    borderRadius: 0,
    top: 0,
    boxSizing: "border-box",
    transform: `translateX(${pxToRem(-320)})`,
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),

    [breakpoints.up("lg")]: {
      boxShadow: transparentSidenav ? "none" : xxl,
      left: 0,
      right: 0,
      width: miniWidth,
      overflowX: "hidden",
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.shorter,
      }),
    },
  });

  const mobileOverlayPaper = {
    position: "fixed",
    margin: 0,
    boxSizing: "border-box",
    insetInlineStart: 0,
    insetBlockStart: 0,
    insetBlockEnd: 0,
    minHeight: "100dvh",
    maxHeight: "100dvh",
    width: `min(calc(${expandedWidth}px + env(safe-area-inset-right, 0px)), 100vw)`,
    maxWidth: "100vw",
  };

  return {
    // دائمًا: الـ root العريض 260 يسبب overflow فقط عند permanent على شاشة ضيقة؛ مع temporary (موبايل) لا يلزم
    ...(!isMobileOverlay && {
      [breakpoints.down("lg")]: {
        width: 0,
        minWidth: 0,
        maxWidth: 0,
        overflow: "visible",
      },
    }),
    "& .MuiDrawer-paper": isMobileOverlay
      ? {
          background: backgroundValue,
          margin: 0,
          borderRadius: 0,
          top: 0,
          boxSizing: "border-box",
          height: "100dvh",
          minHeight: "100dvh",
          maxHeight: "100dvh",
          boxShadow: xxl,
          border: "none",
          borderInlineEnd: `1px solid ${theme.palette.divider}`,
          transform: "none",
          ...mobileOverlayPaper,
        }
      : {
          boxShadow: xxl,
          border: "none",
          borderInlineEnd: `1px solid ${theme.palette.divider}`,
          ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),
          [breakpoints.down("lg")]: {
            position: "fixed",
            margin: 0,
            boxSizing: "border-box",
            insetInlineStart: 0,
            insetBlockStart: 0,
            insetBlockEnd: 0,
            minHeight: "100dvh",
            maxHeight: "100dvh",
            width: `min(calc(${expandedWidth}px + env(safe-area-inset-right, 0px)), 100vw)`,
            maxWidth: "100vw",
          },
        },
  };
});
