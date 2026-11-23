import axiosRequest from "shared/functions/axiosRequest";

const baseURI = `${process.env.REACT_APP_API_URL}`;

/** POST /products/system — منتج جديد من الصفر (بدون Shopify id). يرجع المنتج المُنشأ. */
export async function createSystemProduct(body: unknown) {
  const { data } = await axiosRequest.post(`${baseURI}/products/system`, body);
  return data.data;
}

/** POST /products/:id/duplicate — ينسخ المنتج إلى منتج نظام جديد مع التعديلات المُرسلة. */
export async function duplicateProduct(sourceId: number | string, body: unknown) {
  const { data } = await axiosRequest.post(`${baseURI}/products/${sourceId}/duplicate`, body);
  return data.data;
}

/** POST /products/image — يرفع صورة منتج (multipart، الحقل `image`) ويرجع رابطها العام لإرساله كـ `image`. */
export async function uploadProductImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("image", file);
  const { data } = await axiosRequest.post(`${baseURI}/products/image`, body);
  return data.data.url;
}
