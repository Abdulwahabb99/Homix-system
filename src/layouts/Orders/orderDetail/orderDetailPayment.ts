const PAYMENT_STATUS = { 2: "مدفوع", 1: "دفع عند الاستلام" } as const;

export function getOrderDetailPaymentLabel(status: number | string | null | undefined): string {
  if (status == null || status === "") return "";
  const n = Number(status);
  return (PAYMENT_STATUS as Record<number, string>)[n] ?? "";
}
