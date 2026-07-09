import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  SHIPMENT_STATUS_VALUES,
  SHIPMENT_TYPE_VALUES,
  GOVERNORATES_VALUES,
} from "shared/utils/constants";
import { useShipmentDetailQuery } from "query/shipmentDetail";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";
import {
  useUpdateShipmentMutation,
  type UpdateShipmentPayload,
} from "query/shipmentEdit";

import { FONT } from "../ShipmentDetails/constants";
import DetailCard from "../ShipmentDetails/components/DetailCard";
import ShippingCompanySelect from "./ShippingCompanySelect";

type Option = { value: string | number; label: string };

const DEFAULT_PAYMENT_OPTIONS: Option[] = [
  { value: 1, label: "الدفع عند الاستلام" },
  { value: 2, label: "مدفوع" },
];

/** Date-only -> "YYYY-MM-DD" for <input type="date">, ASCII digits. */
function toYmd(raw: unknown): string {
  if (!raw) return "";
  const m = moment(raw).locale("en");
  return m.isValid() ? m.format("YYYY-MM-DD") : "";
}

/** "YYYY-MM-DD" -> ISO string, or undefined when empty/invalid. */
function toIso(ymd: string): string | undefined {
  if (!ymd) return undefined;
  const m = moment(ymd, "YYYY-MM-DD");
  return m.isValid() ? m.toISOString() : undefined;
}

/** Ensure the currently-selected value is always present as a selectable option. */
function withCurrent(options: Option[], value: string | number | "", label?: string): Option[] {
  if (value === "" || value == null) return options;
  if (options.some((o) => String(o.value) === String(value))) return options;
  return [...options, { value, label: label || String(value) }];
}

// Mirrors the FilterSelect/FilterInput look from ShipmentsFiltersBar: rounded 10px,
// 12px text, HX.border outline that turns accent on hover/focus, compact ~38px height.
const inputSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: FONT,
    fontSize: "12px",
    bgcolor: HX.surface,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  // 12px text on every field
  "& .MuiOutlinedInput-input": { fontSize: "12px", fontFamily: FONT, color: "#000" },
  // one fixed height for all single-line fields → the shorter selects grow up to match the
  // text/date inputs (nothing shrinks). Multiline (notes) is excluded.
  "& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)": { height: "44px" },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
    height: "100%",
    boxSizing: "border-box",
    paddingTop: 0,
    paddingBottom: 0,
  },
  // the Select display div has a built-in min-height; clear it and center its value in the fixed height
  "& .MuiSelect-select.MuiSelect-select": {
    minHeight: "unset",
    height: "100%",
    boxSizing: "border-box",
    paddingTop: 0,
    paddingBottom: 0,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputLabel-root": {
    fontFamily: FONT,
    fontSize: "12px",
    color: "#000",
    "&.MuiInputLabel-shrink": { fontSize: "11px" },
    "&.Mui-focused": { color: HX.accent },
  },
  "& .MuiMenuItem-root": { fontFamily: FONT },
} as const;

/**
 * Shared props for every field. `shrink: true` is the important bit — it keeps the
 * label floated AND opens the outline notch (the gap in the border), which RTL auto-shrink
 * fails to do, otherwise the border line cuts through the label text.
 */
const fieldBaseProps = {
  fullWidth: true,
  size: "small" as const,
  sx: inputSx,
  InputLabelProps: { shrink: true },
} as const;

