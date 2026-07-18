/**
 * مجموعة صلاحيات واحدة (permissionsSummary.groups[]): ترويسة (أيقونة ملوّنة + اسم +
 * عدّاد مفعّل/إجمالي) + شبكة عناصر بعمودين. الأيقونات تُشتق من مفاتيح الـ API.
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  permIcoSx,
  permItemSx,
  permItemsSx,
  permLabelSx,
  permSecCountSx,
  permSecHeadSx,
  permSecIcoSx,
  permSecNameSx,
  permSectionSx,
  permStateSx,
} from "../utils/styles";
import { permGroupIcon, permItemIcon } from "../utils/icons";
import { GROUP_TONE, GROUP_TONE_FALLBACK, TONE_MAP } from "../utils/constants";
import { PermissionGroup } from "../utils/types";

const DIVIDER = `0.5px solid ${HX.border}`;

export default function PermissionSectionBlock({ group }: { group: PermissionGroup }) {
  const tone = TONE_MAP[GROUP_TONE[group.key] ?? GROUP_TONE_FALLBACK];
  const enabled = group.activeCount ?? group.items.filter((i) => i.enabled).length;
  const total = group.totalCount ?? group.items.length;
  const allOn = enabled === total;
  const count = allOn ? TONE_MAP.green : tone;

  // آخر صف (بعمودين) لا يحمل حداً سفلياً — مطابقة للتصميم
  const n = group.items.length;
  const lastRowStart = n % 2 === 0 ? n - 2 : n - 1;

  return (
    <Box sx={permSectionSx}>
      <Box sx={permSecHeadSx}>
        <Box sx={permSecIcoSx(tone.bg, tone.color)}>{permGroupIcon(group.key)}</Box>
        <Box sx={permSecNameSx}>{group.label}</Box>
        <Box component="span" sx={permSecCountSx(count.bg, allOn ? "#065f46" : count.color)}>
          {enabled}/{total}
        </Box>
      </Box>

      <Box sx={permItemsSx}>
        {group.items.map((item, i) => {
          const isSecondCol = i % 2 === 1;
          const isLastRow = i >= lastRowStart;
          return (
            <Box
              key={item.key}
              sx={{
                ...(permItemSx as object),
                borderBottom: isLastRow ? "none" : DIVIDER,
                borderInlineStart: { xs: "none", sm: isSecondCol ? DIVIDER : "none" },
              }}
            >
              <Box sx={permIcoSx}>{permItemIcon(item.key)}</Box>
              <Box sx={permLabelSx}>{item.label}</Box>
              <Box component="span" sx={permStateSx(item.enabled)}>
                {item.enabled ? "مفعّل" : "معطّل"}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
