import {
  buildProductPayload,
  emptyProductForm,
  orderProductKey,
  orderVariantKey,
  productSaveErrorMessage,
  productToForm,
  validateProductForm,
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
