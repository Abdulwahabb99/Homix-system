/**
 * «توصيل مجمع»: تغيير نوع الشحنة لطلب يطبّقه الباك إند على الطلبات المرتبطة (نفس رقم الطلب)،
 * ويعيد معرّفاتها في `linkedOrderIds` — داخل `data` في تعديل شحنة/طلب واحد وتعديل الشحنات الجماعي،
 * وعلى مستوى الجذر في تعديل الطلبات الجماعي. لا يعيدها إن لم يتأثر أي طلب مرتبط.
 */
export function getLinkedOrderIds(responseBody: unknown): number[] {
  const body = responseBody as { data?: { linkedOrderIds?: unknown }; linkedOrderIds?: unknown } | null | undefined;
  const raw = body?.data?.linkedOrderIds ?? body?.linkedOrderIds;
  return Array.isArray(raw) ? raw.map(Number).filter((id) => Number.isFinite(id) && id > 0) : [];
}

export function linkedOrdersToastMessage(count: number): string | null {
  return count > 0 ? `تم تحديث ${count} طلب مرتبط` : null;
}
