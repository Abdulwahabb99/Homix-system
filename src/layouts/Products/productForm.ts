/**
 * منتجات النظام (جديدة أو منسوخة): دوال نقية للنموذج والتحقق وبناء الحمولة.
 * لا Shopify id لها — يُشار إليها في الطلب بمفتاح `local:<id>`.
 */

export interface ProductFormVariant {
  title: string;
  /** يُترك فارغاً ليولّد الخادم كوداً فريداً */
  sku: string;
  price: string;
  cost: string;
  color: string;
  size: string;
  material: string;
}

export interface ProductForm {
  title: string;
  vendorId: number | "";
  typeId: number | "";
  image: string;
  variants: ProductFormVariant[];
}

export const LOCAL_PRODUCT_PREFIX = "local:";

export function emptyVariant(): ProductFormVariant {
  return { title: "", sku: "", price: "", cost: "", color: "", size: "", material: "" };
}

export function emptyProductForm(): ProductForm {
  return { title: "", vendorId: "", typeId: "", image: "", variants: [emptyVariant()] };
}

const text = (value: unknown): string => (value === null || value === undefined ? "" : String(value));

/** يبني نموذج النسخ من منتج موجود: كل القيم منسوخة والأكواد فارغة (يولّدها الخادم فريدة). */
export function productToForm(product: any, options: { keepSku?: boolean } = {}): ProductForm {
  const variants: any[] = Array.isArray(product?.variants) && product.variants.length ? product.variants : [{}];
  return {
    title: text(product?.title),
    vendorId: Number(product?.vendorId) > 0 ? Number(product.vendorId) : "",
    typeId: Number(product?.typeId) > 0 ? Number(product.typeId) : "",
    image: /^(https?:)?\/\//.test(text(product?.image)) ? text(product.image) : "",
    variants: variants.map((variant) => ({
      title: variant?.title === "Default Title" ? "" : text(variant?.title),
      sku: options.keepSku ? text(variant?.sku) : "",
      price: text(variant?.price),
      cost: text(variant?.cost),
      color: text(variant?.color),
      size: text(variant?.size),
      material: text(variant?.material),
    })),
  };
}

export type ProductFormErrors = Partial<Record<"title" | "vendorId" | "variants", string>>;

const isMoney = (value: string): boolean => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;

export function validateProductForm(form: ProductForm): ProductFormErrors {
  const errors: ProductFormErrors = {};
  if (!form.title.trim()) errors.title = "اسم المنتج مطلوب";
  if (!form.vendorId) errors.vendorId = "اختر البائع";
  if (form.variants.length === 0) {
    errors.variants = "أضف خياراً واحداً على الأقل";
  } else if (form.variants.some((variant) => !isMoney(variant.price))) {
    errors.variants = "السعر مطلوب ويجب أن يكون رقماً صحيحاً غير سالب";
  } else if (form.variants.some((variant) => variant.cost.trim() !== "" && !isMoney(variant.cost))) {
    errors.variants = "سعر التكلفة يجب أن يكون رقماً غير سالب";
  } else {
    const skus = form.variants.map((variant) => variant.sku.trim().toLowerCase()).filter(Boolean);
    if (new Set(skus).size !== skus.length) errors.variants = "أكواد الخيارات يجب ألا تتكرر";
  }
  return errors;
}

const optional = (value: string): string | null => (value.trim() ? value.trim() : null);

/**
 * يبني حمولة الإنشاء/النسخ. التكلفة لا تُرسل إلا لمن يملك صلاحية التفاصيل المالية
 * (الخادم يرفض 403 تغييرها لغيره)، والكود الفارغ لا يُرسل أصلاً ليُولَّد تلقائياً.
 */
export function buildProductPayload(form: ProductForm, options: { canEditFinancials: boolean }) {
  return {
    title: form.title.trim(),
    vendorId: Number(form.vendorId),
    typeId: form.typeId ? Number(form.typeId) : null,
    image: optional(form.image),
    variants: form.variants.map((variant) => ({
      title: optional(variant.title),
      ...(variant.sku.trim() ? { sku: variant.sku.trim() } : {}),
      price: Number(variant.price),
      ...(options.canEditFinancials && variant.cost.trim() !== "" ? { cost: Number(variant.cost) } : {}),
      color: optional(variant.color),
      size: optional(variant.size),
      material: optional(variant.material),
    })),
  };
}

/** مفتاح المنتج في بند الطلب: Shopify id، أو `local:<id>` لمنتج النظام. */
export function orderProductKey(product: any): string {
  if (product?.shopifyId) return String(product.shopifyId);
  return product?.id ? `${LOCAL_PRODUCT_PREFIX}${product.id}` : "";
}

/** معرّف الخيار في بند الطلب: Shopify id للخيار أو المعرّف المحلي لخيار منتج النظام. */
export function orderVariantKey(variant: any): string {
  return text(variant?.shopifyId ?? variant?.id);
}

/** رسالة خطأ عربية مناسبة من ردّ الخادم (409 كود مكرر، 403 صلاحية مالية...). */
export function productSaveErrorMessage(error: any): string {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;
  if (status === 409 || status === 403 || status === 400) {
    if (serverMessage && /[؀-ۿ]/.test(serverMessage)) return serverMessage;
  }
  if (status === 409) return "كود المنتج مستخدم بالفعل";
  if (status === 403) return "ليس لديك صلاحية لهذا الإجراء";
  if (status === 400) return "تحقق من بيانات المنتج";
  return "حدث خطأ أثناء حفظ المنتج";
}
