/**
 * قسم صلاحيات واحد: ترويسة (أيقونة ملوّنة + اسم + عدّاد مفعّل/إجمالي) + شبكة عناصر بعمودين.
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
import { permActionIcon, permSectionIcon } from "../utils/icons";
import { TONE_MAP } from "../utils/constants";
import { PermissionSection } from "../utils/types";

const DIVIDER = `0.5px solid ${HX.border}`;

export default function PermissionSectionBlock({ section }: { section: PermissionSection }) {
  const tone = TONE_MAP[section.tone];
  const enabled = section.items.filter((i) => i.enabled).length;
  const total = section.items.length;
  const allOn = enabled === total;
  const count = allOn ? TONE_MAP.green : tone;

  // آخر صف (بعمودين) لا يحمل حداً سفلياً — مطابقة للتصميم
  const n = total;
  const lastRowStart = n % 2 === 0 ? n - 2 : n - 1;

  return (
    <Box sx={permSectionSx}>
      <Box sx={permSecHeadSx}>
        <Box sx={permSecIcoSx(tone.bg, tone.color)}>{permSectionIcon(section.key)}</Box>
        <Box sx={permSecNameSx}>{section.name}</Box>
        <Box component="span" sx={permSecCountSx(count.bg, allOn ? "#065f46" : count.color)}>
          {enabled}/{total}
        </Box>
      </Box>

      <Box sx={permItemsSx}>
        {section.items.map((item, i) => {
          const isSecondCol = i % 2 === 1;
          const isLastRow = i >= lastRowStart;
          return (
            <Box
              key={item.label}
              sx={{
                ...(permItemSx as object),
                borderBottom: isLastRow ? "none" : DIVIDER,
                borderInlineStart: { xs: "none", sm: isSecondCol ? DIVIDER : "none" },
              }}
            >
              <Box sx={permIcoSx}>{permActionIcon(item.action)}</Box>
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
