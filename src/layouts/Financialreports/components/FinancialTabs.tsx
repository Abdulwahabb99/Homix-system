/**
 * ترويسة تبويبات جدول التسويات (المخزن / البائع / الشاملة) مع عدّاد لكل تبويب.
 */
import React from "react";
import { Box } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { tabsHeadSx, tabSx, tabCountSx } from "../utils/styles";
import { TABS } from "../utils/constants";
import { SettlementTabKey } from "../utils/types";

const TAB_ICON: Record<SettlementTabKey, React.ReactNode> = {
  warehouse: <Inventory2OutlinedIcon sx={{ fontSize: 15 }} />,
  seller: <PersonOutlineIcon sx={{ fontSize: 15 }} />,
  comprehensive: <ReceiptLongOutlinedIcon sx={{ fontSize: 15 }} />,
};

interface FinancialTabsProps {
  active: SettlementTabKey;
  onChange: (key: SettlementTabKey) => void;
  /** عدّاد كل تبويب (عدد الموردين ضمن قسمه) */
  counts: Record<SettlementTabKey, number>;
}

export default function FinancialTabs({ active, onChange, counts }: FinancialTabsProps) {
  return (
    <Box sx={tabsHeadSx}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Box key={t.key} onClick={() => onChange(t.key)} sx={tabSx(isActive)}>
            {TAB_ICON[t.key]}
            {t.label}
            <Box component="span" sx={tabCountSx(isActive)}>{counts[t.key]}</Box>
          </Box>
        );
      })}
    </Box>
  );
}
