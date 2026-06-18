import React from "react";
import { Box, Typography } from "@mui/material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailTimelineEvent } from "query/shipmentDetail";
import { FONT } from "../constants";
import { fmtDateTime } from "../utils";
import DetailCard from "./DetailCard";

/** Vertical event log; the last event is highlighted as the current/active one. */
export default function TimelineCard({ timeline }: { timeline: ShipmentDetailTimelineEvent[] }) {
  return (
    <DetailCard title="سجل الأحداث" icon={<HistoryOutlinedIcon />}>
      {timeline.length === 0 ? (
        <Box sx={{ textAlign: "center", fontFamily: FONT, fontSize: "12px", color: HX.tx3, py: "12px" }}>لا توجد أحداث</Box>
      ) : (
        <Box>
          {timeline.map((ev, i) => {
            const last = i === timeline.length - 1;
            const c = last
              ? { bg: HX.accentLight, color: HX.accent, border: HX.accent }
              : { bg: HX.greenLight, color: HX.green, border: HX.green };
            return (
              <Box key={ev.id} sx={{
                display: "flex", alignItems: "flex-start", position: "relative",
                borderRight: `2px solid ${last ? "transparent" : HX.border}`, mr: "14px", pr: "16px", py: "10px",
              }}>
                <Box sx={{
                  position: "absolute", right: -15, width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: c.bg, color: c.color, border: `2px solid ${c.border}`,
                }}>
                  {last ? <AccessTimeIcon sx={{ fontSize: 13 }} /> : <CheckRoundedIcon sx={{ fontSize: 13 }} />}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: HX.tx }}>{ev.message}</Typography>
                  {ev.userName && <Typography sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx2, mt: "2px" }}>{ev.userName}</Typography>}
                  <Typography sx={{ fontFamily: FONT, fontSize: "10.5px", color: HX.tx3, mt: "3px" }}>🕐 {fmtDateTime(ev.changedAt)}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </DetailCard>
  );
}
