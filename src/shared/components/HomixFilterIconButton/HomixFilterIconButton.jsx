import PropTypes from "prop-types";
import { Box, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

/**
 * Outlined filter icon (badge when filters active) — used on Products, Orders, etc.
 */
function HomixFilterIconButton({ onClick, activeCount, ariaLabel = "فتح التصفية" }) {
  return (
    <Box sx={{ position: "relative" }}>
      <Button
        variant="outlined"
        onClick={onClick}
        aria-label={ariaLabel}
        sx={{
          minWidth: 52,
          width: 52,
          height: 42,
          minHeight: 42,
          maxHeight: 42,
          p: 0,
          borderRadius: 1.5,
          borderWidth: 2,
          borderColor: "rgba(6, 49, 70, 0.22)",
          color: "primary.main",
          backgroundColor: "rgba(6, 49, 70, 0.04)",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "rgba(6, 49, 70, 0.1)",
          },
        }}
      >
        <FilterListIcon sx={{ fontSize: 25, color: "primary.main" }} />
      </Button>
      {activeCount > 0 && (
        <Box
          component="span"
          sx={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            px: 0.5,
            borderRadius: 99,
            fontSize: "0.65rem",
            fontWeight: 800,
            bgcolor: "primary.main",
            color: "common.white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid",
            borderColor: "background.paper",
          }}
        >
          {activeCount > 9 ? "9+" : activeCount}
        </Box>
      )}
    </Box>
  );
}

HomixFilterIconButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  activeCount: PropTypes.number,
  ariaLabel: PropTypes.string,
};

HomixFilterIconButton.defaultProps = {
  activeCount: 0,
};

export default HomixFilterIconButton;
