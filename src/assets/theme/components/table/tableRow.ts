// Homix: table body row hover (scoped to body rows)
import colors from "assets/theme/base/colors";
import rgba from "assets/theme/functions/rgba";

const { primary } = colors;

const tableRow = {
  styleOverrides: {
    root: {
      transition: "background-color 0.12s ease",
      ".MuiTableBody-root &:hover": {
        backgroundColor: rgba(primary.main, 0.05),
      },
    },
  },
};

export default tableRow;
