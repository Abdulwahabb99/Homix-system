/**
 * بطاقة «بيانات المسؤول» — ترويسة بصورة الحرف والاسم والمسمّى، ثم الهاتف
 * والبريد. جهة الاتصال تُعرض تحت فاصل عند توفّر بياناتها فقط.
 */
import React from "react";
import { Box } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { initials, specPalette } from "../../utils/calc";
import { avatarSx } from "../../utils/styles";
import { attSeparatorSx, FONT } from "../utils/styles";
import type { FactoryDetail } from "../../utils/types";
import DetailCard from "./DetailCard";
import InfoRow from "./InfoRow";

export default function ResponsibleCard({ detail }: { detail: FactoryDetail }) {
  const hasContact = Boolean(
    detail.contactPersonName ||
      detail.contactPersonPhoneNumber ||
      detail.contactPersonEmail ||
      detail.contactPersonRole
  );

  const subtitle = [detail.responsibleRole, detail.name].filter(Boolean).join(" — ");

  return (
    <DetailCard icon={<PersonOutlineIcon />} title="بيانات المسؤول">
      {/* ترويسة الشخص */}
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: "12px",
          mb: "14px", pb: "14px", borderBottom: `0.5px solid ${HX.border}`,
        }}
      >
        <Box
          sx={{
            ...avatarSx(46, "50%", "17px"),
            background: specPalette(detail.factoryCategory).gradient,
          }}
        >
          {initials(detail.responsibleName || detail.name)}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>
            {detail.responsibleName || "—"}
          </Box>
          {subtitle ? (
            <Box sx={{ fontSize: "11px", color: HX.tx3, mt: "2px", fontFamily: FONT }}>
              {subtitle}
            </Box>
          ) : null}
        </Box>
      </Box>

      <InfoRow
        icon={<PhoneOutlinedIcon />}
        iconBg={HX.greenLight}
        iconColor={HX.green}
        label="رقم الهاتف"
        mono
        copyValue={detail.responsiblePhone}
      >
        {detail.responsiblePhone || "—"}
      </InfoRow>

      <InfoRow
        icon={<MailOutlineIcon />}
        iconBg={HX.blueLight}
        iconColor={HX.blue}
        label="البريد"
        copyValue={detail.responsibleEmail}
      >
        <Box component="span" sx={{ fontSize: "12px", unicodeBidi: "plaintext" }}>
          {detail.responsibleEmail || "—"}
        </Box>
      </InfoRow>

      {hasContact ? (
        <>
          <Box sx={attSeparatorSx} />
          <Box
            sx={{
              fontSize: "10px", fontWeight: 700, color: HX.tx3, mb: "8px",
              letterSpacing: ".8px", textTransform: "uppercase", fontFamily: FONT,
            }}
          >
            جهة الاتصال
          </Box>

          {detail.contactPersonName ? (
            <InfoRow
              icon={<PersonOutlineIcon />}
              iconBg={HX.accentLight}
              iconColor={HX.accent}
              label="الاسم"
            >
              {detail.contactPersonName}
            </InfoRow>
          ) : null}

          {detail.contactPersonRole ? (
            <InfoRow
              icon={<WorkOutlineIcon />}
              iconBg={HX.amberLight}
              iconColor={HX.amber}
              label="المسمّى"
            >
              {detail.contactPersonRole}
            </InfoRow>
          ) : null}

          {detail.contactPersonPhoneNumber ? (
            <InfoRow
              icon={<PhoneOutlinedIcon />}
              iconBg={HX.greenLight}
              iconColor={HX.green}
              label="رقم الهاتف"
              mono
              copyValue={detail.contactPersonPhoneNumber}
            >
              {detail.contactPersonPhoneNumber}
            </InfoRow>
          ) : null}

          {detail.contactPersonEmail ? (
            <InfoRow
              icon={<MailOutlineIcon />}
              iconBg={HX.blueLight}
              iconColor={HX.blue}
              label="البريد"
              copyValue={detail.contactPersonEmail}
            >
              <Box component="span" sx={{ fontSize: "12px", unicodeBidi: "plaintext" }}>
                {detail.contactPersonEmail}
              </Box>
            </InfoRow>
          ) : null}
        </>
      ) : null}
    </DetailCard>
  );
}
