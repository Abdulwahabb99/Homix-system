import { HX } from "layouts/Orders/ordersHomixTheme";

export const FONT = "'Cairo', sans-serif";

/** Badge palette per shipment status id (matches /shipments/meta status ids). */
export const STATUS_COLORS: Record<number, { bg: string; color: string; dot: string }> = {
  1:  { bg: HX.amberLight,  color: "#92400e", dot: HX.amber },   // معلقة
  2:  { bg: HX.blueLight,   color: "#1e40af", dot: HX.blue },    // في المخزن
  3:  { bg: HX.tealLight,   color: "#0f766e", dot: HX.teal },    // جاهزة للشحن
  4:  { bg: HX.greenLight,  color: "#065f46", dot: HX.green },   // تم التسليم
  5:  { bg: HX.surface3,    color: HX.tx2,    dot: HX.tx3 },     // ملغية
  6:  { bg: HX.redLight,    color: "#991b1b", dot: HX.red },     // مرفوضة
  7:  { bg: HX.roseLight,   color: "#9f1239", dot: HX.rose },    // مسترجع من العميل
  8:  { bg: HX.purpleLight, color: "#5b21b6", dot: HX.purple },  // مرتجع للمورد
  9:  { bg: HX.accentLight, color: "#3730a3", dot: HX.accent },  // مستبدل
  10: { bg: HX.redLight,    color: "#7f1d1d", dot: HX.red },     // فشل في التوصيل
  11: { bg: HX.blueLight,   color: "#1e40af", dot: HX.blue },    // شحنة مجدولة
  12: { bg: HX.tealLight,   color: "#0f766e", dot: HX.teal },    // خرجت للتوصيل
};

/** Colors for the "payment status" badge. `2` = مدفوع, otherwise دفع عند الاستلام. */
export function getPaymentBadgeColors(paymentStatus: number): { bg: string; color: string } {
  return paymentStatus === 2
    ? { bg: HX.greenLight, color: "#065f46" }
    : { bg: HX.amberLight, color: "#92400e" };
}

/** Colors for the "shipment type" badge. `grouped` = شحن مجمع, otherwise منفصل. */
export function getTypeBadgeColors(shipmentType: string): { bg: string; color: string } {
  return shipmentType === "grouped"
    ? { bg: HX.blueLight, color: "#1e40af" }
    : { bg: HX.tealLight, color: "#0f766e" };
}
