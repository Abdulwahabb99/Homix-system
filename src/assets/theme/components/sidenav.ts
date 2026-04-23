import colors from "assets/theme/base/colors";
import pxToRem from "assets/theme/functions/pxToRem";

const { white } = colors;

const sidenav = {
  styleOverrides: {
    root: {
      width: pxToRem(260),
      whiteSpace: "nowrap",
      border: "none",
    },

    paper: {
      width: pxToRem(260),
      /* خلفية فاتحة مثل الـ reference (لوحة بجانب المحتوى) */
      backgroundColor: "#f4f6f9",
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
