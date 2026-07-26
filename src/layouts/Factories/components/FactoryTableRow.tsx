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
import { HX } from "layouts/Orders/ordersHomixTheme";
import { fmt, initials, money, websiteLabel } from "../utils/calc";
import { SPEC_FALLBACK_GRADIENT, SPEC_GRADIENTS } from "../utils/constants";
import { actionBtnSx, avatarSx, linkCellSx, TD, FONT } from "../utils/styles";
import { Factory } from "../utils/types";
import SpecBadge from "./SpecBadge";
import StatusBadge from "./StatusBadge";

export interface FactoryTableRowProps {
  factory: Factory;
  onView: (f: Factory) => void;
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
          <Box sx={{
            ...avatarSx(34, "10px", "13px"),
            background: SPEC_GRADIENTS[f.spec] ?? SPEC_FALLBACK_GRADIENT,
          }}>
            {initials(f.name)}
          </Box>
          <Box sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>
            {f.name}
          </Box>
        </Box>
      </td>

      <td style={{ ...TD, color: HX.tx2, fontSize: "12px", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
        {f.addr || "—"}
      </td>

      <td style={TD}><SpecBadge spec={f.spec} /></td>

      <td style={{ ...TD, fontWeight: 600 }}>{f.resp || "—"}</td>

      <td style={{ ...TD, fontFamily: "monospace", fontSize: "12px", color: HX.tx2, unicodeBidi: "plaintext" }}>
        {f.phone || "—"}
      </td>

      <td style={{ ...TD, textAlign: "center", fontWeight: 700, color: HX.accent }}>
        {money(f.shipCairo)}
      </td>

      <td style={{ ...TD, textAlign: "center", fontWeight: 700, color: HX.tx2 }}>
        {money(f.shipOther)}
      </td>

      <td style={TD}><StatusBadge status={f.status} /></td>

      <td style={TD}>
        <Box component="span" title={f.website} sx={linkCellSx}>
          <OpenInNewIcon />
          {websiteLabel(f.website)}
        </Box>
      </td>

      <td style={{ ...TD, fontWeight: 700, color: HX.accent }}>{fmt(f.orders)}</td>

      <td style={{ ...TD, fontWeight: 700, color: HX.green }}>{money(f.sales)}</td>

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
