/**
 * بطاقة حالة الطلب: حالة الطلب + حالة التأخير + المسؤول + مكان التسليم + حالة التصنيع.
 * تجمع خياراتها من `useOrderStatusOptions` وتستدعي دوال التحديث المتفائل من الصفحة.
 */
import React from "react";
import { Autocomplete, Box, Stack, TextField, Typography } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { SelectComponent } from "components/ui";
import { OD } from "../odTheme";
import { statusFieldLabelSx, statusSelectSx, assigneeAutocompleteSx } from "../styles";
import { useOrderStatusOptions } from "../hooks/useOrderStatusOptions";
import SectionCard from "./SectionCard";
import { PRIORITY_VALUES } from "../../utils/constants";

interface OrderStatusCardProps {
  orderDetails: any;
  manufactureStatus: number | null;
  users: any[];
  changeOrderStatus: (status: number | null) => void;
  changeDeliveryStatus: (status: number | null) => void;
  changeAssignee: (userId: number | null) => void;
  changeDeliveryLocation: (shippedFromInventory: boolean) => void;
  changeManufactureStatus: (status: number | null) => void;
  changePriority: (priority: number | null) => void;
}

export default function OrderStatusCard({
  orderDetails,
  manufactureStatus,
  users,
  changeOrderStatus,
  changeDeliveryStatus,
  changeAssignee,
  changeDeliveryLocation,
  changeManufactureStatus,
  changePriority,
}: OrderStatusCardProps) {
  const {
    orderStatusOptions,
    manufactureOptions,
    assigneeOptions,
    deliveryStatusOptions,
    deliveryLocationOptions,
  } = useOrderStatusOptions(users);

  const selectedAssignee =
    assigneeOptions.find(
      (o) => o.value === (orderDetails.userId != null ? Number(orderDetails.userId) : null)
    ) ?? null;

  return (
    <SectionCard
      icon={<ScheduleIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="حالة الطلب"
      bodySx={{ p: 2 }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.75 }}>
        {/* حالة الطلب */}
        <Box>
          <Typography sx={statusFieldLabelSx}>حالة الطلب</Typography>
          <SelectComponent
            id="order-status"
            options={orderStatusOptions}
            value={orderDetails.status != null ? Number(orderDetails.status) : null}
            onChange={changeOrderStatus}
            withSectionBorder={false}
            boxSx={{ p: 0 }}
            formControlSx={statusSelectSx}
          />
        </Box>

        {/* حالة التأخير */}
        <Box>
          <Typography sx={statusFieldLabelSx}>حالة التأخير</Typography>
          <SelectComponent
            id="order-delivery-status"
            options={deliveryStatusOptions}
            value={orderDetails.deliveryStatus != null ? Number(orderDetails.deliveryStatus) : null}
            onChange={changeDeliveryStatus}
            withSectionBorder={false}
            boxSx={{ p: 0 }}
            formControlSx={statusSelectSx}
          />
        </Box>

        {/* الأولوية */}
        <Box>
          <Typography sx={statusFieldLabelSx}>الأولوية</Typography>
          <SelectComponent
            id="order-priority"
            options={PRIORITY_VALUES}
            value={orderDetails.priority != null ? Number(orderDetails.priority) : null}
            onChange={changePriority}
            withSectionBorder={false}
            boxSx={{ p: 0 }}
            formControlSx={statusSelectSx}
          />
        </Box>

        {/* المسؤول — بحث ضمن مستخدمي /users */}
        <Box>
          <Typography sx={statusFieldLabelSx}>المسؤول</Typography>
          <Autocomplete
            id="order-assignee"
            options={assigneeOptions}
            value={selectedAssignee}
            onChange={(_e, newValue: any) => changeAssignee(newValue ? newValue.value : null)}
            getOptionLabel={(o: any) => o.label ?? ""}
            isOptionEqualToValue={(o: any, v: any) => o.value === v.value}
            noOptionsText="لا يوجد"
            size="small"
            sx={assigneeAutocompleteSx}
            renderInput={(params) => <TextField {...params} placeholder="ابحث عن مسؤول..." />}
          />
        </Box>

        {/* مكان التسليم */}
        <Box>
          <Typography sx={statusFieldLabelSx}>مكان التسليم</Typography>
          <SelectComponent
            id="order-delivery-location"
            options={deliveryLocationOptions}
            value={orderDetails.shippedFromInventory ? "inventory" : "customer"}
            onChange={(v: string) => changeDeliveryLocation(v === "inventory")}
            withSectionBorder={false}
            boxSx={{ p: 0 }}
            formControlSx={statusSelectSx}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography sx={statusFieldLabelSx}>حالة التصنيع</Typography>
        <SelectComponent
          id="order-manufacture-status"
          options={manufactureOptions}
          value={manufactureStatus}
          onChange={changeManufactureStatus}
          withSectionBorder={false}
          boxSx={{ p: 0 }}
          formControlSx={statusSelectSx}
        />
      </Box>
    </SectionCard>
  );
}
