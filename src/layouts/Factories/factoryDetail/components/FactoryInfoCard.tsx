/**
 * بطاقة «بيانات المصنع» — عمودان بينهما فاصل، والكود يظهر في ترويسة البطاقة.
 */
import React from "react";
import { Box } from "@mui/material";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import StatusBadge from "../../components/StatusBadge";
import { websiteLabel } from "../../utils/calc";
import { fmtLongDate } from "../utils/calc";
import { infoSplitSx, FONT } from "../utils/styles";
import type { FactoryDetail } from "../../utils/types";
import DetailCard from "./DetailCard";
import InfoRow from "./InfoRow";

export default function FactoryInfoCard({ detail }: { detail: FactoryDetail }) {
  const fullAddress = [detail.address, detail.city].filter(Boolean).join("، ");

  return (
    <DetailCard
      icon={<FactoryOutlinedIcon />}
      title="بيانات المصنع"
      action={
        detail.code ? (
          <Box
            component="span"
            sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT, unicodeBidi: "plaintext" }}
          >
            ID: {detail.code}
          </Box>
        ) : null
      }
    >
      <Box sx={infoSplitSx}>
        <Box>
          <InfoRow
            icon={<FactoryOutlinedIcon />}
            iconBg={HX.accentLight}
            iconColor={HX.accent}
            label="اسم المصنع"
          >
            {detail.name || "—"}
          </InfoRow>

          <InfoRow
            icon={<PlaceOutlinedIcon />}
            iconBg={HX.amberLight}
            iconColor={HX.amber}
            label="العنوان"
          >
            <Box component="span" sx={{ fontSize: "12px" }}>{fullAddress || "—"}</Box>
          </InfoRow>

          <InfoRow
            icon={<Inventory2OutlinedIcon />}
            iconBg={HX.blueLight}
            iconColor={HX.blue}
            label="التخصص"
          >
            {detail.factoryCategory || "—"}
          </InfoRow>
        </Box>

        <Box>
          <InfoRow
            icon={<ScheduleOutlinedIcon />}
            iconBg={HX.greenLight}
            iconColor={HX.green}
            label="الحالة"
          >
            <StatusBadge status={detail.status} label={detail.statusLabel} />
          </InfoRow>

          <InfoRow
            icon={<OpenInNewIcon />}
            iconBg={HX.accentLight}
            iconColor={HX.accent}
            label="الويب سايت"
          >
            {detail.website ? (
              <Box
                component="a"
                href={detail.website}
                target="_blank"
                rel="noreferrer"
                sx={{
                  fontSize: "11.5px", color: HX.accent, textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {websiteLabel(detail.website)}
              </Box>
            ) : (
              "—"
            )}
          </InfoRow>

          <InfoRow
            icon={<CalendarTodayOutlinedIcon />}
            iconBg={HX.amberLight}
            iconColor={HX.amber}
            label="تاريخ الانضمام"
          >
            {fmtLongDate(detail.joinDate)}
          </InfoRow>
        </Box>
      </Box>
    </DetailCard>
  );
}
