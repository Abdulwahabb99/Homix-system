import PropTypes from "prop-types";
import { Box, IconButton, Stack, Typography, useTheme } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import SignInHeroLottie from "components/SignInHeroLottie";
import PageLayout from "examples/LayoutContainers/PageLayout";

/**
 * Split auth layout (reference structure): half form column + half hero.
 * — Top: brand (start) + language affordance (end)
 * — Middle: children centered, max width ~420px
 * — Bottom: foot note
 * — Other half: Lottie, centered; hidden on small screens
 */
function SignInSplitLayout({ children, onLanguageClick }) {
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
        {/* عمود النموذج: هيدر / محتوى مركز / تذييل */}
        <Box
          sx={{
            width: { xs: "100%", lg: "50%" },
            flex: { xs: 1, lg: "0 0 50%" },
            minWidth: 0,
            minHeight: { xs: "100vh", lg: "100vh" },
            height: { xs: "auto", lg: "100vh" },
            display: "flex",
            flexDirection: "column",
            overflow: { xs: "auto", lg: "hidden" },
            px: { xs: 3, md: 6, lg: 8 },
            py: { xs: 3, md: 4, lg: 4 },
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          <Stack
            component="header"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%", flexShrink: 0, minHeight: 48 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
              <Box
                component="img"
                src="/favicon.png"
                alt="Homix"
                sx={{
                  width: 40,
                  height: 40,
                  objectFit: "contain",
                  flexShrink: 0,
                  borderRadius: 1,
                }}
              />
              <Typography
                variant="h6"
                component="span"
                sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "0.04em" }}
              >
                Homix
              </Typography>
            </Stack>
            <IconButton
              type="button"
              size="small"
              color="default"
              aria-label="تبديل اللغة"
              onClick={onLanguageClick}
              sx={{ color: "text.secondary" }}
            >
              <LanguageIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box
            component="main"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
              width: "100%",
              py: { xs: 2, md: 3 },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 420,
                mx: "auto",
                flexShrink: 0,
              }}
            >
              {children}
            </Box>
          </Box>

          <Box
            component="footer"
            sx={{
              flexShrink: 0,
              pt: 2,
              pb: { xs: 2, lg: 0 },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              © {new Date().getFullYear()} Homix — جميع الحقوق محفوظة
            </Typography>
          </Box>
        </Box>

        {/* عمود الـ Lottie: نفس العرض 50%، محتوى في المنتصف */}
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            flex: "0 0 50%",
            width: { lg: "50%" },
            minWidth: 0,
            minHeight: 0,
            height: { lg: "100vh" },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            p: { lg: 4 },
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "min(100%, 680px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
  onLanguageClick: PropTypes.func,
};

SignInSplitLayout.defaultProps = {
  onLanguageClick: undefined,
};

export default SignInSplitLayout;
