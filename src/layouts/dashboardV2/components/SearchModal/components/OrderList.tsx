/* eslint-disable react/prop-types */
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import moment from "moment";
import { getStatusValue } from "shared/utils/constants";
import { useNavigate } from "react-router-dom";

const OrderList = ({ orders }) => {
  const navigate = useNavigate();
  return (
    <List sx={{ width: "100%", bgcolor: "transparent", p: 0 }}>
      {orders?.map((order, index) => (
        <Box key={order?.id}>
          <ListItem
            alignItems="flex-start"
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              cursor: "pointer",
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
            onClick={() => {
              navigate(`/orders/${order?.id}`);
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
              <Inventory2OutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              disableTypography
              primary={
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography fontWeight={600} fontSize="0.875rem" color="text.primary">
                    {order?.name}
                  </Typography>
                  <Chip
                    label={getStatusValue(order?.status)}
                    size="small"
                    color="default"
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              }
              secondary={
                <Typography color="text.secondary" fontSize="0.8125rem" mt={0.5}>
                  {order?.customer?.firstName} {order?.customer?.lastName} •{" "}
                  {moment(order?.orderDate).format("MMM D, h:mm A")} • EGP{" "}
                  {Number(order?.totalPrice).toFixed(0)}
                </Typography>
              }
            />
          </ListItem>
          {index !== orders.length - 1 && <Divider component="li" />}
        </Box>
      ))}
    </List>
  );
};

export default OrderList;
