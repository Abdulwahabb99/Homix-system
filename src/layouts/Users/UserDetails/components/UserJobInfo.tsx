/**
 * بطاقة البيانات الوظيفية والمالية — من الـ API (jobTitle / salary).
 */
import React from "react";
import { Box } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { PLACEHOLDER } from "../utils/constants";
import { JobInfo } from "../utils/types";
import DetailCard from "./DetailCard";
import InfoRowItem from "./InfoRowItem";

export default function UserJobInfo({ job }: { job: JobInfo }) {
  const hasSalary = job.salary !== PLACEHOLDER;
  return (
    <DetailCard title="بيانات وظيفية ومالية" icon={<WorkOutlineIcon />}>
      <InfoRowItem icon="briefcase" tone="purple" label="الوظيفة" value={job.jobTitle} />
      <InfoRowItem
        icon="money"
        tone="green"
        label="الراتب"
        value={
          hasSalary ? (
            <Box component="span" sx={{ color: HX.green, fontWeight: 800 }}>{job.salary}</Box>
          ) : (
            job.salary
          )
        }
      />
    </DetailCard>
  );
}
