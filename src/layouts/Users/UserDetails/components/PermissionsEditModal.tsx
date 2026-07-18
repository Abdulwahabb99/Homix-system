/**
 * نافذة تعديل الصلاحيات: تعرض المجموعات نفسها (permissionsSummary.groups) مع مفتاح تبديل
 * لكل صلاحية + مفتاح لتفعيل/تعطيل المجموعة كاملة، وعدّاد حيّ. الحفظ عبر `PUT /users/:id`.
 */
import React, { useEffect, useMemo, useState } from "react";
import { Box, Dialog, IconButton, Switch, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { userKeys } from "query/keys";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  FONT,
  permEditRowLabelSx,
  permEditRowSx,
  permHeaderBadgeSx,
  permSecCountSx,
  permSecHeadSx,
  permSecIcoSx,
  permSecNameSx,
  permSwitchSx,
} from "../utils/styles";
import { permGroupIcon, permItemIcon } from "../utils/icons";
import { GROUP_TONE, GROUP_TONE_FALLBACK, TONE_MAP } from "../utils/constants";
import { PermissionsSummary } from "../utils/types";

interface PermissionsEditModalProps {
  open: boolean;
  onClose: () => void;
  userId: number | string;
  summary: PermissionsSummary;
}

/** بناء خريطة المفاتيح الأولية من الملخّص */
function initialPerms(summary: PermissionsSummary): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  (summary?.groups ?? []).forEach((g) => g.items.forEach((it) => { map[it.key] = it.enabled; }));
  return map;
}

export default function PermissionsEditModal({ open, onClose, userId, summary }: PermissionsEditModalProps) {
  const queryClient = useQueryClient();
  const groups = summary?.groups ?? [];
  const [perms, setPerms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) setPerms(initialPerms(summary));
  }, [open, summary]);

  const activeCount = useMemo(() => Object.values(perms).filter(Boolean).length, [perms]);
  const totalCount = useMemo(() => Object.keys(perms).length, [perms]);

  const toggleItem = (key: string) => setPerms((p) => ({ ...p, [key]: !p[key] }));
  const toggleGroup = (keys: string[], value: boolean) =>
    setPerms((p) => {
      const next = { ...p };
      keys.forEach((k) => { next[k] = value; });
      return next;
    });

  const saveMutation = useMutation({
    mutationFn: (permissions: Record<string, boolean>) =>
      axiosRequest.put(`/users/${userId}`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      NotificationMeassage("success", "تم تحديث الصلاحيات بنجاح");
      onClose();
    },
    onError: () => NotificationMeassage("error", "حدث خطأ"),
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dir="rtl"
      PaperProps={{ sx: { borderRadius: "16px", width: 600, maxWidth: "94vw", fontFamily: FONT } }}
    >
      {/* Head */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: HX.accentLight, color: HX.accent, "& svg": { fontSize: 16 } }}>
            <ShieldOutlinedIcon />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>إدارة الصلاحيات</Typography>
            <Typography sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT }}>فعّل أو عطّل صلاحيات المستخدم</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} aria-label="إغلاق"
          sx={{ width: 28, height: 28, borderRadius: "7px", border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx2,
            "&:hover": { bgcolor: HX.redLight, borderColor: HX.red, color: HX.red } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* عدّاد حيّ */}
      <Box sx={{ px: "20px", py: "12px", borderBottom: `0.5px solid ${HX.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "12px", color: HX.tx2, fontFamily: FONT }}>الصلاحيات المفعّلة</Typography>
        <Box component="span" sx={permHeaderBadgeSx}>{activeCount} / {totalCount}</Box>
      </Box>

      {/* Body */}
      <Box sx={{ maxHeight: "62vh", overflowY: "auto" }}>
        {groups.map((group) => {
          const tone = TONE_MAP[GROUP_TONE[group.key] ?? GROUP_TONE_FALLBACK];
          const keys = group.items.map((i) => i.key);
          const enabled = keys.filter((k) => perms[k]).length;
          const allOn = enabled === keys.length && keys.length > 0;
          const count = allOn ? TONE_MAP.green : tone;
          return (
            <Box key={group.key}>
              <Box sx={permSecHeadSx}>
                <Box sx={permSecIcoSx(tone.bg, tone.color)}>{permGroupIcon(group.key)}</Box>
                <Box sx={permSecNameSx}>{group.label}</Box>
                <Box component="span" sx={permSecCountSx(count.bg, allOn ? "#065f46" : count.color)}>
                  {enabled}/{keys.length}
                </Box>
                <Switch
                  size="small"
                  checked={allOn}
                  onChange={(e) => toggleGroup(keys, e.target.checked)}
                  sx={permSwitchSx}
                />
              </Box>
              {group.items.map((item) => (
                <Box key={item.key} sx={permEditRowSx}>
                  <Box sx={{ width: 22, height: 22, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, bgcolor: perms[item.key] ? HX.accentLight : HX.surface3, color: perms[item.key] ? HX.accent : HX.tx3, "& svg": { fontSize: 11 } }}>
                    {permItemIcon(item.key)}
                  </Box>
                  <Box sx={permEditRowLabelSx}>{item.label}</Box>
                  <Switch
                    size="small"
                    checked={Boolean(perms[item.key])}
                    onChange={() => toggleItem(item.key)}
                    sx={permSwitchSx}
                  />
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>

      {/* Foot */}
      <Box sx={{ p: "14px 20px", borderTop: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <Box component="button" type="button" onClick={onClose}
          sx={{ px: "14px", height: 32, border: `0.5px solid ${HX.border}`, borderRadius: "8px", fontSize: "12px", fontWeight: 600, fontFamily: FONT, cursor: "pointer", bgcolor: "transparent", color: HX.tx2, "&:hover": { borderColor: HX.red, color: HX.red } }}>
          إلغاء
        </Box>
        <Box component="button" type="button" onClick={() => saveMutation.mutate(perms)}
          sx={{ display: "inline-flex", alignItems: "center", gap: "5px", px: "18px", height: 32, border: "none", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, fontFamily: FONT, cursor: "pointer", bgcolor: HX.accent, color: "#fff", opacity: saveMutation.isPending ? 0.7 : 1, "&:hover": { bgcolor: "#5254e0" }, "& svg": { fontSize: 15 } }}>
          <CheckIcon /> حفظ الصلاحيات
        </Box>
      </Box>
    </Dialog>
  );
}
