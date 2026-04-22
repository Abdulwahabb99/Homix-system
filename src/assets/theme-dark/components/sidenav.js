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

// Material Dashboard 2 React base styles
import colors from "assets/theme-dark/base/colors";
import pxToRem from "assets/theme-dark/functions/pxToRem";

const { background } = colors;

const sidenav = {
  styleOverrides: {
    root: {
      width: pxToRem(260),
      whiteSpace: "nowrap",
      border: "none",
    },

    paper: {
      width: pxToRem(260),
      backgroundColor: background.sidenav,
      height: "100vh",
      maxHeight: "100vh",
      margin: 0,
      borderRadius: 0,
      border: "none",
    },

    paperAnchorDockedLeft: {
      borderRight: "none",
    },
  },
};

export default sidenav;
