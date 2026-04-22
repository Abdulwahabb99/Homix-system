import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";

/**
 * Standard outline text field aligned with theme; forwards all TextField props.
 */
const Input = forwardRef(function Input(
  { variant = "outlined", fullWidth = true, size = "medium", ...rest },
  ref
) {
  return <TextField ref={ref} variant={variant} fullWidth={fullWidth} size={size} {...rest} />;
});

Input.displayName = "Input";

Input.propTypes = {
  variant: PropTypes.oneOf(["outlined", "filled", "standard"]),
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium"]),
};

export default Input;
