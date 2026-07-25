/**
 * بطاقة الإجراءات السريعة: تتبع الشحنة / فتح تذكرة / طباعة الفاتورة / إلغاء الطلب.
 */
import React from "react";
import type { NavigateFunction } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { OD } from "../odTheme";
import SectionCard from "./SectionCard";

interface QuickActionsCardProps {
  orderDetails: any;
  navigate: NavigateFunction;
  handleDownloadInvoice: () => void;
}

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function QuickActionsCard({ orderDetails, navigate, handleDownloadInvoice }: QuickActionsCardProps) {
  const actions: QuickAction[] = [
    {
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />,
      title: "تتبع الشحنة",
      sub: orderDetails.shipmentType || "—",
      onClick: () => NotificationMeassage("info", "ميزة التتبع قريباً"),
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
      icon: <ShowChartOutlinedIcon sx={{ fontSize: 18, color: OD.red }} />,
      title: "إلغاء الطلب",
      sub: "قريباً",
      disabled: true,
      onClick: () => {},
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
                    borderColor: OD.accent,
                    bgcolor: OD.al,
                    "& .qa-ico": { bgcolor: OD.accent, color: "#fff" },
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
              <Typography sx={{ fontSize: "0.625rem", color: OD.tx3 }}>{qa.sub}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}
