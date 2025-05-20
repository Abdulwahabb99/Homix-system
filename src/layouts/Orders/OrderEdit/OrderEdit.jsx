import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import Spinner from "components/Spinner/Spinner";
import moment from "moment";
import { PAYMENT_STATUS, statusoptions } from "../utils/constants";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axiosRequest from "shared/functions/axiosRequest";

const baseURI = `${process.env.REACT_APP_API_URL}`;

function OrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [administrator, setAdministrator] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [shippingFees, setShippingFees] = useState("");
  const [toBeCollected, setToBeCollected] = useState("");
  const [commission, setCommission] = useState("");
  const [totalVendorDue, setTotalVendorDue] = useState("");
  const [totalCompanyDue, setTotalCompanyDue] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [shippedFromInventory, setShippedFromInventory] = useState(false);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editOrder = () => {
    setIsSubmitting(true);
    axiosRequest
      .put(`${baseURI}/orders/${id}`, {
        status: orderStatus,
        commission: commission,
        paymentStatus: paymentStatus,
        downPayment: downPayment,
        shippingFees: shippingFees,
        toBeCollected: toBeCollected,
        vendorId: selectedVendor,
        deliveryStatus: deliveryStatus,
        userId: administrator,
        shippedFromInventory: shippedFromInventory,
        totalVendorDue: totalVendorDue,
        totalCompanyDue: totalCompanyDue,
        expectedDeliveryDate: expectedDeliveryDate,
      })
      .then(() => {
        navigate(`/orders/${id}`);
        NotificationMeassage("success", "تم تعديل الطلب ");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const getVendors = () => {
    axiosRequest
      .get("/vendors")
      .then(({ data: { data } }) => {
        const newData = data.map((vendor) => ({ label: vendor.name, value: vendor.id }));
        setVendors(newData);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  useEffect(() => {
    setIsLoading(true);
    axiosRequest
      .get(`${baseURI}/orders/${id}`)
      .then(({ data: { data } }) => {
        setOrderStatus(data.status);
        setPaymentStatus(data.paymentStatus);
        setDownPayment(data.downPayment);
        setShippingFees(data.shippingFees);
        setToBeCollected(data.toBeCollected);
        setCommission(data.commission);
        setTotalCompanyDue(data.totalCompanyDue);
        setTotalVendorDue(data.totalVendorDue);
        setExpectedDeliveryDate(
          moment(data.expectedDeliveryDate).locale("en").format("YYYY-MM-DD")
        );
        setShippedFromInventory(data.shippedFromInventory);
        setAdministrator(data.userId);
        setSelectedVendor(data.orderLines[0].product.vendorId);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    axiosRequest.get("/users").then(({ data: { data } }) => {
      const newUsers = data.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
      }));
      setUsers(newUsers);
    });
    getVendors();
  }, []);
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <IconButton color="#344767" onClick={() => navigate(`/orders/${id}`)}>
          <ArrowNextIcon />
        </IconButton>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <FormControl fullWidth>
              <InputLabel id="orderStatus">حالة الطلب</InputLabel>
              <Select
                fullWidth
                labelId="orderStatus"
                id="orderStatus-select"
                value={orderStatus}
                label="حالة الطلب"
                onChange={(e) => setOrderStatus(e.target.value)}
                sx={{ height: 43 }}
              >
                {statusoptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <FormControl fullWidth>
              <InputLabel id="paymentStatus">حالة الدفع</InputLabel>
              <Select
                fullWidth
                labelId="paymentStatus"
                id="paymentStatus-select"
                value={paymentStatus}
                label="حالة الدفع"
                onChange={(e) => setPaymentStatus(e.target.value)}
                sx={{ height: 43 }}
              >
                {PAYMENT_STATUS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="جدية شراء"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              type="number"
              style={{ margin: "5px 0" }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="تكلفة الشحن"
              value={shippingFees}
              onChange={(e) => setShippingFees(e.target.value)}
              type="number"
              style={{ margin: "5px 0" }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="المبلغ المطلوب تحصيله"
              value={toBeCollected}
              onChange={(e) => setToBeCollected(e.target.value)}
              type="number"
              style={{ margin: "5px 0" }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="العمولة"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              type="number"
              style={{ margin: "5px 0" }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="إجمالي المستحق للبائع"
              value={totalVendorDue}
              onChange={(e) => setTotalVendorDue(e.target.value)}
              type="number"
              style={{ margin: "5px 0" }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="إجمالي المستحق للشركة"
              value={totalCompanyDue}
              onChange={(e) => setTotalCompanyDue(e.target.value)}
              type="number"
              style={{ margin: "5px 0" }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <FormControl fullWidth>
              <InputLabel id="administratorSelect">المسؤول</InputLabel>
              <Select
                fullWidth
                labelId="administratorSelect"
                id="administratorSelect-select"
                value={administrator}
                label="المسؤول"
                onChange={(e) => setAdministrator(e.target.value)}
                sx={{ height: 43 }}
                disabled={!users.length > 0}
              >
                {users.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <FormControl fullWidth>
              <InputLabel id="vendorSelect">المورد</InputLabel>
              <Select
                fullWidth
                labelId="vendorSelect"
                id="vendorSelect-select"
                value={selectedVendor}
                label="المورد"
                onChange={(e) => setSelectedVendor(e.target.value)}
                sx={{ height: 43 }}
                disabled={!vendors.length > 0}
              >
                {vendors.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="تاريخ التسليم المتوقع"
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              InputProps={{
                inputProps: {
                  min: moment().locale("en").format("YYYY-MM-DD"),
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              sx={{ display: "flex", alignItems: "center" }}
              control={
                <Checkbox
                  checked={shippedFromInventory}
                  onChange={(e) => setShippedFromInventory(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography color="#000" fontSize="13px" fontWeight="bold">
                  شحن للمخزن
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate(`/orders/${id}`)}
              variant="contained"
              style={{ background: "#000", color: "#fff", margin: "0 5px" }}
            >
              إلغاء
            </Button>
            <Button
              onClick={editOrder}
              variant="contained"
              style={{ color: "#fff" }}
              disabled={!orderStatus || !paymentStatus}
            >
              {isSubmitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "حفظ"}{" "}
            </Button>
          </Grid>
        </Grid>
      )}
    </DashboardLayout>
  );
}

export default OrderEdit;
