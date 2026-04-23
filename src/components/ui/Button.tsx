import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import MuiButton from "@mui/material/Button";

/**
 * Default-styled MUI Button (theme handles primary/secondary; no extra logic).
 */
const Button = forwardRef(function Button(
  { size = "medium", disableElevation = true, ...rest }: any,
  ref: any
) {
  return <MuiButton ref={ref} size={size} disableElevation={disableElevation} {...rest} />;
});

Button.displayName = "Button";

Button.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disableElevation: PropTypes.bool,
  children: PropTypes.node,
};

export default Button;
