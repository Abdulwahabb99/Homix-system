/**
 * بطاقة «مصاريف الشحن» — خليّتان متجاورتان (القاهرة والجيزة / باقي المحافظات).
 */
import React from "react";
import { Box } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { CURRENCY } from "../../utils/constants";
import { fmt } from "../../utils/calc";
import { shipAmountSx, shipCellSx, shipGridSx, shipUnitSx, shipZoneSx } from "../utils/styles";
import type { FactoryDetail } from "../../utils/types";
import DetailCard from "./DetailCard";

function ShipCell({ zone, amount }: { zone: string; amount: number }) {
  return (
    <Box sx={shipCellSx}>
      <Box sx={shipZoneSx}>{zone}</Box>
      <Box sx={shipAmountSx}>
        {fmt(amount)} <Box component="span" sx={shipUnitSx}>{CURRENCY}</Box>
      </Box>
    </Box>
  );
}

export default function ShippingCostsCard({ detail }: { detail: FactoryDetail }) {
  return (
    <DetailCard icon={<LocalShippingOutlinedIcon />} title="مصاريف الشحن" noPadding>
      <Box sx={shipGridSx}>
        <ShipCell zone="📍 القاهرة والجيزة" amount={detail.cairoGizaShipping} />
        <ShipCell zone="🗺️ باقي المحافظات" amount={detail.otherCitiesShipping} />
      </Box>
    </DetailCard>
  );
}
