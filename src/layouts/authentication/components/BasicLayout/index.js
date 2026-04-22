import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import PageLayout from "examples/LayoutContainers/PageLayout";
import { useMaterialUIController } from "context";

function BasicLayout({ children }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <PageLayout background="light">
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background: (theme) =>
            darkMode
              ? theme.palette.background.default
              : `linear-gradient(165deg, ${theme.palette.primary.light} 0%, #f4f6f8 42%, #eef2f6 100%)`,
        }}
      >
        <Grid
          container
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: "100vh" }}
        >
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            {children}
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
}

BasicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