export default function ShipmentEdit() {
  const { id } = useParams();
  const shipmentId = id ?? "";
  const navigate = useNavigate();

  const { data, isLoading, isError } = useShipmentDetailQuery(shipmentId);
  const { data: meta } = useShipmentsMetaQuery();
  const updateMutation = useUpdateShipmentMutation(shipmentId || undefined);

  // --- form state ---
  const [shipmentStatus, setShipmentStatus] = useState<number | "">("");
  const [shipmentType, setShipmentType] = useState<string>("");
  const [governorate, setGovernorate] = useState<string>("");
  const [scheduleStatus, setScheduleStatus] = useState<number | "">("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [shippingFees, setShippingFees] = useState("");

  const [shippingReceiveDate, setShippingReceiveDate] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [paymentStatus, setPaymentStatus] = useState<number | "">("");
  const [downPayment, setDownPayment] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [toBeCollected, setToBeCollected] = useState("");

  const [notes, setNotes] = useState("");

  // --- option lists (meta overrides the static fallbacks when present) ---
  const statusOptions = meta?.shipmentStatuses?.length ? meta.shipmentStatuses : SHIPMENT_STATUS_VALUES;
  const typeOptions = withCurrent(
    meta?.shipmentTypes?.length ? meta.shipmentTypes : SHIPMENT_TYPE_VALUES,
    shipmentType,
    data?.shipment.shipmentTypeLabel
  );
  // governorate round-trips as a string, so use the Arabic name as the option value.
  const govOptions: Option[] = withCurrent(
    (meta?.governorates?.length ? meta.governorates : GOVERNORATES_VALUES).map((o) => ({
      value: o.label,
      label: o.label,
    })),
    governorate
  );
  const scheduleOptions = withCurrent(
    meta?.scheduleStatuses ?? [],
    scheduleStatus,
    data?.shipment.scheduleStatusLabel
  );
  const paymentOptions = meta?.paymentStatuses?.length ? meta.paymentStatuses : DEFAULT_PAYMENT_OPTIONS;

  // --- prefill once the shipment has loaded ---
  useEffect(() => {
    if (!data?.shipment?.id) return;
    const { shipment, customer, financial } = data;

    setShipmentStatus(shipment.shipmentStatus != null ? Number(shipment.shipmentStatus) : "");
    setScheduleStatus(shipment.scheduleStatus != null ? Number(shipment.scheduleStatus) : "");
    setShipmentType(shipment.shipmentType ?? "");
    setGovernorate(shipment.governorate ?? "");
    setShippingCompany(shipment.shippingCompany != null ? String(shipment.shippingCompany) : "");
    setShippingFees(shipment.shippingCost != null ? String(shipment.shippingCost) : "");

    setShippingReceiveDate(toYmd(shipment.receivedInWarehouseDate));
    setExpectedDeliveryDate(toYmd(shipment.scheduledDeliveryDate));
    setDeliveryDate(toYmd(shipment.deliveryDate));

    const parts = (customer?.name ?? "").trim().split(/\s+/).filter(Boolean);
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" "));
    setPhone(customer?.phoneNumber ?? "");

    setPaymentStatus(shipment.paymentStatus != null ? Number(shipment.paymentStatus) : "");
    setToBeCollected(
      financial?.amountToCollect != null ? String(financial.amountToCollect) : ""
    );
    setDownPayment("0");
    setReceivedAmount("0");
  }, [data?.shipment?.id]);

  const shipNumber = useMemo(() => {
    if (!data) return "";
    return data.shipment.shipmentNumber || `SH-${data.shipment.id}`;
  }, [data]);

  /** Only includes a field when it carries a real value, so unmatched selects never overwrite. */
  function buildPayload(): UpdateShipmentPayload {
    const body: UpdateShipmentPayload = {};
    if (shipmentStatus !== "") body.shipmentStatus = Number(shipmentStatus);
    if (shipmentType) body.shipmentType = shipmentType;
    if (governorate) body.governorate = governorate;
    if (scheduleStatus !== "") body.scheduleStatus = Number(scheduleStatus);
    if (shippingCompany.trim()) {
      const asNum = Number(shippingCompany);
      body.shippingCompany = Number.isFinite(asNum) ? asNum : shippingCompany.trim();
    }
    if (shippingFees.trim() !== "" && Number.isFinite(Number(shippingFees))) {
      body.shippingFees = Number(shippingFees);
    }

    const recv = toIso(shippingReceiveDate);
    const exp = toIso(expectedDeliveryDate);
    const del = toIso(deliveryDate);
    if (recv) body.shippingReceiveDate = recv;
    if (exp) body.expectedDeliveryDate = exp;
    if (del) body.deliveryDate = del;

    if (firstName.trim() || lastName.trim() || phone.trim()) {
      body.customer = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      };
    }

    if (paymentStatus !== "") body.paymentStatus = Number(paymentStatus);
    if (downPayment.trim() !== "" && Number.isFinite(Number(downPayment))) {
      body.downPayment = Number(downPayment);
    }
    if (receivedAmount.trim() !== "" && Number.isFinite(Number(receivedAmount))) {
      body.receivedAmount = Number(receivedAmount);
    }
    if (toBeCollected.trim() !== "" && Number.isFinite(Number(toBeCollected))) {
      body.toBeCollected = Number(toBeCollected);
    }

    if (notes.trim()) body.notes = notes.trim();

    return body;
  }

  const goBack = () => navigate(`/shipments/${shipmentId}`);

  const handleSave = () => {
    if (updateMutation.isPending || !shipmentId) return;
    if (shipmentStatus === "") {
      NotificationMeassage("error", "اختر حالة الشحنة");
      return;
    }
    updateMutation.mutate(buildPayload(), { onSuccess: goBack });
  };

  // --- header (breadcrumb + cancel/save actions) ---
  const breadcrumb = (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: FONT, fontSize: "12.5px", color: HX.tx3, flexWrap: "wrap" }}>
      <Box component="span" onClick={() => navigate("/shipments")} sx={{ cursor: "pointer", color: HX.tx2, "&:hover": { color: HX.accent } }}>الشحنات</Box>
      <Box component="span" sx={{ color: HX.tx3 }}>/</Box>
      <Box component="span" onClick={goBack} sx={{ cursor: "pointer", color: HX.tx2, "&:hover": { color: HX.accent } }}>{shipNumber || "تفاصيل الشحنة"}</Box>
      <Box component="span" sx={{ color: HX.tx3 }}>/</Box>
      <Box component="span" sx={{ color: HX.tx, fontWeight: 800 }}>تعديل الشحنة</Box>
    </Box>
  );

  const actions = (
    <>
      <Box
        component="button"
        type="button"
        onClick={goBack}
        sx={{
          display: "flex", alignItems: "center", px: "15px", height: 36, borderRadius: "9px",
          border: `1px solid ${HX.border2}`, bgcolor: HX.surface, color: HX.tx2, cursor: "pointer",
          fontSize: "13px", fontFamily: FONT, fontWeight: 600, flexShrink: 0,
          transition: ".15s", "&:hover": { bgcolor: HX.surface3, color: HX.tx },
        }}
      >
        إلغاء
      </Box>
      <Box
        component="button"
        type="button"
        onClick={handleSave}
        disabled={updateMutation.isPending}
        sx={{
          display: "flex", alignItems: "center", gap: "6px", px: "18px", height: 36, borderRadius: "9px",
          border: "none", bgcolor: HX.accent, color: "#fff",
          cursor: updateMutation.isPending ? "default" : "pointer", opacity: updateMutation.isPending ? 0.7 : 1,
          fontSize: "13px", fontFamily: FONT, fontWeight: 700, flexShrink: 0,
          transition: ".2s", "&:hover": { bgcolor: "#4f46e5" },
        }}
      >
        {updateMutation.isPending ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : "حفظ التعديلات"}
      </Box>
    </>
  );

  if (isLoading) {
    return (
      <DashboardLayout header={<HomixPageHeader breadcrumb={breadcrumb} />}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <CircularProgress size={42} sx={{ color: HX.accent }} />
        </Box>
      </DashboardLayout>
    );
  }
  if (isError || !data) {
    return (
      <DashboardLayout header={<HomixPageHeader breadcrumb={breadcrumb} />}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: FONT, color: HX.tx2 }}>
          تعذّر تحميل تفاصيل الشحنة
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout header={<HomixPageHeader breadcrumb={breadcrumb} actions={actions} />}>
      <ToastContainer />
      <Box sx={{ fontFamily: FONT, mt: "12px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: 920, mx: "auto", pb: "24px" }}>
        {/* Back + read-only identity */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconButton onClick={goBack} sx={{ color: HX.tx2, border: `1px solid ${HX.border}`, borderRadius: "9px", p: "6px" }}>
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: "16px", fontWeight: 900, color: HX.tx }}>
              تعديل الشحنة {shipNumber}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx3 }}>
              {data.shipment.orderNumber ? `طلب #${data.shipment.orderNumber}` : ""}
            </Typography>
          </Box>
        </Box>

        {/* الشحنة واللوجستيك */}
        <DetailCard title="حالة الشحنة واللوجستيك" icon={<LocalShippingOutlinedIcon />}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...fieldBaseProps}
                select
                label="حالة الشحنة"
                value={shipmentStatus === "" ? "" : Number(shipmentStatus)}
                onChange={(e) => setShipmentStatus(Number(e.target.value))}
              >
                {statusOptions.map((o) => (
                  <MenuItem key={o.value} value={Number(o.value)} sx={{ fontFamily: FONT }}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...fieldBaseProps}
                select
                label="نوع الشحنة"
                value={shipmentType}
                onChange={(e) => setShipmentType(String(e.target.value))}
              >
                {typeOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value} sx={{ fontFamily: FONT }}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...fieldBaseProps}
                select
                label="المحافظة"
                value={governorate}
                onChange={(e) => setGovernorate(String(e.target.value))}
              >
                {govOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value} sx={{ fontFamily: FONT }}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ShippingCompanySelect value={shippingCompany} onChange={setShippingCompany} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...fieldBaseProps}
                select
                disabled={scheduleOptions.length === 0}
                label="حالة الجدولة"
                value={scheduleStatus === "" ? "" : Number(scheduleStatus)}
                onChange={(e) => setScheduleStatus(Number(e.target.value))}
              >
                {scheduleOptions.map((o) => (
                  <MenuItem key={o.value} value={Number(o.value)} sx={{ fontFamily: FONT }}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...fieldBaseProps} type="number" label="تكلفة الشحن" value={shippingFees} onChange={(e) => setShippingFees(e.target.value)} inputProps={{ min: 0 }} />
            </Grid>
          </Grid>
        </DetailCard>

        {/* التواريخ */}
        <DetailCard title="التواريخ" icon={<CalendarTodayOutlinedIcon />}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField {...fieldBaseProps} type="date" label="تاريخ استلام الشحنة" value={shippingReceiveDate} onChange={(e) => setShippingReceiveDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField {...fieldBaseProps} type="date" label="موعد التسليم المتوقع" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField {...fieldBaseProps} type="date" label="تاريخ التسليم الفعلي" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </Grid>
          </Grid>
        </DetailCard>

        {/* بيانات العميل */}
        <DetailCard title="بيانات العميل" icon={<PersonOutlineOutlinedIcon />}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField {...fieldBaseProps} label="الاسم الأول" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField {...fieldBaseProps} label="اسم العائلة" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField {...fieldBaseProps} label="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} inputProps={{ dir: "ltr" }} />
            </Grid>
          </Grid>
        </DetailCard>

        {/* المالية */}
        <DetailCard title="المالية" icon={<PaymentsOutlinedIcon />}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...fieldBaseProps}
                select
                label="حالة الدفع"
                value={paymentStatus === "" ? "" : Number(paymentStatus)}
                onChange={(e) => setPaymentStatus(Number(e.target.value))}
              >
                {paymentOptions.map((o) => (
                  <MenuItem key={o.value} value={Number(o.value)} sx={{ fontFamily: FONT }}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...fieldBaseProps} type="number" label="المبلغ المطلوب تحصيله" value={toBeCollected} onChange={(e) => setToBeCollected(e.target.value)} inputProps={{ min: 0 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...fieldBaseProps} type="number" label="الدفعة المقدمة" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} inputProps={{ min: 0 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...fieldBaseProps} type="number" label="المبلغ المستلم" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} inputProps={{ min: 0 }} />
            </Grid>
          </Grid>
        </DetailCard>

        {/* ملاحظات */}
        <DetailCard title="ملاحظات" icon={<StickyNote2OutlinedIcon />}>
          <TextField
            {...fieldBaseProps}
            multiline
            minRows={3}
            placeholder="أضف ملاحظة على الشحنة..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DetailCard>

        {/* footer save (mirror of header actions for long forms) */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", mt: "4px" }}>
          {actions}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
