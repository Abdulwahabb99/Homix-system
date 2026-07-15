/**
 * سجل النشاط — بيانات ثابتة حالياً؛ ستُربط بالـ BE مستقبلاً.
 * خط زمني بنقاط ملوّنة حسب نوع الحدث.
 */
import React from "react";
import { Box } from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import { tlActionSx, tlDetailSx, tlDotSx, tlItemSx, tlTimeSx } from "../utils/styles";
import { activityIcon } from "../utils/icons";
import { ACTIVITY_LOG, TONE_MAP } from "../utils/constants";
import DetailCard from "./DetailCard";

export default function UserActivityTimeline() {
  return (
    <DetailCard title="سجل النشاط" icon={<TimelineIcon />}>
      {ACTIVITY_LOG.map((entry) => {
        const tone = TONE_MAP[entry.tone];
        return (
          <Box key={entry.id} sx={tlItemSx}>
            <Box sx={tlDotSx(tone.bg, tone.color)}>{activityIcon(entry.icon)}</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={tlActionSx}>{entry.action}</Box>
              <Box sx={tlDetailSx}>{entry.detail}</Box>
              <Box sx={tlTimeSx}>{entry.time}</Box>
            </Box>
          </Box>
        );
      })}
    </DetailCard>
  );
}
