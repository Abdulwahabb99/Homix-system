import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const PRODUCT_SERVICE_PATH = path.join(ROOT, "app/modules/product/product.service.ts");

describe("ProductsService", () => {
  it("returns product types", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/product/product.service")>(
      PRODUCT_SERVICE_PATH,
      {
        "../../../src/infrastructure/database": {
          sequelize: {
            col: jest.fn(),
            fn: jest.fn(),
            where: jest.fn(),
          },
        },
        "../../../config/shopify": {},
        "../category/category.model": {},
        "../category/productCategory.model": {},
        "../helpers/shopifyHelper": {},
        "../vendor/vendor.model": {},
        "../vendor/vendor.service": {},
        "./product.model": {},
        "./productType.model": {
          findAll: jest.fn().mockResolvedValue([{ id: 1, name: "Table" }]),
        },
      },
    );

    await expect(service.getProductsTypes()).resolves.toEqual({
      data: [{ id: 1, name: "Table" }],
      status: true,
      statusCode: 200,
    });
  });

  it("builds total pages from findAndCountAll", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/product/product.service")>(
      PRODUCT_SERVICE_PATH,
      {
        "../../../src/infrastructure/database": {
          sequelize: {
            col: jest.fn(),
            fn: jest.fn().mockReturnValue("fn"),
            where: jest.fn().mockReturnValue("where"),
          },
        },
        "../../../config/shopify": {},
        "../category/category.model": {},
        "../category/productCategory.model": {
          findAll: jest.fn().mockResolvedValue([]),
        },
        "../helpers/shopifyHelper": {},
        "../vendor/vendor.model": {},
        "../vendor/vendor.service": {},
        "./product.model": {
          findAndCountAll: jest.fn().mockResolvedValue({
            count: 101,
            rows: [{ id: 1 }],
          }),
        },
        "./productType.model": {},
      },
    );

    await expect(service.getProducts(1, 50, "", [], [], [])).resolves.toEqual({
      data: {
        products: [{ id: 1 }],
        totalPages: 3,
      },
      status: true,
      statusCode: 200,
    });
  });

  it("returns categories", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/product/product.service")>(
      PRODUCT_SERVICE_PATH,
      {
        "../../../src/infrastructure/database": {
          sequelize: {
            col: jest.fn(),
            fn: jest.fn(),
            where: jest.fn(),
          },
        },
        "../../../config/shopify": {},
        "../category/category.model": {
          findAll: jest.fn().mockResolvedValue([{ id: 1, title: "Office" }]),
        },
        "../category/productCategory.model": {},
        "../helpers/shopifyHelper": {},
        "../vendor/vendor.model": {},
        "../vendor/vendor.service": {},
        "./product.model": {},
        "./productType.model": {},
      },
    );

    await expect(service.getAllCategories()).resolves.toEqual({
      data: [{ id: 1, title: "Office" }],
      status: true,
      statusCode: 200,
    });
  });
});
