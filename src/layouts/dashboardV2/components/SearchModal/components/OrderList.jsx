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
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {orders?.map((order, index) => (
        <Box key={order?.id}>
          <ListItem
            alignItems="flex-start"
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#f6f6f6",
              },
            }}
            onClick={() => {
              navigate(`/orders/${order?.id}`);
            }}
          >
            <ListItemIcon sx={{ minWidth: "auto", mr: 2 }}>
              <Inventory2OutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              disableTypography
              primary={
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography fontWeight={600} fontSize="14px" sx={{ color: "#303030" }}>
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
                <Typography sx={{ color: "#616161" }} fontSize="13px" mt={0.5}>
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
