/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { PAYMENT_STATUS, statusoptions } from "../utils/constants";
import { useOrdersMeta } from "query/ordersMeta.api";
import axiosRequest from "shared/functions/axiosRequest";
import moment from "moment";
import {
  getUserSelectAutocompleteConfig,
  getUserSelectValue,
} from "layouts/Orders/components/userSelectAutocompleteConfig";

const EditOrderModal = ({ open, onEdit, onClose, data, vendors, isSubmitting }) => {
  const [users, setUsers] = useState([]);
  const [orderStatus, setOrderStatus] = useState(data.status);
  const [commission, setCommission] = useState(data.commission);
  const [paymentStatus, setPaymentStatus] = useState(data.paymentStatus ? data.paymentStatus : "");
  const [orderSource, setOrderSource] = useState(data.orderSource ?? "");
  const [deliveryBy, setDeliveryBy] = useState<number | "">("");
  const [downPayment, setDownPayment] = useState(data.downPayment);
  const [shippingCost, setShippingCost] = useState(data.shippingFees);
  const [toBeCollected, setToBeCollected] = useState(data.toBeCollected);
  const [selectedVendor, setSelectedVendor] = useState(data.items[0].product.vendorId);
  const [administrator, setAdministrator] = useState(data?.userId ? data?.userId : null);
  const [totalVendorDue, setTotalVendorDue] = useState(data.totalVendorDue);
  const [totalCompanyDue, setTotalCompanyDue] = useState(data.totalCompanyDue);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    moment(data.expectedDeliveryDate).locale("en").format("YYYY-MM-DD")
  );

  useEffect(() => {
    axiosRequest.get("/users").then(({ data: { data } }) => {
      const newUsers = data.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
      }));
      setUsers(newUsers);
    });
  }, []);

  const { data: ordersMeta } = useOrdersMeta();
  const orderSourceOptions = ordersMeta?.orderSources ?? [];
  const deliveryByOptions = ordersMeta?.deliveryByOptions ?? [];

  /**
   * «التوصيل بواسطة» يأتي كمعرّف في `deliveryBy` وكنص في `deliveryByLabel`،
   * والـ API يستقبل معرّفاً — فنطبّع أيّهما وصل على معرّف الـ meta بعد تحميل القائمة.
   */
  useEffect(() => {
    if (deliveryBy !== "" || !deliveryByOptions.length) return;
    const byId = deliveryByOptions.find((o) => String(o.id) === String(data.deliveryBy ?? ""));
    const byLabel = deliveryByOptions.find(
      (o) => o.label === String(data.deliveryByLabel ?? "").trim()
    );
    const match = byId ?? byLabel;
    if (match) setDeliveryBy(match.id);
  }, [deliveryByOptions, data.deliveryBy, data.deliveryByLabel, deliveryBy]);

  const administratorAutocompleteProps = getUserSelectAutocompleteConfig(35);

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>تعديل طلب {data.orderData.name}</DialogTitle>
      <DialogContent>
        <div>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">حالة الطلب</InputLabel>
            <Select
              fullWidth
              labelId="orderStatus"
              id="orderStatus-select"
              value={orderStatus}
              label="حالة الطلب"
              onChange={(e) => setOrderStatus(e.target.value)}
              sx={{ height: 35 }}
            >
              {statusoptions.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">حالة الدفع</InputLabel>
            <Select
              fullWidth
              labelId="PAYMENT_STATUS"
              id="PAYMENT_STATUS-select"
              value={paymentStatus}
              label="حالة الدفع"
              onChange={(e) => setPaymentStatus(e.target.value)}
              sx={{ height: 35 }}
            >
              {PAYMENT_STATUS.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderSource">مصدر الطلب</InputLabel>
            <Select
              fullWidth
              labelId="orderSource"
              id="orderSource-select"
              value={orderSource}
              label="مصدر الطلب"
              onChange={(e) => setOrderSource(e.target.value)}
              sx={{ height: 35 }}
            >
              {orderSourceOptions.map((option) => {
                return (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">البائع</InputLabel>
            <Select
              fullWidth
              labelId="vendor"
              id="vendor"
              value={selectedVendor}
              label="البائع"
              onChange={(e) => setSelectedVendor(e.target.value)}
              sx={{ height: 35 }}
            >
              {vendors.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="deliveryBy">التوصيل بواسطة</InputLabel>
            <Select
              fullWidth
              labelId="deliveryBy"
              id="deliveryBy-select"
              value={deliveryBy}
              label="التوصيل بواسطة"
              onChange={(e) => setDeliveryBy(Number(e.target.value))}
              sx={{ height: 35 }}
            >
              {deliveryByOptions.map((option) => {
                return (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <div style={{ margin: "10px 0" }}>
            <Autocomplete
              id="administratorEdit-autocomplete"
              fullWidth
              options={users}
              disabled={!users.length}
              value={getUserSelectValue(users, administrator)}
              onChange={(_, v) => setAdministrator(v != null ? v.value : null)}
              renderInput={(params) =>
                React.createElement(TextField, {
                  ...params,
                  label: "المسؤول",
                  InputLabelProps: { ...params.InputLabelProps, shrink: true },
                  placeholder: getUserSelectValue(users, administrator) ? "" : "ابحث عن مسؤول…",
                  inputProps: { ...params.inputProps, autoComplete: "off" },
                })
              }
              noOptionsText={administratorAutocompleteProps.noOptionsText}
              openOnFocus={administratorAutocompleteProps.openOnFocus}
              ListboxProps={administratorAutocompleteProps.ListboxProps}
              componentsProps={administratorAutocompleteProps.componentsProps}
              isOptionEqualToValue={administratorAutocompleteProps.isOptionEqualToValue}
              getOptionLabel={administratorAutocompleteProps.getOptionLabel}
              sx={administratorAutocompleteProps.sx}
            />
          </div>
          <TextField
            fullWidth
            label="جدية شراء"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
          <TextField
            fullWidth
            label="تكلفة الشحن"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
          <TextField
            fullWidth
            label="المبلغ المطلوب تحصيله"
            value={toBeCollected}
            onChange={(e) => setToBeCollected(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
          {/* <TextField
            fullWidth
            label="العمولة"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          /> */}
          {/* <TextField
            label="إﺟﻣﺎﻟﻲ اﻟﻣﺳﺗﺣق ﻟﻠﺑﺎﺋﻊ"
            fullWidth
            value={totalVendorDue}
            onChange={(e) => setTotalVendorDue(e.target.value)}
            style={{ margin: "5px 0" }}
            type="number"
          />{" "}
          <TextField
            label="إﺟﻣﺎﻟﻲ اﻟﻣﺳﺗﺣق ﻟﻠﺷرﻛﺔ"
            fullWidth
            value={totalCompanyDue}
            onChange={(e) => setTotalCompanyDue(e.target.value)}
            style={{ margin: "5px 0" }}
            type="number"
          /> */}
          {/* <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel style={{ margin: "5px 20px 0 0" }} id="manufacturingDate">
              تاريخ التسليم المتوقع{" "}
            </InputLabel>
            <TextField
              fullWidth
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              style={{ margin: "5px 0" }}
              type="date"
              InputProps={{
                inputProps: {
                  min: moment().locale("en").format("YYYY-MM-DD"),
                },
              }}
            />
          </FormControl> */}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={() =>
            onEdit(
              data.orderId,
              orderStatus,
              commission,
              totalVendorDue,
              paymentStatus,
              downPayment,
              toBeCollected,
              shippingCost,
              selectedVendor,
              administrator,
              totalCompanyDue,
              expectedDeliveryDate,
              orderSource,
              deliveryBy
            )
          }
          variant="contained"
          style={{ color: "#fff" }}
        >
          {isSubmitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "تأكيد"}{" "}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderModal;
