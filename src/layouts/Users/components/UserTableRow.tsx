/**
 * صف مستخدم واحد في الجدول: خلية المستخدم + الدور + الحالة/آخر دخول (—) + إجراءات.
 */
import React from "react";
import { Box } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { userAvatarSx, actBtnSx, FONT } from "../utils/styles";
import { PLACEHOLDER, roleMeta } from "../utils/constants";
import { AppUser } from "../utils/types";
import RoleBadge from "./RoleBadge";

function initials(user: AppUser): string {
  const parts = [user.firstName, user.lastName].filter(Boolean) as string[];
  const src = parts.length ? parts : String(user.email ?? "؟").split("@");
  return src.slice(0, 2).map((w) => (w?.[0] ?? "").toUpperCase()).join("") || "؟";
}

interface UserTableRowProps {
  user: AppUser;
  checked: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserTableRow({ user, checked, onToggle, onEdit, onDelete }: UserTableRowProps) {
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || PLACEHOLDER;
  return (
    <tr>
      <td style={{ textAlign: "center" }}>
        <input type="checkbox" checked={checked} onChange={onToggle} />
      </td>
      <td>
        <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <Box sx={{ ...(userAvatarSx as object), background: roleMeta(user.userType).gradient }}>{initials(user)}</Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>{name}</Box>
            <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT, mt: "1px" }}>{user.email || PLACEHOLDER}</Box>
          </Box>
        </Box>
      </td>
      <td><RoleBadge userType={user.userType} /></td>
      <td><Box component="span" sx={{ fontSize: "12px", color: HX.tx3, fontFamily: FONT }}>{PLACEHOLDER}</Box></td>
      <td><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx3, fontFamily: FONT }}>{PLACEHOLDER}</Box></td>
      <td>
        <Box sx={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
          <Box component="button" type="button" title="تعديل" onClick={onEdit} sx={actBtnSx("edit")}>
            <EditOutlinedIcon />
          </Box>
          <Box component="button" type="button" title="حذف" onClick={onDelete} sx={actBtnSx("delete")}>
            <DeleteOutlineIcon />
          </Box>
        </Box>
      </td>
    </tr>
  );
}
