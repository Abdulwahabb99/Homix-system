import React from "react";
import PropTypes from "prop-types";
import MuiCard from "@mui/material/Card";
import { tokens } from "theme/designTokens";

/**
 * Fintech-style card: radius, soft shadow, optional hover lift.
 */
function Card({ children, variant = "elevation", hover = false, sx, ...rest }) {
  return (
    <MuiCard
      variant={variant}
      elevation={variant === "outlined" ? 0 : 0}
      sx={[
        {
          borderRadius: `${tokens.radius.lg}px`,
          border:
            variant === "outlined"
              ? `1px solid ${tokens.surface.border}`
              : "1px solid rgba(15, 23, 42, 0.06)",
          boxShadow: variant === "outlined" ? "none" : tokens.shadow.card,
          backgroundColor: tokens.surface.card,
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          overflow: "hidden",
          ...(hover && {
            "&:hover": {
              boxShadow: tokens.shadow.cardHover,
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx].filter(Boolean)),
      ]}
      {...rest}
    >
      {children}
    </MuiCard>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["elevation", "outlined"]),
  hover: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};

export default Card;
