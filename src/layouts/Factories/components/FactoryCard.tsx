/**
 * بطاقة مصنع في عرض البطاقات — ترويسة (حرف + اسم + عنوان + شارات)،
 * صفوف بيانات، ثم أزرار عرض/تعديل/حذف.
 */
import React from "react";
import { Box } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { fmt, fmtDate, initials, money, specPalette } from "../utils/calc";
import {
  avatarSx, cardBtnSx, cardFootSx, cardRowSx, cardTopSx, factoryCardSx, FONT,
} from "../utils/styles";
import { FactoryListItem } from "../utils/types";
import SpecBadge from "./SpecBadge";
import StatusBadge from "./StatusBadge";

export interface FactoryCardProps {
  factory: FactoryListItem;
  onView: (f: FactoryListItem) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function CardRow({
  label, value, color, mono,
}: { label: string; value: string; color?: string; mono?: boolean }) {
  return (
    <Box sx={cardRowSx}>
      <Box component="span" sx={{ fontSize: "11px", color: HX.tx3, fontWeight: 500, fontFamily: FONT }}>
        {label}
      </Box>
      <Box
        component="span"
        sx={{
          fontSize: mono ? "12px" : "12.5px",
          fontWeight: 600,
          color: color ?? HX.tx,
          fontFamily: mono ? "monospace" : FONT,
          ...(mono ? { unicodeBidi: "plaintext" } : null),
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

export default function FactoryCard({ factory: f, onView, onEdit, onDelete }: FactoryCardProps) {
  return (
    <Box sx={factoryCardSx}>
      <Box sx={cardTopSx}>
        <Box sx={{ ...avatarSx(46, "12px", "18px"), background: specPalette(f.specialty).gradient }}>
          {initials(f.name)}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, mb: "3px", fontFamily: FONT }}>
            {f.name || "—"}
          </Box>
          <Box sx={{
            display: "flex", alignItems: "center", gap: "4px", mb: "6px",
            fontSize: "11.5px", color: HX.tx3, fontFamily: FONT,
          }}>
            <PlaceOutlinedIcon sx={{ fontSize: 12, flexShrink: 0 }} />
            {f.address || "—"}
          </Box>
          <Box sx={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <SpecBadge spec={f.specialty} />
            <StatusBadge status={f.status} label={f.statusLabel} small />
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: "12px 18px" }}>
        <CardRow label="الكود" value={f.code || "—"} mono />
        <CardRow label="المسؤول" value={f.responsibleName || "—"} />
        <CardRow label="الهاتف" value={f.responsiblePhone || "—"} mono />
        <CardRow label="شحن القاهرة" value={money(f.cairoGizaShipping)} color={HX.accent} />
        <CardRow label="شحن المحافظات" value={money(f.otherCitiesShipping)} color={HX.tx2} />
        <CardRow label="تاريخ الانضمام" value={fmtDate(f.joinDate)} />
        <CardRow label="المستندات" value={`${fmt(f.documentsCount)} مستند`} color={HX.accent} />
      </Box>

      <Box sx={cardFootSx}>
        <Box component="button" type="button" onClick={() => onView(f)} sx={cardBtnSx("view")}>
          <VisibilityOutlinedIcon /> عرض
        </Box>
        <Box component="button" type="button" onClick={() => onEdit(f.id)} sx={cardBtnSx("edit")}>
          <EditOutlinedIcon /> تعديل
        </Box>
        <Box component="button" type="button" onClick={() => onDelete(f.id)} sx={cardBtnSx("delete")}>
          <DeleteOutlineIcon /> حذف
        </Box>
      </Box>
    </Box>
  );
}
