/**
 * خلايا عرض صغيرة مُعاد استخدامها داخل جداول تفاصيل التسويات.
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { money } from "../utils/calc";
import { PAY_LABELS } from "../utils/constants";
import { opIdSx, prodCodeSx, payBadgeSx, amountCellSx, toneColor, Tone, FONT } from "../utils/styles";
import { PayMethod } from "../utils/types";

/** خلية مبلغ في الصف الرئيسي للصانع (عمود شبكة، محاذاة للنهاية) */
export function Amount({ children, tone = "default" }: { children: React.ReactNode; tone?: Tone }) {
  return <Box sx={amountCellSx(tone)}>{children}</Box>;
}

/** خلية غرامة الصف الرئيسي — حمراء إن وُجدت، وإلا «لا يوجد» باهتة */
export function AmountFine({ value }: { value: number }) {
  return value > 0 ? (
    <Box sx={amountCellSx("red")}>{money(value)}</Box>
  ) : (
    <Box sx={{ fontSize: "13px", fontWeight: 400, color: HX.tx3, textAlign: "end", fontFamily: FONT }}>لا يوجد</Box>
  );
}

/** رقم العملية — OP-2401 */
export function OpId({ children }: { children: React.ReactNode }) {
  return <Box component="span" sx={opIdSx}>{children}</Box>;
}

/** نص باهت (رقم الطلب مثلاً) */
export function Muted({ children }: { children: React.ReactNode }) {
  return <Box component="span" sx={{ color: HX.tx2 }}>{children}</Box>;
}

/** كود المنتج داخل رقاقة monospace */
export function ProdCode({ children }: { children: React.ReactNode }) {
  return <Box component="span" sx={prodCodeSx}>{children}</Box>;
}

/** مبلغ منسّق بلون/سماكة اختيارية */
export function Money({ value, tone = "default", bold }: { value: number; tone?: Tone; bold?: boolean }) {
  return <Box component="span" sx={{ color: toneColor(tone), fontWeight: bold ? 700 : 400 }}>{money(value)}</Box>;
}

/** شارة طريقة الدفع */
export function PayBadge({ pay }: { pay: PayMethod }) {
  return <Box component="span" sx={payBadgeSx(pay)}>{PAY_LABELS[pay]}</Box>;
}

/** خلية الغرامة — حمراء إن وُجدت، وإلا شرطة باهتة */
export function FineCell({ value }: { value: number }) {
  return value > 0 ? (
    <Box component="span" sx={{ color: HX.red, fontWeight: 700 }}>{money(value)}</Box>
  ) : (
    <Box component="span" sx={{ color: HX.tx3 }}>—</Box>
  );
}
