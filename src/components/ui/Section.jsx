import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

/**
 * Consistent page section container (max width + padding).
 * Pure layout; no business logic.
 */
function Section({ children, maxWidth = "lg", disableGutters = false, sx, ...rest }) {
  return (
    <Box
      component="section"
      maxWidth={maxWidth === false ? "none" : maxWidth}
      width="100%"
      mx="auto"
      px={disableGutters ? 0 : { xs: 2, sm: 3 }}
      py={{ xs: 2, sm: 3 }}
      sx={sx}
      {...rest}
    >
      {children}
    </Box>
  );
}

Section.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOfType([
    PropTypes.oneOf([false, "xs", "sm", "md", "lg", "xl"]),
    PropTypes.number,
    PropTypes.string,
  ]),
  disableGutters: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};

export default Section;
