/**
 * حفظ استجابة ملف (blob) من الـ API كتنزيل، بلا تنقّل في المتصفّح.
 *
 * لماذا هذا الملف: طلب XHR/fetch لا يحفظ الملف على الجهاز تلقائياً، والحل القديم
 * كان `window.location.href = responseURL` — وهو تنقّل كامل لا يحمل هيدر
 * Authorization، فيصل الطلب الثاني للسيرفر بلا توكن (ويتجاهل الملف الذي نزل
 * بالفعل في الطلب الأول). هنا نستخدم نفس استجابة الطلب المُوثّق ونبني منها
 * رابطاً مؤقّتاً — طلب واحد فقط.
 *
 * الاستخدام:
 *   const res = await axiosRequest.get(url, { responseType: "blob" });
 *   downloadBlobResponse(res, "orders.xlsx");
 */

/** اسم الملف من هيدر Content-Disposition إن أرسله السيرفر */
function filenameFromDisposition(disposition: unknown): string | null {
  if (typeof disposition !== "string" || !disposition) return null;

  // الصيغة المُرمَّزة أولاً: filename*=UTF-8''report%20.xlsx
  const encoded = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disposition);
  if (encoded?.[1]) {
    const raw = encoded[1].trim().replace(/^"|"$/g, "");
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain?.[1]?.trim() || null;
}

export interface BlobResponseLike {
  data: Blob;
  headers?: Record<string, unknown>;
}

/**
 * @param response استجابة axios مع `responseType: "blob"`
 * @param fallbackName الاسم المستخدم إن لم يُرسل السيرفر Content-Disposition
 */
export function downloadBlobResponse(response: BlobResponseLike, fallbackName: string): void {
  const name = filenameFromDisposition(response.headers?.["content-disposition"]) ?? fallbackName;

  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  // بعض المتصفّحات تتطلّب وجود العنصر في الصفحة قبل النقر البرمجي
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
