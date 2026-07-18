/**
 * سجل النشاط — مدفوع بمصفوفة activity من الـ API. خط زمني بنقاط ملوّنة حسب نوع الحدث.
 */
import React from "react";
import { Box } from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { tlActionSx, tlDetailSx, tlDotSx, tlItemSx, tlTimeSx, FONT } from "../utils/styles";
import { activityIcon } from "../utils/icons";
import { TONE_MAP } from "../utils/constants";
import { ActivityView } from "../utils/types";
import DetailCard from "./DetailCard";

export default function UserActivityTimeline({ activity }: { activity: ActivityView[] }) {
  return (
    <DetailCard title="سجل النشاط" icon={<TimelineIcon />}>
      {activity.length === 0 ? (
        <Box sx={{ fontSize: "12px", color: HX.tx3, fontFamily: FONT, textAlign: "center", py: "8px" }}>
          لا يوجد نشاط
        </Box>
      ) : (
        activity.map((entry) => {
          const tone = TONE_MAP[entry.tone];
          return (
            <Box key={entry.id} sx={tlItemSx}>
              <Box sx={tlDotSx(tone.bg, tone.color)}>{activityIcon(entry.action)}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={tlActionSx}>{entry.message}</Box>
                {entry.detail && <Box sx={tlDetailSx}>{entry.detail}</Box>}
                <Box sx={tlTimeSx}>{entry.time}</Box>
              </Box>
            </Box>
          );
        })
      )}
    </DetailCard>
  );
}
