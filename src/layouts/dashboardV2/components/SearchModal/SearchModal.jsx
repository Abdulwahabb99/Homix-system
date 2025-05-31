/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
} from "@mui/material";
import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axiosRequest from "shared/functions/axiosRequest";
import OrderList from "./components/OrderList";

function SearchModal({ open, onClose }) {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    setIsLoading(true);

    axiosRequest
      .get(`/orders?orderNumber=${searchValue}`)
      .then(({ data }) => {
        setOrders(data.data.orders);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrders();
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #E0E0E0",
            overflow: "hidden",
          }}
        >
          <IconButton
            type="submit"
            sx={{
              px: "25px",
              backgroundColor: "#DDDFE2",
              borderRadius: 0,
              borderRight: "1px solid #E0E0E0",
            }}
            aria-label="search"
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "#6B7280" }} />
            ) : (
              <SearchIcon sx={{ color: "#6B7280" }} />
            )}
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, px: 2, fontSize: "14px" }}
            placeholder="بحث"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            inputProps={{ "aria-label": "بحث" }}
            autoFocus
          />
        </Box>{" "}
      </DialogTitle>
      <DialogContent
        sx={{
          padding: "16px",
          display: "flex",
          justifyContent: "center",
          minHeight: "400px",
          maxHeight: "400px",
        }}
      >
        {orders.length > 0 && <OrderList orders={orders} />}
      </DialogContent>
      <DialogActions style={{ display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center", padding: "16px" }}>
          <Button
            onClick={onClose}
            variant="contained"
            style={{ background: "#000", color: "#fff" }}
          >
            إلغاء
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default SearchModal;
