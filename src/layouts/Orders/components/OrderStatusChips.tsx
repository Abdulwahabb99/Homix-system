import React from "react";
import { Chip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { deliveryStatusValues } from "layouts/Orders/utils/constants";

/** يطابق الـ API — نفس تسميات صفحة الطلبات */
const orderStatusValues: Record<number, string> = {
  1: "معلق",
  3: "مؤكد",
  4: "ملغي",
  2: "قيد التصنيع ",
  5: "تم التسليم",
  6: "مسترجع ",
  7: "مستبدل ",
  8: "في المخزن ",
};

type ChipPalette = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

function getOrderStatusPalette(status: number | undefined | null): ChipPalette {
  const s = Number(status);
  switch (s) {
    case 1:
      return "info";
    case 2:
      return "info";
    case 3:
      return "primary";
    case 4:
      return "error";
    case 5:
      return "success";
    case 6:
      return "secondary";
    case 7:
      return "warning";
    case 8:
      return "default";
    default:
      return "default";
  }
}

function getDeliveryStatusPalette(status: number | undefined | null): ChipPalette {
  const s = Number(status);
  if (s === 2) return "warning";
  if (s === 3) return "error";
  if (s === 1) return "success";
  return "default";
}

function chipSx(
  color: ChipPalette
): (t: {
  palette: Record<string, any> & { mode: string; text: { primary: string } };
}) => Record<string, unknown> {
  return (t) => {
    if (color === "default") {
      return {
        fontWeight: 600,
        fontSize: "0.72rem",
        height: 24,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: alpha(t.palette.text.primary, t.palette.mode === "dark" ? 0.12 : 0.06),
        color: "text.primary",
        "& .MuiChip-label": { px: 1 },
      };
    }
    const main = t.palette[color].main;
    return {
      fontWeight: 600,
      fontSize: "0.72rem",
      height: 24,
      border: `1px solid ${alpha(main, 0.4)}`,
      color: t.palette[color].dark,
      bgcolor: alpha(main, t.palette.mode === "dark" ? 0.22 : 0.14),
      "& .MuiChip-label": { px: 1 },
    };
  };
}

type OrderStatusChipProps = {
  status: number | undefined | null;
  size?: "small" | "medium";
};

/** شارة حالة الطلب — ألوان متناسقة مع ثيم homix (primary / الحالات) */
export function OrderStatusChip({ status, size = "small" }: OrderStatusChipProps) {
  const theme = useTheme();
  const num = Number(status);
  const label = (orderStatusValues[num] || "—").trim();
  const color = getOrderStatusPalette(status);
  return <Chip size={size} label={label} sx={chipSx(color)(theme)} />;
}

type DeliveryStatusChipProps = {
  deliveryStatus: number | undefined | null;
  size?: "small" | "medium";
};

/** شارة حالة التسليم (في المدة، متأخر، …) */
export function DeliveryStatusChip({ deliveryStatus, size = "small" }: DeliveryStatusChipProps) {
  const theme = useTheme();
  const label = (deliveryStatusValues[Number(deliveryStatus)] || "—").replace(/\s+$/, "");
  const color = getDeliveryStatusPalette(deliveryStatus);
  return <Chip size={size} label={label} sx={chipSx(color)(theme)} />;
}
