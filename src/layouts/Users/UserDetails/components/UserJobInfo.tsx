/**
 * بطاقة البيانات الوظيفية والمالية — ثابتة حالياً؛ ستُربط بالـ BE مستقبلاً.
 */
import React from "react";
import { Box } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { JOB_INFO } from "../utils/constants";
import DetailCard from "./DetailCard";
import InfoRowItem from "./InfoRowItem";

export default function UserJobInfo() {
  return (
    <DetailCard title="بيانات وظيفية ومالية" icon={<WorkOutlineIcon />}>
      <InfoRowItem icon="briefcase" tone="purple" label="الوظيفة" value={JOB_INFO.position} />
      <InfoRowItem
        icon="money"
        tone="green"
        label="الراتب"
        value={<Box component="span" sx={{ color: HX.green, fontWeight: 800 }}>{JOB_INFO.salary}</Box>}
      />
    </DetailCard>
  );
}
