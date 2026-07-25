/**
 * بطاقة بيانات العميل: الاسم/الأفاتار + البريد + الهاتف + العنوان (أو شحن من المخزن).
 */
import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { OD } from "../odTheme";
import { getCustomerDisplayName } from "../utils";
import { CUSTOMER_AVATAR_GRADIENT } from "../constants";
import SectionCard from "./SectionCard";

interface CustomerInfoCardProps {
  orderDetails: any;
  isVendor: boolean;
  onEdit: () => void;
}

export default function CustomerInfoCard({ orderDetails, isVendor, onEdit }: CustomerInfoCardProps) {
  const customer = orderDetails?.customer;
  const displayName = getCustomerDisplayName(customer);

  return (
    <SectionCard
      icon={<PersonOutlineIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="بيانات العميل"
      headerRight={
        !isVendor ? (
          <Button
            size="small"
            onClick={onEdit}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.69rem",
              height: 28,
              px: 1.25,
              color: OD.accent,
              border: "1px solid rgba(99,102,241,0.5)",
              borderRadius: "9px",
              bgcolor: OD.sur,
              "&:hover": { borderColor: OD.accent, bgcolor: OD.al },
            }}
          >
            تعديل
          </Button>
        ) : null
      }
      bodySx={{ px: 2, py: 1.5 }}
    >
      {customer ? (
        <>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: CUSTOMER_AVATAR_GRADIENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 900,
                color: "#fff",
              }}
            >
              {displayName.charAt(0) || "؟"}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: OD.tx }}>
                {displayName}
              </Typography>
              {orderDetails.daysSinceOrder != null ? (
                <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, mt: 0.25 }}>
                  منذ {orderDetails.daysSinceOrder} يوم
                </Typography>
              ) : null}
            </Box>
          </Stack>
          <Stack spacing={0}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.125, borderBottom: `0.5px solid ${OD.brd}` }}>
              <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: OD.bl, color: OD.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <EmailOutlinedIcon sx={{ fontSize: 15 }} />
              </Box>
              <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, fontWeight: 500, minWidth: 56 }}>البريد</Typography>
              <Typography sx={{ fontSize: "0.69rem", fontWeight: 600, color: OD.tx, flex: 1, wordBreak: "break-all", dir: "ltr", textAlign: "right" }}>
                {customer.email || "—"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.125, borderBottom: `0.5px solid ${OD.brd}` }}>
              <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: OD.gl, color: OD.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PhoneOutlinedIcon sx={{ fontSize: 15 }} />
              </Box>
              <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, fontWeight: 500, minWidth: 56 }}>الهاتف</Typography>
              <Typography sx={{ fontSize: "0.81rem", fontWeight: 600, color: OD.tx, flex: 1, dir: "ltr", textAlign: "right" }}>
                {customer.phoneNumber || "—"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ py: 1.125 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: OD.aml, color: OD.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 15 }} />
              </Box>
              <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, fontWeight: 500, minWidth: 56, pt: 0.5 }}>العنوان</Typography>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: OD.tx, flex: 1 }}>
                {orderDetails.shippedFromInventory
                  ? "الشحن من مخازن هومكس"
                  : customer.address || customer.address2 || "—"}
              </Typography>
            </Stack>
          </Stack>
        </>
      ) : (
        <Typography sx={{ color: OD.tx3, fontSize: "0.78rem" }}>شحن من المخزن — لا بيانات عميل على الطلب</Typography>
      )}
    </SectionCard>
  );
}
