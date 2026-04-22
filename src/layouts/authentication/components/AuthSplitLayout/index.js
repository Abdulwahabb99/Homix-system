import PropTypes from "prop-types";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import SignInHeroLottie from "components/SignInHeroLottie";
import PageLayout from "examples/LayoutContainers/PageLayout";

/**
 * Full-viewport split: form (first) + Lottie hero (second). Lottie hidden on small screens.
 * Wraps with PageLayout so auth route keeps layout context.
 */
function SignInSplitLayout({ children }) {
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";

  return (
    <PageLayout background="white">
      <Box
        sx={{
          minHeight: "100vh",
          height: { lg: "100vh" },
          overflow: { xs: "auto", md: "hidden" },
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          direction: isRTL ? "rtl" : "ltr",
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", lg: "50%" },
            minWidth: { lg: 0 },
            minHeight: { xs: "100vh", lg: "auto" },
            height: { xs: "100vh", lg: "100vh" },
            display: "flex",
            flexDirection: "column",
            justifyContent: { xs: "center", lg: "space-between" },
            overflow: { xs: "auto", lg: "hidden" },
            px: { xs: 3, md: 6, lg: 8 },
            py: { xs: 5, md: 6 },
            pt: { xs: 8, lg: 6 },
            backgroundColor: "#ffffff",
            flex: { xs: 1, lg: "0 0 50%" },
            maxWidth: { lg: "50%" },
            boxSizing: "border-box",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              flexDirection: isRTL ? "row" : "row-reverse",
              mb: { xs: 5, lg: 2 },
              flexShrink: 0,
            }}
          >
            <Box />
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ flexDirection: isRTL ? "row" : "row-reverse" }}
            >
              <Box
                component="img"
                src="/favicon.png"
                alt="Homix"
                sx={{
                  width: 44,
                  height: 44,
                  objectFit: "contain",
                  flexShrink: 0,
                  borderRadius: 1,
                }}
              />
            </Stack>
          </Stack>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: 420,
              width: "100%",
              mx: "auto",
            }}
          >
            {children}
          </Box>

          <Typography
            variant="caption"
            sx={{
              pt: 4,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            © {new Date().getFullYear()} Homix — جميع الحقوق محفوظة
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            p: 4,
            boxSizing: "border-box",
            maxWidth: { lg: "50%" },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <SignInHeroLottie sizes={{ lg: 420, xl: 540, xxl: 660 }} />
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
}

SignInSplitLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SignInSplitLayout;
