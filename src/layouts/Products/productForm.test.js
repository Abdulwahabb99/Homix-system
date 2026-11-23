import {
  buildProductPayload,
  emptyProductForm,
  orderProductKey,
  orderVariantKey,
  productSaveErrorMessage,
  productToForm,
  isDefaultProductImage,
  productImageUploadErrorMessage,
  validateProductForm,
  validateProductImageFile,
} from "./productForm";

const shopifyProduct = {
  id: 7,
  title: "دريسينج",
  vendorId: 4,
  typeId: 3,
  image: "https://cdn/x.png",
  shopifyId: "7001",
  variants: [{ title: "أبيض", sku: "RKA-001", price: "500.00", cost: 100, color: "أبيض", size: "L", material: "خشب", shopifyId: "8001" }],
};

describe("productToForm (duplicate prefill)", () => {
  it("copies the editable fields and blanks the sku so the server generates a unique one", () => {
    const form = productToForm(shopifyProduct);
    expect(form).toMatchObject({ title: "دريسينج", vendorId: 4, typeId: 3, image: "https://cdn/x.png" });
    expect(form.variants[0]).toEqual({ title: "أبيض", sku: "", price: "500.00", cost: "100", color: "أبيض", size: "L", material: "خشب" });
  });

  it("drops non-URL images (the default upload path) and the Shopify placeholder title", () => {
    const form = productToForm({ ...shopifyProduct, image: "/uploads/default-product.png", variants: [{ title: "Default Title", price: 5 }] });
    expect(form.image).toBe("");
    expect(form.variants[0].title).toBe("");
  });

  it("falls back to one empty variant for a product without variants", () => {
    expect(productToForm({ title: "x" }).variants).toHaveLength(1);
  });
});

describe("validateProductForm", () => {
  const valid = () => ({ ...emptyProductForm(), title: "منتج", vendorId: 4, variants: [{ ...emptyProductForm().variants[0], price: "10" }] });

  it("accepts a minimal valid form", () => {
    expect(validateProductForm(valid())).toEqual({});
  });
  it("requires title, vendor and a valid price", () => {
    expect(validateProductForm(emptyProductForm())).toMatchObject({ title: expect.any(String), vendorId: expect.any(String), variants: expect.any(String) });
    const negative = valid();
    negative.variants[0].price = "-1";
    expect(validateProductForm(negative).variants).toBeTruthy();
  });
  it("rejects repeated codes and a bad cost", () => {
    const dup = valid();
    dup.variants = [{ ...dup.variants[0], sku: "A" }, { ...dup.variants[0], sku: "a" }];
    expect(validateProductForm(dup).variants).toBeTruthy();
    const badCost = valid();
    badCost.variants[0].cost = "abc";
    expect(validateProductForm(badCost).variants).toBeTruthy();
  });
});

describe("buildProductPayload", () => {
  const form = { ...productToForm(shopifyProduct), title: " اسم جديد " };
  it("omits an empty sku and trims", () => {
    const payload = buildProductPayload(form, { canEditFinancials: true });
    expect(payload.title).toBe("اسم جديد");
    expect(payload.variants[0]).not.toHaveProperty("sku");
    expect(payload.variants[0]).toMatchObject({ price: 500, cost: 100 });
  });
  it("sends an explicit sku", () => {
    const withSku = { ...form, variants: [{ ...form.variants[0], sku: " MY-1 " }] };
    expect(buildProductPayload(withSku, { canEditFinancials: true }).variants[0].sku).toBe("MY-1");
  });
  it("never sends cost without the financial permission", () => {
    expect(buildProductPayload(form, { canEditFinancials: false }).variants[0]).not.toHaveProperty("cost");
  });
  it("maps blanks to null", () => {
    const payload = buildProductPayload({ ...form, typeId: "", image: "" }, { canEditFinancials: false });
    expect(payload.typeId).toBeNull();
    expect(payload.image).toBeNull();
  });
});

describe("order keys", () => {
  it("uses the Shopify id when there is one", () => {
    expect(orderProductKey(shopifyProduct)).toBe("7001");
    expect(orderVariantKey(shopifyProduct.variants[0])).toBe("8001");
  });
  it("uses local:<id> and the local variant id for system products", () => {
    expect(orderProductKey({ id: 12, shopifyId: null })).toBe("local:12");
    expect(orderVariantKey({ id: "local-ab12cd34" })).toBe("local-ab12cd34");
  });
});

describe("productSaveErrorMessage", () => {
  it("prefers the Arabic server message", () => {
    expect(productSaveErrorMessage({ response: { status: 409, data: { message: "كود المنتج X مستخدم بالفعل" } } })).toBe("كود المنتج X مستخدم بالفعل");
  });
  it("falls back per status", () => {
    expect(productSaveErrorMessage({ response: { status: 409, data: { message: "Resource conflict" } } })).toBe("كود المنتج مستخدم بالفعل");
    expect(productSaveErrorMessage({ response: { status: 403 } })).toBe("ليس لديك صلاحية لهذا الإجراء");
    expect(productSaveErrorMessage(new Error("x"))).toBe("حدث خطأ أثناء حفظ المنتج");
  });
});

describe("product image upload helpers", () => {
  it("accepts the four image types up to 5MB", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
      expect(validateProductImageFile({ type, size: 1024 })).toBeNull();
    }
    expect(validateProductImageFile({ type: "image/png", size: 5 * 1024 * 1024 })).toBeNull();
  });
  it("rejects other types, oversize files and no file, in Arabic", () => {
    expect(validateProductImageFile({ type: "application/pdf", size: 10 })).toBe("الملف لازم يكون صورة (JPG/PNG/WEBP/GIF)");
    expect(validateProductImageFile({ type: "image/svg+xml", size: 10 })).toBeTruthy();
    expect(validateProductImageFile({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).toBe("حجم الصورة أكبر من 5 ميجا");
    expect(validateProductImageFile(null)).toBe("اختر صورة للرفع");
  });
  it("recognises the default placeholder image", () => {
    expect(isDefaultProductImage("https://api.example.com/uploads/default-product.png")).toBe(true);
    expect(isDefaultProductImage("https://api.example.com/uploads/products/a.png")).toBe(false);
  });
  it("maps upload failures to Arabic messages", () => {
    expect(productImageUploadErrorMessage({ response: { status: 413, data: { message: "حجم الصورة أكبر من 5 ميجا" } } })).toBe("حجم الصورة أكبر من 5 ميجا");
    expect(productImageUploadErrorMessage({ response: { status: 413, data: {} } })).toBe("حجم الصورة أكبر من 5 ميجا");
    expect(productImageUploadErrorMessage({ response: { status: 403, data: {} } })).toBe("ليس لديك صلاحية لرفع الصور");
    expect(productImageUploadErrorMessage({ response: { status: 400, data: {} } })).toBe("الملف لازم يكون صورة (JPG/PNG/WEBP/GIF)");
    expect(productImageUploadErrorMessage(new Error("net"))).toBe("تعذر رفع الصورة");
  });
  it("sends the uploaded URL as image, and null when removed", () => {
    const form = { ...emptyProductForm(), title: "x", vendorId: 4, image: "https://api.example.com/uploads/products/a.png", variants: [{ ...emptyProductForm().variants[0], price: "5" }] };
    expect(buildProductPayload(form, { canEditFinancials: false }).image).toBe(form.image);
    expect(buildProductPayload({ ...form, image: "" }, { canEditFinancials: false }).image).toBeNull();
  });
});
