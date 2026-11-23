import { orderProductKey, orderVariantKey } from "layouts/Products/productForm";

const toStr = (value: unknown): string | undefined =>
  value === undefined || value === null || value === "" ? undefined : String(value);

/**
 * بند الشحنة من المنتج المختار (خيار واحد في `variants[0]`).
 * يُرسل دائمًا `product_id` (Shopify id أو `local:<id>` لمنتج النظام) ليُنسب الطلب للمنتج والبائع الحقيقيين
 * بدل المنتج «custom»؛ ومعرّف الخيار المحلي لمنتج النظام ليحلّه الخادم.
 */
export function shipmentLineItem(product: any) {
  const variant = product?.variants?.[0] ?? {};
  const productKey = orderProductKey(product);
  return {
    title: product?.title,
    price: toStr(variant.price),
    quantity: 1,
    variant_id: toStr(orderVariantKey(variant)),
    ...(productKey ? { product_id: productKey } : {}),
  };
}
