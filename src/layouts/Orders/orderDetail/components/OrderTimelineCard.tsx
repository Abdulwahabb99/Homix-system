/**
 * بطاقة سجل الأحداث — من data.timeline (نقطة + خط زمني لكل حدث).
 * لا تُعرض إن لم توجد أحداث.
 */
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { OD } from "../odTheme";
import { timelineEventStyle, formatEventTime } from "../utils";
import SectionCard from "./SectionCard";

export default function OrderTimelineCard({ timeline }: { timeline: any[] }) {
  if (!Array.isArray(timeline) || timeline.length === 0) return null;

  return (
    <SectionCard
      icon={<TimelineOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="سجل الأحداث"
      bodySx={{ p: "14px 16px" }}
    >
      {timeline.map((ev: any, i: number) => {
        const isLast = i === timeline.length - 1;
        const st = timelineEventStyle(ev?.eventType);
        const Icon = st.Icon;
        return (
          <Box key={ev?.id ?? i} sx={{ display: "flex", gap: 1.25 }}>
            {/* المسار: نقطة + خط عمودي */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: st.bg,
                  color: st.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 14 }} />
              </Box>
              {!isLast && <Box sx={{ flex: 1, width: "2px", bgcolor: OD.brd, minHeight: 16, my: "2px" }} />}
            </Box>
            {/* المحتوى */}
            <Box sx={{ flex: 1, minWidth: 0, pt: "3px", pb: isLast ? 0 : 1.75 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: OD.tx, lineHeight: 1.4 }}>
                {ev?.message ?? "—"}
              </Typography>
              {ev?.description ? (
                <Typography sx={{ fontSize: "0.72rem", color: OD.tx2, mt: 0.25 }}>
                  {ev.description}
                  {ev?.userName ? ` · ${ev.userName}` : ""}
                </Typography>
              ) : null}
              <Typography sx={{ fontSize: "0.66rem", color: OD.tx3, mt: 0.375 }}>
                {formatEventTime(ev?.changedAt)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </SectionCard>
  );
}
