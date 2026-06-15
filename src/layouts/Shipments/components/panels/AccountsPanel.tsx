import React, { useState } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

const SUB_TABS = [
  { id: "settlements", label: "التسويات" },
  { id: "expenses", label: "المصروفيات" },
];

export default function AccountsPanel() {
  const [activeTab, setActiveTab] = useState("settlements");

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: "6px",
          mb: "16px",
          bgcolor: HX.surface,
          borderRadius: "10px",
          border: `0.5px solid ${HX.border}`,
          p: "4px",
          width: "fit-content",
        }}
      >
        {SUB_TABS.map((tab) => (
          <Box
            key={tab.id}
            component="button"
            type="button"
            onClick={() => setActiveTab(tab.id)}
            sx={{
              fontFamily: FONT,
              fontSize: "12.5px",
              fontWeight: 600,
              px: "14px",
              py: "7px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              bgcolor: activeTab === tab.id ? HX.accent : "transparent",
              color: activeTab === tab.id ? "#fff" : HX.tx2,
              transition: ".15s",
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          bgcolor: HX.surface,
          borderRadius: HX.r,
          border: `0.5px solid ${HX.border}`,
          py: 6,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "13px",
          color: HX.tx3,
        }}
      >
        سيتم إضافة هذه الميزة قريباً
      </Box>
    </Box>
  );
}
