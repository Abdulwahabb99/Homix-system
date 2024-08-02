import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import PageLayout from "examples/LayoutContainers/PageLayout";

function BasicLayout({ children }) {
  return (
    <PageLayout>
      <Grid container spacing={1} justifyContent="center" alignItems="center" height="100vh">
        <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
          {children}
        </Grid>
      </Grid>
    </PageLayout>
  );
}

BasicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
