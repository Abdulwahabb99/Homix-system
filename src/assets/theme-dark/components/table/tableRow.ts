import colors from "assets/theme-dark/base/colors";
import rgba from "assets/theme-dark/functions/rgba";

const { info } = colors;

const tableRow = {
  styleOverrides: {
    root: {
      transition: "background-color 0.12s ease",
      ".MuiTableBody-root &:hover": {
        backgroundColor: rgba(info.main, 0.08),
      },
    },
  },
};

export default tableRow;
