/**
 * بطاقة الإجراءات السريعة: تتبع الشحنة / فتح تذكرة / طباعة الفاتورة / إلغاء الطلب.
 * «إلغاء الطلب» يطلب تأكيداً ثم يضبط حالة الطلب على «ملغي» (4) — لغير البائع فقط.
 */
import React, { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";
import { OD } from "../odTheme";
import { SHIPMENT_TYPE_OPTIONS } from "../constants";
import { CLOSED_ORDER_STATUS_IDS } from "layouts/Orders/utils/constants";
import SectionCard from "./SectionCard";

/** قيمة «ملغي» في حالة الطلب (يطابق statusoptions) */
const CANCELLED_ORDER_STATUS = 4;

interface QuickActionsCardProps {
  orderDetails: any;
  navigate: NavigateFunction;
  handleDownloadInvoice: () => void;
  changeOrderStatus: (status: number | null) => void;
  isVendor: boolean;
}

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export default function QuickActionsCard({
  orderDetails,
  navigate,
  handleDownloadInvoice,
  changeOrderStatus,
  isVendor,
}: QuickActionsCardProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const alreadyCancelled =
    Number(orderDetails?.status) === CANCELLED_ORDER_STATUS ||
    CLOSED_ORDER_STATUS_IDS.includes(Number(orderDetails?.status));
  const shipmentLabel =
    SHIPMENT_TYPE_OPTIONS.find((o) => o.value === orderDetails.shipmentType)?.label || orderDetails.shipmentType || "—";

  const actions: QuickAction[] = [
    {
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />,
      title: "تتبع الشحنة",
      sub: shipmentLabel,
      /* الشحنة تشارك معرّف الطلب نفسه (GET /shipments/:orderId) — تفتح صفحة الشحنة في تبويب جديد.
         البائع لا يملك مسار الشحنات. */
      onClick: () => {
        if (isVendor || orderDetails?.id == null) {
          NotificationMeassage("info", "تتبع الشحنة غير متاح لحسابك");
          return;
        }
        window.open(`/shipments/${orderDetails.id}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />,
      title: "فتح تذكرة",
      sub: "دعم العميل",
      onClick: () => {
        const op = String(orderDetails.operationNumber ?? orderDetails.code ?? "").trim();
        navigate(op ? `/tickets?operationNumber=${encodeURIComponent(op)}` : "/tickets");
      },
    },
    {
      icon: <LocalPrintshopOutlinedIcon sx={{ fontSize: 18 }} />,
      title: "طباعة الفاتورة",
      sub: "PDF",
      onClick: () => handleDownloadInvoice(),
    },
    {
      icon: <HighlightOffOutlinedIcon sx={{ fontSize: 18, color: OD.red }} />,
      title: "إلغاء الطلب",
      sub: alreadyCancelled ? "الطلب ملغي" : undefined,
      danger: true,
      disabled: isVendor || alreadyCancelled,
      onClick: () => setConfirmCancel(true),
    },
  ];

  return (
    <SectionCard
      icon={<BoltOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="إجراءات سريعة"
      bodySx={{ p: 2 }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        {actions.map((qa) => (
          <Box
            key={qa.title}
            onClick={qa.disabled ? undefined : qa.onClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: 1.4,
              border: `0.5px solid ${OD.brd}`,
              borderRadius: "10px",
              bgcolor: OD.sur2,
              opacity: qa.disabled ? 0.55 : 1,
              cursor: qa.disabled ? "default" : "pointer",
              transition: "0.15s",
              "&:hover": qa.disabled
                ? {}
                : {
                    borderColor: qa.danger ? OD.red : OD.accent,
                    bgcolor: qa.danger ? "rgba(239,68,68,0.1)" : OD.al,
                    "& .qa-ico": { bgcolor: qa.danger ? OD.red : OD.accent, color: "#fff" },
                  },
            }}
          >
            <Box
              className="qa-ico"
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: OD.sur3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: OD.tx2,
                transition: "0.15s",
              }}
            >
              {qa.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: OD.tx }}>{qa.title}</Typography>
              {qa.sub ? <Typography sx={{ fontSize: "0.625rem", color: OD.tx3 }}>{qa.sub}</Typography> : null}
            </Box>
          </Box>
        ))}
      </Box>
      <ConfirmDeleteModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        handleConfirmDelete={() => {
          setConfirmCancel(false);
          changeOrderStatus(CANCELLED_ORDER_STATUS);
        }}
        title="إلغاء الطلب"
        message="سيتم تغيير حالة الطلب إلى «ملغي». هل تريد المتابعة؟"
        tone="danger"
        confirmButtonText="إلغاء الطلب"
        cancelButtonText="رجوع"
      />
    </SectionCard>
  );
}
