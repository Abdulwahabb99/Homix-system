import React from "react";
import PropTypes from "prop-types";
import { Box, useTheme } from "@mui/material";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const DotLottie = DotLottieReact as React.ComponentType<Record<string, unknown>>;

const DEFAULT_SRC = "https://lottie.host/59f066fa-ec8d-4524-9371-91c89151390c/rNUHJ8Yjev.lottie";

const defaultSizes = { lg: 420, xl: 540, xxl: 660 };

/**
 * Lottie hero for auth split layout (dotlottie from lottiefiles).
 */
function SignInHeroLottie({ src, sizes: sizesProp }) {
  const theme = useTheme();
  const sizes = { ...defaultSizes, ...sizesProp };
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        [theme.breakpoints.up("lg")]: {
          width: sizes.lg,
          height: sizes.lg,
        },
        [theme.breakpoints.up("xl")]: {
          width: sizes.xl,
          height: sizes.xl,
        },
        [`@media (min-width:1536px)`]: {
          width: sizes.xxl,
          height: sizes.xxl,
        },
      }}
    >
      <DotLottie
        src={src}
        loop
        autoplay
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </Box>
  );
}

SignInHeroLottie.propTypes = {
  src: PropTypes.string,
  sizes: PropTypes.shape({
    lg: PropTypes.number,
    xl: PropTypes.number,
    xxl: PropTypes.number,
  }),
};

SignInHeroLottie.defaultProps = {
  src: DEFAULT_SRC,
  sizes: undefined,
};

export default SignInHeroLottie;
