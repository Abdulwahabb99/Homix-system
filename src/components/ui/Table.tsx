import React from "react";
import PropTypes from "prop-types";
import TableContainer from "@mui/material/TableContainer";
import MuiTable from "@mui/material/Table";
import { tokens } from "theme/designTokens";

/**
 * Table wrapper with fintech container styling. Pass `stickyHeader` on MuiTable as needed.
 */
function Table({ children, maxHeight, sx, size = "medium", ...tableProps }: any) {
  return (
    <TableContainer
      sx={{
        maxHeight,
        borderRadius: `${tokens.radius.md}px`,
        border: `1px solid ${tokens.surface.border}`,
        backgroundColor: tokens.surface.card,
        boxShadow: tokens.shadow.card,
        ...sx,
      }}
    >
      <MuiTable size={size as "small" | "medium"} {...tableProps}>
        {children}
      </MuiTable>
    </TableContainer>
  );
}

Table.propTypes = {
  children: PropTypes.node.isRequired,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
  size: PropTypes.oneOf(["small", "medium"]),
  stickyHeader: PropTypes.bool,
};

export default Table;
