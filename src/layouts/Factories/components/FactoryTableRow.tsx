/**
 * صف واحد في جدول الصنّاع. الأنماط inline على td لأنها لا تعبر stylis
 * (فلا تنقلب محاذاة RTL)، والتلوين عند المرور يُطبّق مباشرة على العنصر.
 */
import React from "react";
import { Box } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { fmtDate, initials, money, specPalette, websiteLabel } from "../utils/calc";
import { actionBtnSx, avatarSx, linkCellSx, TD, FONT } from "../utils/styles";
import { FactoryListItem } from "../utils/types";
import SpecBadge from "./SpecBadge";
import StatusBadge from "./StatusBadge";

export interface FactoryTableRowProps {
  factory: FactoryListItem;
  onView: (f: FactoryListItem) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const HOVER_BG = "#fafbff";

export default function FactoryTableRow({ factory: f, onView, onEdit, onDelete }: FactoryTableRowProps) {
  return (
    <tr
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = HOVER_BG; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {/* اسم المصنع + الحرف */}
      <td style={TD}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box sx={{ ...avatarSx(34, "10px", "13px"), background: specPalette(f.specialty).gradient }}>
            {initials(f.name)}
          </Box>
          <Box sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>
            {f.name || "—"}
          </Box>
        </Box>
      </td>

      <td style={{ ...TD, fontFamily: "monospace", fontSize: "11.5px", color: HX.tx2, unicodeBidi: "plaintext" }}>
        {f.code || "—"}
      </td>

      <td style={{ ...TD, color: HX.tx2, fontSize: "12px", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>
        {f.address || "—"}
      </td>

      <td style={TD}><SpecBadge spec={f.specialty} /></td>

      <td style={{ ...TD, fontWeight: 600 }}>{f.responsibleName || "—"}</td>

      <td style={{ ...TD, fontFamily: "monospace", fontSize: "12px", color: HX.tx2, unicodeBidi: "plaintext" }}>
        {f.responsiblePhone || "—"}
      </td>

      <td style={{ ...TD, textAlign: "center", fontWeight: 700, color: HX.accent }}>
        {money(f.cairoGizaShipping)}
      </td>

      <td style={{ ...TD, textAlign: "center", fontWeight: 700, color: HX.tx2 }}>
        {money(f.otherCitiesShipping)}
      </td>

      <td style={TD}><StatusBadge status={f.status} label={f.statusLabel} /></td>

      <td style={TD}>
        {f.website ? (
          <Box
            component="a"
            href={f.website}
            target="_blank"
            rel="noreferrer"
            title={f.website}
            sx={{ ...linkCellSx, textDecoration: "none" }}
          >
            <OpenInNewIcon />
            {websiteLabel(f.website)}
          </Box>
        ) : (
          <Box component="span" sx={{ color: HX.tx3 }}>—</Box>
        )}
      </td>

      <td style={{ ...TD, fontSize: "11.5px", color: HX.tx2, unicodeBidi: "plaintext" }}>
        {fmtDate(f.joinDate)}
      </td>

      <td style={{ ...TD, textAlign: "center" }}>
        <Box component="span" sx={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          px: "8px", py: "3px", borderRadius: "20px",
          fontSize: "11px", fontWeight: 700, fontFamily: FONT,
          bgcolor: f.documentsCount > 0 ? HX.accentLight : HX.surface3,
          color: f.documentsCount > 0 ? HX.accent : HX.tx3,
          "& svg": { fontSize: 12 },
        }}>
          <DescriptionOutlinedIcon />
          {f.documentsCount}
        </Box>
      </td>

      <td style={TD}>
        <Box sx={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
          <Box component="button" type="button" title="عرض" onClick={() => onView(f)} sx={actionBtnSx("view")}>
            <VisibilityOutlinedIcon />
          </Box>
          <Box component="button" type="button" title="تعديل" onClick={() => onEdit(f.id)} sx={actionBtnSx("edit")}>
            <EditOutlinedIcon />
          </Box>
          <Box component="button" type="button" title="حذف" onClick={() => onDelete(f.id)} sx={actionBtnSx("delete")}>
            <DeleteOutlineIcon />
          </Box>
        </Box>
      </td>
    </tr>
  );
}
