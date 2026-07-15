/**
 * صف مورد: خلية المورد + البريد + مدة الشحن + الأونيت مانجر + الحالة (toggle) + إجراءات.
 */
import React from "react";
import { Box } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { vendorAvatarSx, statusBadgeSx, toggleSx, actBtnSx, FONT } from "../utils/styles";
import { avatarGradient, initials, PLACEHOLDER } from "../utils/constants";
import { Vendor } from "../utils/types";
import ShipDurationBadge from "./ShipDurationBadge";

interface VendorTableRowProps {
  vendor: Vendor;
  checked: boolean;
  onToggleSelect: () => void;
  onToggleStatus: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function VendorTableRow({ vendor, checked, onToggleSelect, onToggleStatus, onView, onEdit, onDelete }: VendorTableRowProps) {
  const name = vendor.name || PLACEHOLDER;
  const emailAddr = vendor.user?.email || "";
  const amLabel = vendor.accountManagerLabel || "";
  const active = Boolean(vendor.active);

  return (
    <tr>
      <td style={{ textAlign: "center", width: 36 }}>
        <input type="checkbox" checked={checked} onChange={onToggleSelect} />
      </td>

      {/* اسم المورد */}
      <td>
        <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <Box sx={{ ...(vendorAvatarSx as object), background: avatarGradient(name) }}>{initials(name)}</Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>{name}</Box>
            {vendor.phone ? (
              <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: "monospace", mt: "1px" }}>{vendor.phone}</Box>
            ) : null}
          </Box>
        </Box>
      </td>

      {/* البريد */}
      <td>
        {emailAddr ? (
          <Box component="a" href={`mailto:${emailAddr}`} sx={{ display: "inline-flex", alignItems: "center", gap: "4px", color: HX.accent, fontSize: "11.5px", textDecoration: "none", "&:hover": { textDecoration: "underline" }, "& svg": { fontSize: 13 } }}>
            <EmailOutlinedIcon /> {emailAddr}
          </Box>
        ) : (
          <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>{PLACEHOLDER}</Box>
        )}
      </td>

      {/* مدة الشحن */}
      <td><ShipDurationBadge days={vendor.daysToDeliver} /></td>

      {/* الأونيت مانجر */}
      <td>
        {amLabel ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {initials(amLabel)}
            </Box>
            <Box sx={{ fontSize: "12px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>{amLabel}</Box>
          </Box>
        ) : (
          <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>{PLACEHOLDER}</Box>
        )}
      </td>

      {/* الحالة */}
      <td style={{ textAlign: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
          <Box component="button" type="button" aria-label="تبديل الحالة" onClick={onToggleStatus} sx={toggleSx(active)} />
          <Box component="span" sx={statusBadgeSx(active)}>{active ? "نشط" : "غير نشط"}</Box>
        </Box>
      </td>

      {/* إجراءات */}
      <td>
        <Box sx={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
          <Box component="button" type="button" title="عرض" onClick={onView} sx={actBtnSx("view")}><VisibilityOutlinedIcon /></Box>
          <Box component="button" type="button" title="تعديل" onClick={onEdit} sx={actBtnSx("edit")}><EditOutlinedIcon /></Box>
          <Box component="button" type="button" title="حذف" onClick={onDelete} sx={actBtnSx("delete")}><DeleteOutlineIcon /></Box>
        </Box>
      </td>
    </tr>
  );
}
