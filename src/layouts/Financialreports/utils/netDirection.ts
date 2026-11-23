/**
 * اتجاه «صافي المستحق» الموقّع (نموذج السداد المرجعي):
 * الصافي = Σ مستحق البائع (إجمالي) − Σ مستحق هوميكس − Σ الغرامات (+ تعديلات يدوية).
 * > 0 هوميكس تدفع للبائع (أخضر)، < 0 البائع يدفع لهوميكس (أحمر)، 0 لا مستحقات (رمادي).
 * دوال نقية بلا React.
 */
import type { Tone } from "./styles";

export type NetDirection = "vendor" | "homix" | "settled";

export const roundMoney = (value: unknown): number => Math.round((Number(value) || 0) * 100) / 100;

export const netDirectionOf = (net: number): NetDirection => {
  const rounded = roundMoney(net);
  return rounded > 0 ? "vendor" : rounded < 0 ? "homix" : "settled";
};

/** «صافي المستحق للبائع» / «صافي المستحق لهوميكس» / «لا يوجد مستحق» */
export const NET_LABELS: Record<NetDirection, string> = {
  vendor: "صافي المستحق للبائع",
  homix: "صافي المستحق لهوميكس",
  settled: "لا يوجد مستحق",
};

export const netLabelOf = (net: number): string => NET_LABELS[netDirectionOf(net)];

/** أخضر للبائع، أحمر لهوميكس، افتراضي (رمادي) عند الصفر */
export const netToneOf = (net: number): Tone => {
  const direction = netDirectionOf(net);
  return direction === "vendor" ? "green" : direction === "homix" ? "red" : "default";
};

/** حالة «تم التحويل» تتبع الاتجاه: للبائع / استلام من البائع */
export const transferredLabelOf = (net: number): string => {
  const direction = netDirectionOf(net);
  return direction === "vendor" ? "تم التحويل للبائع" : direction === "homix" ? "تم استلام التحويل من البائع" : "تم التحويل";
};
