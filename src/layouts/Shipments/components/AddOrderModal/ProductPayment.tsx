import React from "react";
import { Box, Typography } from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import PropTypes from "prop-types";
import { orderStatusValues } from "layouts/Orders/utils/constants";
import { paymentStatusValues } from "layouts/Orders/utils/constants";
import { getUserType } from "shared/utils/constants";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

function Row({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        py: "9px",
        borderBottom: `0.5px solid ${HX.border}`,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: HX.tx2, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx, fontWeight: 700, textAlign: "left" }}>
        {value || value === 0 ? value : "—"}
      </Typography>
    </Box>
  );
}

Row.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
};

function ProductPayment({ customer, openAddModal, vendorName }) {
  const manufacturingDate =
    customer?.manufacturingDate === "NaN-NaN-NaN" ? "" : customer?.manufacturingDate;

  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        border: `0.5px solid ${HX.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        p: "18px 20px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: customer ? "10px" : 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: HX.blueLight,
              color: HX.blue,
              flexShrink: 0,
            }}
          >
            <ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "14px", fontWeight: 700, color: HX.tx }}>
            معلومات الطلب والشحن
          </Typography>
        </Box>
        <Box
          component="button"
          type="button"
          onClick={openAddModal}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            px: "12px",
            height: 34,
            borderRadius: "9px",
            border: customer ? `1px solid ${HX.border2}` : "none",
            bgcolor: customer ? HX.surface : HX.accent,
            color: customer ? HX.tx2 : "#fff",
            cursor: "pointer",
            fontSize: "12.5px",
            fontFamily: FONT,
            fontWeight: 700,
            transition: ".2s",
            "&:hover": customer
              ? { bgcolor: HX.surface3, color: HX.accent, borderColor: HX.accent }
              : { bgcolor: "#4f46e5" },
          }}
        >
          {customer ? <EditOutlinedIcon sx={{ fontSize: 15 }} /> : <AddIcon sx={{ fontSize: 17 }} />}
          {customer ? "تعديل" : "إضافة"}
        </Box>
      </Box>

      {customer ? (
        <Box>
          <Row label="حالة الطلب" value={orderStatusValues[customer?.orderStatus]} />
          <Row label="البائع" value={vendorName} />
          <Row label="المسؤول" value={getUserType(customer?.administrator)} />
          <Row label="طريقة الدفع" value={paymentStatusValues[customer?.paymentStatus]} />
          <Row label="جدية الشراء" value={customer?.downPayment} />
          <Row label="تكلفة الشحن" value={customer?.shippingCost} />
          <Row label="المبلغ المطلوب تحصيله" value={customer?.toBeCollected} />
          <Row label="العمولة" value={customer?.commission} />
          <Row label="تاريخ الدفع" value={manufacturingDate} />
        </Box>
      ) : (
        <Box
          onClick={openAddModal}
          sx={{
            mt: "14px",
            py: "26px",
            borderRadius: "11px",
            border: `1.5px dashed ${HX.border2}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: ".15s",
            "&:hover": { borderColor: HX.accent, bgcolor: HX.accentLight },
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: HX.surface3,
              color: HX.tx3,
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2, fontWeight: 600 }}>
            لم تتم إضافة معلومات الطلب بعد
          </Typography>
        </Box>
      )}
    </Box>
  );
}

ProductPayment.propTypes = {
  openAddModal: PropTypes.func.isRequired,
  customer: PropTypes.object,
  vendorName: PropTypes.string,
};

export default ProductPayment;
